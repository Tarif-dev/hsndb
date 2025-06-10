// server.js
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const xml2js = require("xml2js");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Configuration
const BLAST_DB_PATH = path.join(__dirname, "blastdb", "hsndb");
const TEMP_DIR = path.join(__dirname, "temp");
const BLAST_BIN_PATH =
  process.env.BLAST_BIN_PATH || "C:\\Program Files\\NCBI\\blast-2.16.0+\\bin\\"; // Add path to BLAST+ binaries if needed

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Store for job status (in production, use Redis or database)
const jobStore = new Map();

// BLAST search endpoint
app.post("/api/blast/submit", async (req, res) => {
  try {
    const {
      sequence,
      algorithm = "blastp",
      evalue = 10,
      maxTargetSeqs = 50,
      matrix = "BLOSUM62",
      wordSize,
      gapOpen,
      gapExtend,
    } = req.body;

    console.log("Received BLAST request:", {
      algorithm,
      evalue,
      maxTargetSeqs,
    });

    if (!sequence) {
      return res.status(400).json({ error: "Sequence is required" });
    }

    // Validate sequence
    const validation = validateSequence(sequence);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const jobId = uuidv4();

    // Initialize job status
    jobStore.set(jobId, {
      jobId,
      status: "pending",
      progress: 0,
      startTime: Date.now(),
    });

    // Process BLAST search asynchronously
    processBlastSearch(jobId, {
      sequence,
      algorithm,
      evalue,
      maxTargetSeqs,
      matrix,
      wordSize,
      gapOpen,
      gapExtend,
    });

    res.json({ jobId });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get job status endpoint
app.get("/api/blast/status/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = jobStore.get(jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
});

// Get results endpoint
app.get("/api/blast/results/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = jobStore.get(jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.status !== "completed") {
    return res
      .status(202)
      .json({ message: "Job not completed yet", status: job.status });
  }

  if (!job.results) {
    return res.status(404).json({ error: "No results available" });
  }

  res.json(job.results);
});

// Process BLAST search
async function processBlastSearch(jobId, params) {
  try {
    // Update job status
    updateJobStatus(jobId, { status: "running", progress: 10 });

    const {
      sequence,
      algorithm,
      evalue,
      maxTargetSeqs,
      matrix,
      wordSize,
      gapOpen,
      gapExtend,
    } = params;

    // Create temporary input file
    const inputFile = path.join(TEMP_DIR, `query_${jobId}.fasta`);
    const outputFile = path.join(TEMP_DIR, `results_${jobId}.xml`);

    // Clean sequence and create FASTA format
    const cleanSequence = sequence.replace(/\s/g, "").replace(/>/g, "");
    const fastaContent = `>query\n${cleanSequence}`;
    fs.writeFileSync(inputFile, fastaContent);

    updateJobStatus(jobId, { progress: 30 });

    // Build BLAST command
    const blastCommand = buildBlastCommand({
      algorithm,
      inputFile,
      outputFile,
      evalue,
      maxTargetSeqs,
      matrix,
      wordSize,
      gapOpen,
      gapExtend,
    });

    console.log("Executing BLAST command:", blastCommand);
    updateJobStatus(jobId, { progress: 50 });

    // Execute BLAST
    await executeBlastCommand(blastCommand);
    updateJobStatus(jobId, { progress: 80 });

    // Parse results
    const xmlResults = fs.readFileSync(outputFile, "utf8");
    const parsedResults = await parseBlastXML(xmlResults, cleanSequence);
    updateJobStatus(jobId, { progress: 95 });

    // Clean up temporary files
    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);

    // Store results and mark as completed
    updateJobStatus(jobId, {
      status: "completed",
      progress: 100,
      results: parsedResults,
      completedTime: Date.now(),
    });
  } catch (error) {
    console.error("BLAST execution error:", error);
    updateJobStatus(jobId, {
      status: "failed",
      error: error.message,
    });
  }
}

