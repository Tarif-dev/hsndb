const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const xml2js = require("xml2js");
const config = require("../config");
const ValidationUtils = require("./validation");
const BlastDatabaseMapper = require("./databaseMapper");

class BlastRunner {
  constructor(jobStore) {
    this.jobStore = jobStore;
    this.databaseMapper = new BlastDatabaseMapper();
    this.mappingsInitialized = false;
  }

  // Initialize database mappings once at startup
  async initializeDatabaseMappings() {
    if (!this.mappingsInitialized) {
      console.log("🔄 Initializing database mappings for BLAST results...");
      this.mappingsInitialized = await this.databaseMapper.initializeMappings();

      if (this.mappingsInitialized) {
        const stats = this.databaseMapper.getStats();
        console.log(
          `✅ Database mappings initialized: ${stats.totalProteins} proteins mapped by UniProt ID`
        );
      } else {
        console.warn(
          "⚠️ Database mappings failed to initialize, using fallback parsing"
        );
      }
    }
    return this.mappingsInitialized;
  }

  async submitJob(params) {
    // Validate sequence
    const sequenceValidation = ValidationUtils.validateSequence(
      params.sequence
    );
    if (!sequenceValidation.valid) {
      throw new Error(sequenceValidation.message);
    }

    // Validate parameters
    const paramValidation = ValidationUtils.validateParameters(params);
    if (!paramValidation.valid) {
      throw new Error(paramValidation.errors.join(", "));
    }

    const jobId = uuidv4();

    // Initialize job status
    this.jobStore.set(jobId, {
      jobId,
      status: "pending",
      progress: 0,
      startTime: Date.now(),
      parameters: params,
    });

    // Process BLAST search asynchronously
    this.processBlastSearch(jobId, params).catch((error) => {
      console.error(`Job ${jobId} failed:`, error);
      this.updateJobStatus(jobId, {
        status: "failed",
        error: error.message,
      });
    });

    return jobId;
  }

