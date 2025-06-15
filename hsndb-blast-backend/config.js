const path = require("path");

// Load environment variables if .env file exists
try {
  require("dotenv").config();
} catch (error) {
  // dotenv not installed, that's ok for development
}

// Detect if running in Docker
const isDocker =
  process.env.DOCKER_ENV === "true" ||
  process.env.NODE_ENV === "production" ||
  require("fs").existsSync("/.dockerenv");

module.exports = {
  // Supabase Configuration
  SUPABASE_URL:
    process.env.SUPABASE_URL || "https://your-supabase-url.supabase.co",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "your-supabase-anon-key", // BLAST Configuration - Use /usr/bin/ for Docker
  BLAST_BIN_PATH: isDocker
    ? "/usr/bin/"
    : process.env.BLAST_BIN_PATH ||
      (process.platform === "win32"
        ? "C:\\Program Files\\NCBI\\blast-2.16.0+\\bin\\"
        : "/usr/local/bin/"),
  BLAST_DB_PATH: path.join(__dirname, "blastdb", "hsndb"),
  TEMP_DIR: path.join(__dirname, "temp"),

  // Database Configuration - sequences.fasta should be in backend directory for Docker
  FASTA_FILE: isDocker
    ? path.join(__dirname, "sequences.fasta")
    : path.join(__dirname, "..", "sequences.fasta"),

  // Server Configuration
  PORT: process.env.PORT || (isDocker ? 10000 : 3001),
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    (process.env.NODE_ENV === "production"
      ? "https://hsndb-taupe.vercel.app"
      : "*"),

  // Docker flag
  IS_DOCKER: isDocker,

  // BLAST Parameters
  DEFAULT_PARAMS: {
    evalue: 10,
    maxTargetSeqs: 500,
    matrix: "BLOSUM62",
    wordSize: {
      blastp: 3,
      blastn: 11,
      blastx: 3,
      tblastn: 3,
      tblastx: 3,
    },
  },

  // Job Management
  JOB_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  JOB_MAX_AGE: 60 * 60 * 1000, // 1 hour

  // Validation
  MAX_SEQUENCE_LENGTH: 10000,
  MIN_SEQUENCE_LENGTH: 10,
};