// Build BLAST command
function buildBlastCommand(params) {
  const {
    algorithm,
    inputFile,
    outputFile,
    evalue,
    maxTargetSeqs,
    matrix,
    wordSize,
    gapOpen,
    gapExtend,
  } = params;

  const executable = `"${path.join(BLAST_BIN_PATH, algorithm)}"`;

  let cmd = [
    executable,
    "-query",
    `"${inputFile}"`,
    "-db",
    `"${BLAST_DB_PATH}"`,
    "-evalue",
    evalue,
    "-max_target_seqs",
    maxTargetSeqs,
    "-outfmt",
    "5",
    "-out",
    `"${outputFile}"`,
  ];

  if (matrix && algorithm === "blastp") {
    cmd.push("-matrix", matrix);
  }

  if (wordSize) {
    cmd.push("-word_size", wordSize);
  }

  if (gapOpen !== undefined) {
    cmd.push("-gapopen", gapOpen);
  }

  if (gapExtend !== undefined) {
    cmd.push("-gapextend", gapExtend);
  }

  return cmd.join(" ");
}

// Execute BLAST command
function executeBlastCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error("BLAST execution failed:", error);
        console.error("stderr:", stderr);
        reject(new Error(`BLAST execution failed: ${error.message}`));
      } else {
        console.log("BLAST completed successfully");
        resolve(stdout);
      }
    });
  });
}

// Parse BLAST XML results
async function parseBlastXML(xmlData, querySequence) {
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    const blastOutput = result["BlastOutput"];
    const iterations = blastOutput["BlastOutput_iterations"][0]["Iteration"];

    if (!iterations || iterations.length === 0) {
      return createEmptyResult(querySequence);
    }

    const iteration = iterations[0];
    const hits = iteration["Iteration_hits"][0]["Hit"] || [];

    const parsedHits = hits
      .map((hit) => parseBlastHit(hit, querySequence))
      .filter(Boolean);

    // Get statistics
    const stats = iteration["Iteration_stat"][0]["Statistics"][0];

    return {
      jobId: uuidv4(),
      queryLength: querySequence.length,
      databaseSize: 4533,
      totalHits: parsedHits.length,
      hits: parsedHits,
      statistics: {
        kappa: parseFloat(stats["Statistics_kappa"][0]) || 0.041,
        lambda: parseFloat(stats["Statistics_lambda"][0]) || 0.267,
        entropy: parseFloat(stats["Statistics_entropy"][0]) || 0.14,
        database: "HSNDB",
        databaseVersion: "2024.1",
        totalSequences: 4533,
      },
      executionTime: Math.round((Date.now() % 10000) / 1000),
    };
  } catch (error) {
    console.error("Error parsing BLAST XML:", error);
    throw new Error("Failed to parse BLAST results");
  }
}

