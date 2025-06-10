export interface BlastParameters {
  sequence: string;
  algorithm: "blastp" | "blastn" | "blastx" | "tblastn" | "tblastx";
  evalue: number;
  matrix: string;
  wordSize?: number;
  gapOpen?: number;
  gapExtend?: number;
  maxTargetSeqs?: number;
}

export interface BlastHit {
  id: string; // Database ID for navigation
  hsnId: string;
  geneName: string;
  proteinName: string;
  organism: string;
  evalue: number;
  score: number;
  identity: number;
  positives: number;
  gaps: number;
  queryStart: number;
  queryEnd: number;
  subjectStart: number;
  subjectEnd: number;
  querySeq: string;
  subjectSeq: string;
  alignment: string;
  length: number;
}

export interface BlastResult {
  jobId: string;
  queryLength: number;
  databaseSize: number; // HSNDB: 4533 proteins
  totalHits: number;
  hits: BlastHit[];
  statistics: {
    kappa: number;
    lambda: number;
    entropy: number;
    database: "HSNDB";
    databaseVersion: string;
    totalSequences: 4533;
  };
  executionTime: number;
}

export interface BlastJobStatus {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  estimatedTimeRemaining?: number;
  results?: BlastResult;
  error?: string;
}

// Real BLAST API implementation connecting to BLAST backend server
export class BlastAPI {
  private static baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001/api"
      : "/api";

  static async submitBlastSearch(params: BlastParameters): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/blast/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit BLAST search");
      }

      const { jobId } = await response.json();
      return jobId;
    } catch (error) {
      console.error("Error submitting BLAST search:", error);
      throw error;
    }
  }

  static async getJobStatus(jobId: string): Promise<BlastJobStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/blast/status/${jobId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get job status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting job status:", error);
      throw error;
    }
  }

  static async getResults(jobId: string): Promise<BlastResult> {
    try {
      const response = await fetch(`${this.baseUrl}/blast/results/${jobId}`);

      if (!response.ok) {
        if (response.status === 202) {
          throw new Error("Job not completed yet");
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to get results");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting results:", error);
      throw error;
    }
  }
}

// Sequence validation utilities
export const validateSequence = (
  sequence: string
): { valid: boolean; message?: string } => {
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
};

export const formatSequence = (sequence: string): string => {
  return sequence.replace(/\s/g, "").replace(/>/g, "").toUpperCase();
};

export const parseSequenceType = (
  sequence: string
): "protein" | "nucleotide" | "unknown" => {
  const cleanSeq = formatSequence(sequence);
  const proteinChars = cleanSeq.match(/[DEFHIKLMPQRSVWY]/gi);
  const nucleotideChars = cleanSeq.match(/[ACGTU]/gi);

  if (!proteinChars && nucleotideChars) {
    return "nucleotide";
  } else if (proteinChars && proteinChars.length > cleanSeq.length * 0.1) {
    return "protein";
  } else if (
    nucleotideChars &&
    nucleotideChars.length > cleanSeq.length * 0.8
  ) {
    return "nucleotide";
  }

  return "unknown";
};
