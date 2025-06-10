
const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const DatabaseManager = require("./utils/database");
const BlastRunner = require("./utils/blastRunner");
const ValidationUtils = require("./utils/validation");

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Store for job status (in production, use Redis or database)
const jobStore = new Map();
const blastRunner = new BlastRunner(jobStore);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "HSNDB",
    version: "1.0.0"
  });
});

// Database info endpoint
app.get("/api/database/info", async (req, res) => {
  try {
    const isValid = await DatabaseManager.verifyDatabase();
    res.json({
      valid: isValid,
      path: config.BLAST_DB_PATH,
      totalSequences: 4533,
      databaseVersion: "2024.1"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get database info" });
  }
});

// BLAST search endpoints
app.post("/api/blast/submit", async (req, res) => {
  try {
    const {
      sequence,
      algorithm = "blastp",
      evalue = config.DEFAULT_PARAMS.evalue,
      maxTargetSeqs = config.DEFAULT_PARAMS.maxTargetSeqs,
      matrix = config.DEFAULT_PARAMS.matrix,
      wordSize,
      gapOpen,
      gapExtend,
    } = req.body;

    console.log("Received BLAST request:", {
      algorithm,
      evalue,
      maxTargetSeqs,
      sequenceLength: sequence?.length
    });

    if (!sequence) {
      return res.status(400).json({ error: "Sequence is required" });
    }

    const jobId = await blastRunner.submitJob({
      sequence,
      algorithm,
      evalue,
      maxTargetSeqs,
      matrix,
      wordSize,
      gapOpen,
      gapExtend,
    });

    res.json({ 
      jobId,
      message: "BLAST search submitted successfully",
      estimatedTime: "5-30 seconds"
    });

  } catch (error) {
    console.error("BLAST submission error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get job status endpoint
app.get("/api/blast/status/:jobId", (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId || !ValidationUtils.sanitizeFileName(jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const job = blastRunner.getJobStatus(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Calculate estimated time remaining
    let estimatedTimeRemaining;
    if (job.status === "running" && job.progress > 0) {
      const elapsed = Date.now() - job.startTime;
      const totalEstimated = elapsed / (job.progress / 100);
      estimatedTimeRemaining = Math.max(0, Math.round((totalEstimated - elapsed) / 1000));
    }

    res.json({
      ...job,
      estimatedTimeRemaining
    });

  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get results endpoint
app.get("/api/blast/results/:jobId", (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId || !ValidationUtils.sanitizeFileName(jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const job = blastRunner.getJobStatus(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status === "failed") {
      return res.status(400).json({ error: job.error || "Job failed" });
    }

    if (job.status !== "completed") {
      return res.status(202).json({ 
        message: "Job not completed yet", 
        status: job.status,
        progress: job.progress 
      });
    }

    if (!job.results) {
      return res.status(404).json({ error: "No results available" });
    }

    res.json(job.results);

  } catch (error) {
    console.error("Results retrieval error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List active jobs endpoint (for debugging)
app.get("/api/blast/jobs", (req, res) => {
  try {
    const jobs = Array.from(jobStore.values()).map(job => ({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      startTime: job.startTime,
      parameters: job.parameters ? {
        algorithm: job.parameters.algorithm,
        sequenceLength: job.parameters.sequence?.length
      } : null
    }));
    
    res.json({ jobs, total: jobs.length });
  } catch (error) {
    console.error("Jobs list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Cleanup old jobs periodically
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [jobId, job] of jobStore.entries()) {
    if (now - job.startTime > config.JOB_MAX_AGE) {
      jobStore.delete(jobId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} old jobs`);
  }
}, config.JOB_CLEANUP_INTERVAL);

// Initialize server
async function startServer() {
  try {
    console.log("Initializing HSNDB BLAST Server...");
    console.log(`BLAST database path: ${config.BLAST_DB_PATH}`);
    console.log(`BLAST binaries path: ${config.BLAST_BIN_PATH}`);
    console.log(`FASTA file path: ${config.FASTA_FILE}`);

    // Initialize BLAST database
    await DatabaseManager.initializeDatabase();
    console.log("BLAST database initialization completed");

    // Start server
    app.listen(config.PORT, () => {
      console.log(`HSNDB BLAST server running on port ${config.PORT}`);
      console.log(`API endpoint: http://localhost:${config.PORT}/api`);
      console.log(`Health check: http://localhost:${config.PORT}/api/health`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
