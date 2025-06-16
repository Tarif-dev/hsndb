const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const DatabaseManager = require("./utils/database");
const BlastRunner = require("./utils/blastRunner");
const ValidationUtils = require("./utils/validation");
const JobStore = require("./utils/jobStore");

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize job store with LRU cache (max 1000 jobs)
const jobStore = new JobStore(1000);
const blastRunner = new BlastRunner(jobStore);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "HSNDB",
    version: "1.0.0",
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
      databaseVersion: "2024.1",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get database info" });
  }
});

// Input validation middleware
const validateBlastRequest = (req, res, next) => {
  const { sequence, algorithm, evalue, maxTargetSeqs } = req.body;

  // Validate sequence
  if (
    !sequence ||
    typeof sequence !== "string" ||
    sequence.trim().length === 0
  ) {
    return res.status(400).json({ error: "Valid sequence is required" });
  }

  // Validate algorithm
  const validAlgorithms = ["blastp", "blastn", "blastx", "tblastn", "tblastx"];
  if (algorithm && !validAlgorithms.includes(algorithm)) {
    return res.status(400).json({ error: "Invalid BLAST algorithm" });
  }

  // Validate evalue
  if (evalue !== undefined && (isNaN(evalue) || evalue < 0 || evalue > 1000)) {
    return res
      .status(400)
      .json({ error: "E-value must be a number between 0 and 1000" });
  }

  // Validate maxTargetSeqs
  if (
    maxTargetSeqs !== undefined &&
    (isNaN(maxTargetSeqs) || maxTargetSeqs < 1 || maxTargetSeqs > 5000)
  ) {
    return res
      .status(400)
      .json({ error: "Max target sequences must be between 1 and 5000" });
  }

  next();
};

// BLAST search endpoints
app.post("/api/blast/submit", validateBlastRequest, async (req, res) => {
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
      sequenceLength: sequence?.length,
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
      estimatedTime: "5-30 seconds",
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
      estimatedTimeRemaining = Math.max(
        0,
        Math.round((totalEstimated - elapsed) / 1000)
      );
    }

    res.json({
      ...job,
      estimatedTimeRemaining,
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
        progress: job.progress,
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
    const jobs = Array.from(jobStore.values()).map((job) => ({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      startTime: job.startTime,
      lastAccessed: job.lastAccessed,
      parameters: job.parameters
        ? {
            algorithm: job.parameters.algorithm,
            sequenceLength: job.parameters.sequence?.length,
          }
        : null,
    }));

    const stats = jobStore.getStats();

    res.json({
      jobs,
      stats,
      total: jobs.length,
    });
  } catch (error) {
    console.error("Jobs list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  // Log the full stack trace for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Stack trace:", error.stack);
  }

  // Determine error type and send appropriate response
  let statusCode = 500;
  let message = "Internal server error";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.message;
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (error.message.includes("BLAST")) {
    statusCode = 503;
    message = "BLAST service unavailable";
  }

  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Cleanup old jobs periodically
setInterval(() => {
  const cleanedCount = jobStore.cleanupOldJobs(config.JOB_MAX_AGE);

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} old jobs`);
    const stats = jobStore.getStats();
    console.log(
      `Job store stats: ${stats.total} total, ${stats.running} running, ${stats.completed} completed`
    );
  }
}, config.JOB_CLEANUP_INTERVAL);

// Initialize server
async function startServer() {
  try {
    console.log("🚀 Initializing HSNDB BLAST Server...");
    console.log(`🗂️  BLAST database path: ${config.BLAST_DB_PATH}`);
    console.log(`🔧 BLAST binaries path: ${config.BLAST_BIN_PATH}`);
    console.log(`📄 FASTA file path: ${config.FASTA_FILE}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔒 CORS Origin: ${JSON.stringify(config.CORS_ORIGIN)}`);

    // Check if FASTA file exists
    const fs = require("fs");
    if (!fs.existsSync(config.FASTA_FILE)) {
      console.error(`❌ FASTA file not found: ${config.FASTA_FILE}`);
      throw new Error("FASTA file not found");
    }
    console.log(`✅ FASTA file found: ${config.FASTA_FILE}`);

    // Initialize BLAST database
    await DatabaseManager.initializeDatabase();
    console.log("✅ BLAST database initialization completed");

    // Initialize database mappings for protein details
    console.log("🔄 Initializing protein database mappings...");
    await blastRunner.initializeDatabaseMappings();
    console.log("✅ Protein database mappings initialization completed"); // Start server
    const server = app.listen(config.PORT, "0.0.0.0", () => {
      console.log(`🎉 HSNDB BLAST server running on port ${config.PORT}`);
      console.log(`🔗 API endpoint: http://0.0.0.0:${config.PORT}/api`);
      console.log(`❤️  Health check: http://0.0.0.0:${config.PORT}/api/health`);

      if (process.env.NODE_ENV === "production") {
        console.log(`🚀 Production server ready for Railway deployment!`);
      }
    });

    // Handle server startup errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${config.PORT} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

// Start the server
startServer();