// Parse individual BLAST hit
function parseBlastHit(hit, querySequence) {
  try {
    const hitId = hit["Hit_id"][0];
    const hitDef = hit["Hit_def"][0];
    const hitLen = parseInt(hit["Hit_len"][0]);

    // Parse your FASTA header format: >sp|HSN0001|A0A024RBG1|NUD4B_HUMAN Diphosphoinositol...
    const headerParts = hitDef.split(" ");
    const idParts = headerParts[0].split("|");

    let hsnId = hitId;
    let geneName = "Unknown";
    let proteinName = "Unknown protein";
    let organism = "Homo sapiens";

    if (idParts.length >= 4) {
      hsnId = idParts[1]; // HSN0001
      geneName = idParts[3].split("_")[0]; // NUD4B from NUD4B_HUMAN

      // Extract protein name from description
      const descStart = hitDef.indexOf(" ");
      if (descStart > 0) {
        const description = hitDef.substring(descStart + 1);
        const osIndex = description.indexOf(" OS=");
        if (osIndex > 0) {
          proteinName = description.substring(0, osIndex);

          // Extract organism
          const osMatch = description.match(/OS=([^=]+?)(?:\s+[A-Z]{2}=|$)/);
          if (osMatch) {
            organism = osMatch[1].trim();
          }
        } else {
          proteinName = description;
        }
      }
    }

    // Get the best HSP (High-scoring Segment Pair)
    const hsps = hit["Hit_hsps"][0]["Hsp"];
    if (!hsps || hsps.length === 0) return null;

    const bestHsp = hsps[0];

    return {
      id: `protein_${hsnId}`, // Database ID for navigation - you might need to map this to actual DB IDs
      hsnId: hsnId,
      geneName: geneName,
      proteinName: proteinName,
      organism: organism,
      evalue: parseFloat(bestHsp["Hsp_evalue"][0]),
      score: parseFloat(bestHsp["Hsp_score"][0]),
      identity:
        Math.round(
          (parseInt(bestHsp["Hsp_identity"][0]) /
            parseInt(bestHsp["Hsp_align-len"][0])) *
            100 *
            10
        ) / 10,
      positives:
        Math.round(
          (parseInt(bestHsp["Hsp_positive"][0]) /
            parseInt(bestHsp["Hsp_align-len"][0])) *
            100 *
            10
        ) / 10,
      gaps: parseInt(bestHsp["Hsp_gaps"][0]),
      queryStart: parseInt(bestHsp["Hsp_query-from"][0]),
      queryEnd: parseInt(bestHsp["Hsp_query-to"][0]),
      subjectStart: parseInt(bestHsp["Hsp_hit-from"][0]),
      subjectEnd: parseInt(bestHsp["Hsp_hit-to"][0]),
      querySeq: bestHsp["Hsp_qseq"][0],
      subjectSeq: bestHsp["Hsp_hseq"][0],
      alignment: bestHsp["Hsp_midline"][0],
      length: parseInt(bestHsp["Hsp_align-len"][0]),
    };
  } catch (error) {
    console.error("Error parsing BLAST hit:", error);
    return null;
  }
}

// Create empty result for no hits
function createEmptyResult(querySequence) {
  return {
    jobId: uuidv4(),
    queryLength: querySequence.length,
    databaseSize: 4533,
    totalHits: 0,
    hits: [],
    statistics: {
      kappa: 0.041,
      lambda: 0.267,
      entropy: 0.14,
      database: "HSNDB",
      databaseVersion: "2024.1",
      totalSequences: 4533,
    },
    executionTime: 1,
  };
}

// Update job status
function updateJobStatus(jobId, updates) {
  const current = jobStore.get(jobId) || {};
  jobStore.set(jobId, { ...current, ...updates });
}

// Validate sequence
function validateSequence(sequence) {
  if (!sequence || sequence.trim().length === 0) {
    return { valid: false, message: "Sequence cannot be empty" };
  }

  const cleanSeq = sequence.replace(/\s/g, "").replace(/>/g, "");

  if (cleanSeq.length < 10) {
    return {
      valid: false,
      message: "Sequence must be at least 10 characters long",
    };
  }

  if (cleanSeq.length > 10000) {
    return {
      valid: false,
      message: "Sequence cannot exceed 10,000 characters",
    };
  }

  // Check for valid amino acid or nucleotide characters
  const proteinPattern = /^[ACDEFGHIKLMNPQRSTVWYX*-]+$/i;
  const nucleotidePattern = /^[ACGTUNRYMKSWBDHV-]+$/i;

  if (!proteinPattern.test(cleanSeq) && !nucleotidePattern.test(cleanSeq)) {
    return {
      valid: false,
      message:
        "Sequence contains invalid characters. Only amino acid or nucleotide letters are allowed.",
    };
  }

  return { valid: true };
}

// Cleanup old jobs periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  for (const [jobId, job] of jobStore.entries()) {
    if (now - job.startTime > oneHour) {
      jobStore.delete(jobId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HSNDB BLAST server running on port ${PORT}`);
  console.log(`BLAST database path: ${BLAST_DB_PATH}`);
});
