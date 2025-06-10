
const path = require('path');

module.exports = {
  // BLAST Configuration
  BLAST_BIN_PATH: process.env.BLAST_BIN_PATH || "C:\\Program Files\\NCBI\\blast-2.16.0+\\bin\\",
  BLAST_DB_PATH: path.join(__dirname, "blastdb", "hsndb"),
  TEMP_DIR: path.join(__dirname, "temp"),
  
  // Database Configuration
  FASTA_FILE: path.join(__dirname, "..", "sequences.fasta"), // Root directory FASTA file
  
  // Server Configuration
  PORT: process.env.PORT || 3001,
  CORS_ORIGIN: process.env.NODE_ENV === "production" ? false : "*",
  
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
      tblastx: 3
    }
  },
  
  // Job Management
  JOB_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  JOB_MAX_AGE: 60 * 60 * 1000, // 1 hour
  
  // Validation
  MAX_SEQUENCE_LENGTH: 10000,
  MIN_SEQUENCE_LENGTH: 10
};
