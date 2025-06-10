
const config = require('../config');

class ValidationUtils {
  static validateSequence(sequence) {
    if (!sequence || sequence.trim().length === 0) {
      return { valid: false, message: "Sequence cannot be empty" };
    }

    const cleanSeq = sequence.replace(/\s/g, "").replace(/>/g, "");

    if (cleanSeq.length < config.MIN_SEQUENCE_LENGTH) {
      return {
        valid: false,
        message: `Sequence must be at least ${config.MIN_SEQUENCE_LENGTH} characters long`,
      };
    }

    if (cleanSeq.length > config.MAX_SEQUENCE_LENGTH) {
      return {
        valid: false,
        message: `Sequence cannot exceed ${config.MAX_SEQUENCE_LENGTH} characters`,
      };
    }

    // Check for valid amino acid or nucleotide characters
    const proteinPattern = /^[ACDEFGHIKLMNPQRSTVWYX*-]+$/i;
    const nucleotidePattern = /^[ACGTUNRYMKSWBDHV-]+$/i;

    if (!proteinPattern.test(cleanSeq) && !nucleotidePattern.test(cleanSeq)) {
      return {
        valid: false,
        message: "Sequence contains invalid characters. Only amino acid or nucleotide letters are allowed.",
      };
    }

    return { valid: true };
  }

  static validateParameters(params) {
    const errors = [];

    // Validate algorithm
    const validAlgorithms = ['blastp', 'blastn', 'blastx', 'tblastn', 'tblastx'];
    if (!validAlgorithms.includes(params.algorithm)) {
      errors.push(`Invalid algorithm. Must be one of: ${validAlgorithms.join(', ')}`);
    }

    // Validate evalue
    if (params.evalue && (isNaN(params.evalue) || params.evalue < 0)) {
      errors.push('E-value must be a positive number');
    }

    // Validate maxTargetSeqs
    if (params.maxTargetSeqs && (isNaN(params.maxTargetSeqs) || params.maxTargetSeqs < 1)) {
      errors.push('Max target sequences must be a positive integer');
    }

    // Validate word size
    if (params.wordSize && (isNaN(params.wordSize) || params.wordSize < 1)) {
      errors.push('Word size must be a positive integer');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  static sanitizeFileName(filename) {
    return filename.replace(/[^a-zA-Z0-9\-_]/g, '_');
  }
}

module.exports = ValidationUtils;
