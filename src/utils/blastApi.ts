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

// Enhanced BLAST API implementation with better error handling and retry logic
export class BlastAPI {
  private static baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001/api"
      : import.meta.env.VITE_BLAST_API_URL ||
        "https://your-railway-app.railway.app/api";

  private static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        if (response.ok || response.status === 400 || response.status === 404) {
          return response;
        }

        if (i === retries - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw new Error("Max retries exceeded");
  }

  static async checkServerHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error("Server health check failed:", error);
      return false;
    }
  }

  static async getDatabaseInfo(): Promise<any> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/database/info`
      );

      if (!response.ok) {
        throw new Error("Failed to get database info");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting database info:", error);
      throw error;
    }
  }

  static async submitBlastSearch(params: BlastParameters): Promise<string> {
    try {
      // Validate parameters before submission
      const validation = validateSequence(params.sequence);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/blast/submit`,
        {
          method: "POST",
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("BLAST search submitted successfully:", result);
      return result.jobId;
    } catch (error) {
      console.error("Error submitting BLAST search:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to BLAST server. Please ensure the server is running on port 3001."
        );
      }
      throw error;
    }
  }

  static async getJobStatus(jobId: string): Promise<BlastJobStatus> {
    try {
      if (!jobId) {
        throw new Error("Job ID is required");
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/blast/status/${jobId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting job status:", error);
      throw error;
    }
  }

  static async getResults(jobId: string): Promise<BlastResult> {
    try {
      if (!jobId) {
        throw new Error("Job ID is required");
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/blast/results/${jobId}`
      );

      if (!response.ok) {
        if (response.status === 202) {
          throw new Error("Job not completed yet");
        }
        if (response.status === 404) {
          throw new Error("Results not found");
        }
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      const results = await response.json();
      console.log("BLAST results retrieved successfully:", {
        jobId,
        totalHits: results.totalHits,
        executionTime: results.executionTime,
      });
      return results;
    } catch (error) {
      console.error("Error getting results:", error);
      throw error;
    }
  }

  static async getActiveJobs(): Promise<any> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/blast/jobs`);

      if (!response.ok) {
        throw new Error("Failed to get active jobs");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting active jobs:", error);
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