  async processBlastSearch(jobId, params) {
    try {
      this.updateJobStatus(jobId, { status: "running", progress: 10 });

      const {
        sequence,
        algorithm,
        evalue = config.DEFAULT_PARAMS.evalue,
        maxTargetSeqs = config.DEFAULT_PARAMS.maxTargetSeqs,
        matrix = config.DEFAULT_PARAMS.matrix,
        wordSize,
        gapOpen,
        gapExtend,
      } = params;

      // Create temporary files
      const inputFile = path.join(config.TEMP_DIR, `query_${jobId}.fasta`);
      const outputFile = path.join(config.TEMP_DIR, `results_${jobId}.xml`);

      // Ensure temp directory exists
      if (!fs.existsSync(config.TEMP_DIR)) {
        fs.mkdirSync(config.TEMP_DIR, { recursive: true });
      }

      // Clean sequence and create FASTA format
      const cleanSequence = sequence.replace(/\s/g, "").replace(/>/g, "");
      const fastaContent = `>query\n${cleanSequence}`;
      fs.writeFileSync(inputFile, fastaContent);

      this.updateJobStatus(jobId, { progress: 30 });

      // Build and execute BLAST command
      const blastCommand = this.buildBlastCommand({
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

      console.log(`Executing BLAST for job ${jobId}:`, blastCommand);
      this.updateJobStatus(jobId, { progress: 50 });

      await this.executeBlastCommand(blastCommand);
      this.updateJobStatus(jobId, { progress: 80 });

      // Parse results
      const xmlResults = fs.readFileSync(outputFile, "utf8");
      const parsedResults = await this.parseBlastXML(
        xmlResults,
        cleanSequence,
        jobId
      );
      this.updateJobStatus(jobId, { progress: 95 });

      // Clean up temporary files
      this.cleanupFiles([inputFile, outputFile]);

      // Store results and mark as completed
      this.updateJobStatus(jobId, {
        status: "completed",
        progress: 100,
        results: parsedResults,
        completedTime: Date.now(),
      });
    } catch (error) {
      console.error(`BLAST execution error for job ${jobId}:`, error);
      this.updateJobStatus(jobId, {
        status: "failed",
        error: error.message,
      });
    }
  }

  buildBlastCommand(params) {
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

    const executable = `"${path.join(config.BLAST_BIN_PATH, algorithm)}"`;

    let cmd = [
      executable,
      "-query",
      `"${inputFile}"`,
      "-db",
      `"${config.BLAST_DB_PATH}"`,
      "-evalue",
      evalue,
      "-max_target_seqs",
      maxTargetSeqs,
      "-outfmt",
      "5", // XML output
      "-out",
      `"${outputFile}"`,
    ];

    // Add algorithm-specific parameters
    if (
      matrix &&
      (algorithm === "blastp" ||
        algorithm === "blastx" ||
        algorithm === "tblastn")
    ) {
      cmd.push("-matrix", matrix);
    }

    if (wordSize) {
      cmd.push("-word_size", wordSize);
    } else if (config.DEFAULT_PARAMS.wordSize[algorithm]) {
      cmd.push("-word_size", config.DEFAULT_PARAMS.wordSize[algorithm]);
    }

    if (gapOpen !== undefined) {
      cmd.push("-gapopen", gapOpen);
    }

    if (gapExtend !== undefined) {
      cmd.push("-gapextend", gapExtend);
    }

    return cmd.join(" ");
  }

  executeBlastCommand(command) {
    return new Promise((resolve, reject) => {
      exec(
        command,
        {
          maxBuffer: 1024 * 1024 * 50, // 50MB buffer
          timeout: 300000, // 5 minute timeout
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error("BLAST execution failed:", error);
            console.error("stderr:", stderr);
            reject(new Error(`BLAST execution failed: ${error.message}`));
          } else {
            console.log("BLAST completed successfully");
            resolve(stdout);
          }
        }
      );
    });
  }

  async parseBlastXML(xmlData, querySequence, jobId) {
    try {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xmlData);

      const blastOutput = result["BlastOutput"];
      if (!blastOutput) {
        throw new Error("Invalid BLAST XML output");
      }

      const iterations =
        blastOutput["BlastOutput_iterations"]?.[0]?.["Iteration"];
      if (!iterations || iterations.length === 0) {
        return this.createEmptyResult(querySequence, jobId);
      }

      const iteration = iterations[0];
      const hits = iteration["Iteration_hits"]?.[0]?.["Hit"] || [];
      const parsedHits = [];
      for (const hit of hits) {
        const parsedHit = await this.parseBlastHit(hit);
        if (parsedHit) {
          parsedHits.push(parsedHit);
        }
      }

      // Sort by e-value (most significant first)
      parsedHits.sort((a, b) => a.evalue - b.evalue);

      // Get statistics
      const stats = iteration["Iteration_stat"]?.[0]?.["Statistics"]?.[0];

      return {
        jobId,
        queryLength: querySequence.length,
        databaseSize: 4533,
        totalHits: parsedHits.length,
        hits: parsedHits,
        statistics: {
          kappa: parseFloat(stats?.["Statistics_kappa"]?.[0]) || 0.041,
          lambda: parseFloat(stats?.["Statistics_lambda"]?.[0]) || 0.267,
          entropy: parseFloat(stats?.["Statistics_entropy"]?.[0]) || 0.14,
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
  async parseBlastHit(hit) {
    try {
      const hitId = hit["Hit_id"]?.[0];
      const hitDef = hit["Hit_def"]?.[0];
      const hitLen = parseInt(hit["Hit_len"]?.[0]);

      if (!hitId || !hitDef) {
        return null;
      }

      // Extract UniProt identifier from the hit
      const uniprotId = this.databaseMapper.extractFastaIdentifier(hitId);

      // Get protein details from database using UniProt ID
      let proteinDetails;
      if (this.mappingsInitialized) {
        proteinDetails = await this.databaseMapper.getProteinDetails(uniprotId);
      } else {
        // Fallback to old parsing method
        console.warn(
          "⚠️ Database mappings not initialized, using fallback parsing"
        );
        proteinDetails = this.parseFallbackProteinDetails(
          hitId,
          hitDef,
          uniprotId
        );
      }

      // Get the best HSP (High-scoring Segment Pair)
      const hsps = hit["Hit_hsps"]?.[0]?.["Hsp"];
      if (!hsps || hsps.length === 0) return null;

      const bestHsp = hsps[0];

      const alignLen = parseInt(bestHsp["Hsp_align-len"]?.[0]) || 1;
      const identity = parseInt(bestHsp["Hsp_identity"]?.[0]) || 0;
      const positives = parseInt(bestHsp["Hsp_positive"]?.[0]) || 0;
      return {
        id: proteinDetails.id,
        hsnId: proteinDetails.hsnId,
        geneName: proteinDetails.geneName,
        proteinName: proteinDetails.proteinName,
        description: proteinDetails.description,
        uniprotId: proteinDetails.uniprotId,
        evalue: parseFloat(bestHsp["Hsp_evalue"]?.[0]) || 999,
        score: parseFloat(bestHsp["Hsp_score"]?.[0]) || 0,
        identity: Math.round((identity / alignLen) * 100 * 10) / 10,
        positives: Math.round((positives / alignLen) * 100 * 10) / 10,
        gaps: parseInt(bestHsp["Hsp_gaps"]?.[0]) || 0,
        queryStart: parseInt(bestHsp["Hsp_query-from"]?.[0]) || 1,
        queryEnd: parseInt(bestHsp["Hsp_query-to"]?.[0]) || 1,
        subjectStart: parseInt(bestHsp["Hsp_hit-from"]?.[0]) || 1,
        subjectEnd: parseInt(bestHsp["Hsp_hit-to"]?.[0]) || 1,
        querySeq: bestHsp["Hsp_qseq"]?.[0] || "",
        subjectSeq: bestHsp["Hsp_hseq"]?.[0] || "",
        alignment: bestHsp["Hsp_midline"]?.[0] || "",
        length: alignLen,
      };
    } catch (error) {
      console.error("Error parsing BLAST hit:", error);
      return null;
    }
  }
  parseFallbackProteinDetails(hitId, hitDef, uniprotId = null) {
    // Enhanced fallback parsing for when database mapping fails
    const headerParts = hitDef.split(" ");
    const idParts = headerParts[0].split("|");

    let hsnId = hitId;
    let geneName = "Unknown";
    let proteinName = "Unknown protein";
    let extractedUniprotId = uniprotId;

    // Parse UniProt format: sp|A0A024RBG1|NUD4B_HUMAN
    if (idParts.length >= 3) {
      extractedUniprotId = idParts[1]; // A0A024RBG1
      const proteinCode = idParts[2]; // NUD4B_HUMAN

      if (proteinCode.includes("_")) {
        geneName = proteinCode.split("_")[0]; // NUD4B from NUD4B_HUMAN
      }

      // Extract protein name from description
      const descStart = hitDef.indexOf(" ");
      if (descStart > 0) {
        const description = hitDef.substring(descStart + 1);
        const osIndex = description.indexOf(" OS=");
        if (osIndex > 0) {
          proteinName = description.substring(0, osIndex);
        } else {
          proteinName = description;
        }
      }
    }

    return {
      id: `protein_${extractedUniprotId || hsnId}`,
      hsnId: hsnId,
      geneName: geneName,
      proteinName: proteinName,
      description: "Parsed from FASTA header (fallback)",
      uniprotId: extractedUniprotId,
    };
  }

  createEmptyResult(querySequence, jobId) {
    return {
      jobId,
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

  updateJobStatus(jobId, updates) {
    const current = this.jobStore.get(jobId) || {};
    this.jobStore.set(jobId, { ...current, ...updates });
  }

  cleanupFiles(files) {
    files.forEach((file) => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (error) {
        console.error(`Failed to cleanup file ${file}:`, error);
      }
    });
  }

  getJobStatus(jobId) {
    return this.jobStore.get(jobId);
  }

  getJobResults(jobId) {
    const job = this.jobStore.get(jobId);
    return job?.results;
  }
}

module.exports = BlastRunner;
