import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BlastAPI,
  BlastParameters,
  BlastResult,
  BlastJobStatus,
  validateSequence,
} from "@/utils/blastApi";
import { useToast } from "@/hooks/use-toast";

export const useBlastSearch = () => {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check server health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await BlastAPI.checkServerHealth();
        setServerStatus(isHealthy ? 'online' : 'offline');
        
        if (!isHealthy) {
          toast({
            title: "Server Offline",
            description: "BLAST server is not responding. Please ensure it's running on port 3001.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setServerStatus('offline');
        console.error("Health check failed:", error);
      }
    };

    checkHealth();
  }, [toast]);

  // Submit BLAST search mutation
  const submitMutation = useMutation({
    mutationFn: async (params: BlastParameters) => {
      // Validate sequence
      const validation = validateSequence(params.sequence);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Check server status first
      const isHealthy = await BlastAPI.checkServerHealth();
      if (!isHealthy) {
        throw new Error("BLAST server is not responding. Please ensure it's running on port 3001.");
      }

      return BlastAPI.submitBlastSearch(params);
    },
    onSuccess: (jobId) => {
      setCurrentJobId(jobId);
      setShouldPoll(true);
      setServerStatus('online');
      toast({
        title: "BLAST Search Submitted",
        description: `Job ${jobId.substring(0, 8)}... has been queued for processing.`,
      });
    },
    onError: (error: Error) => {
      console.error("BLAST submission failed:", error);
      if (error.message.includes("Cannot connect")) {
        setServerStatus('offline');
      }
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Poll job status with error handling
  const { data: jobStatus, isLoading: isPolling, error: pollingError } = useQuery({
    queryKey: ["blast-job-status", currentJobId],
    queryFn: async () => {
      if (!currentJobId) return null;
      
      try {
        const status = await BlastAPI.getJobStatus(currentJobId);
        setServerStatus('online');
        return status;
      } catch (error) {
        console.error("Polling error:", error);
        if (error instanceof Error && error.message.includes("Cannot connect")) {
          setServerStatus('offline');
        }
        throw error;
      }
    },
    enabled: !!currentJobId && shouldPoll,
    refetchInterval: shouldPoll ? 2000 : false,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      // Stop retrying after 3 failures or if it's a 404 (job not found)
      if (failureCount >= 3) return false;
      if (error instanceof Error && error.message.includes("Job not found")) return false;
      return true;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Stop polling when job is complete or failed
  useEffect(() => {
    if (jobStatus) {
      if (jobStatus.status === "completed") {
        setShouldPoll(false);
        toast({
          title: "BLAST Search Completed",
          description: `Found ${jobStatus.results?.totalHits || 0} matches.`,
        });
      } else if (jobStatus.status === "failed") {
        setShouldPoll(false);
        toast({
          title: "BLAST Search Failed",
          description: jobStatus.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    }
  }, [jobStatus, toast]);

  // Handle polling errors
  useEffect(() => {
    if (pollingError) {
      console.error("Polling error:", pollingError);
      // Don't show toast for every polling error to avoid spam
      if (pollingError instanceof Error && pollingError.message.includes("Job not found")) {
        setShouldPoll(false);
        toast({
          title: "Job Not Found",
          description: "The BLAST job may have expired or been cleaned up.",
          variant: "destructive",
        });
      }
    }
  }, [pollingError, toast]);

  // Get results query with better error handling
  const { data: results, isLoading: isLoadingResults, error: resultsError } = useQuery({
    queryKey: ["blast-results", currentJobId],
    queryFn: async () => {
      if (!currentJobId) return null;
      
      try {
        const results = await BlastAPI.getResults(currentJobId);
        setServerStatus('online');
        return results;
      } catch (error) {
        console.error("Results error:", error);
        if (error instanceof Error && error.message.includes("Cannot connect")) {
          setServerStatus('offline');
        }
        throw error;
      }
    },
    enabled: jobStatus?.status === "completed",
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      if (error instanceof Error && error.message.includes("not found")) return false;
      return true;
    },
  });

  const submitBlastSearch = useCallback(
    (params: BlastParameters) => {
      console.log("Submitting BLAST search with parameters:", {
        algorithm: params.algorithm,
        evalue: params.evalue,
        maxTargetSeqs: params.maxTargetSeqs,
        sequenceLength: params.sequence.length
      });
      submitMutation.mutate(params);
    },
    [submitMutation]
  );

  const clearResults = useCallback(() => {
    console.log("Clearing BLAST results");
    setCurrentJobId(null);
    setShouldPoll(false);
    queryClient.removeQueries({ queryKey: ["blast-job-status"] });
    queryClient.removeQueries({ queryKey: ["blast-results"] });
  }, [queryClient]);

  return {
    // Actions
    submitBlastSearch,
    clearResults,

    // Status
    isSubmitting: submitMutation.isPending,
    isPolling,
    isLoadingResults,
    isLoading: submitMutation.isPending || isPolling || isLoadingResults,
    serverStatus,

    // Data
    jobId: currentJobId,
    jobStatus,
    results,

    // Error handling
    error: submitMutation.error || pollingError || resultsError ||
      (jobStatus?.status === "failed" ? new Error(jobStatus.error) : null),

    // Computed states
    isSearching: jobStatus?.status === "running" || jobStatus?.status === "pending",
    isCompleted: jobStatus?.status === "completed",
    isFailed: jobStatus?.status === "failed",
    progress: jobStatus?.progress || 0,
    estimatedTimeRemaining: jobStatus?.estimatedTimeRemaining,
  };
};

// Hook for managing BLAST search history
export const useBlastHistory = () => {
  const [history, setHistory] = useState<
    Array<{
      id: string;
      timestamp: Date;
      parameters: BlastParameters;
      status: string;
    }>
  >([]);

  const addToHistory = useCallback((jobId: string, params: BlastParameters) => {
    setHistory((prev) => [
      {
        id: jobId,
        timestamp: new Date(),
        parameters: params,
        status: "submitted",
      },
      ...prev.slice(0, 9), // Keep only last 10 searches
    ]);
  }, []);

  const updateHistoryStatus = useCallback((jobId: string, status: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === jobId ? { ...item, status } : item))
    );
  }, []);

  return {
    history,
    addToHistory,
    updateHistoryStatus,
  };
};

// Hook for BLAST result analysis
export const useBlastAnalysis = (results: BlastResult | null) => {
  const analysis = useState(() => {
    if (!results) return null;

    const hits = results.hits;

    return {
      totalHits: hits.length,
      significantHits: hits.filter((hit) => hit.evalue < 1e-5).length,
      highIdentityHits: hits.filter((hit) => hit.identity > 90).length,
      averageIdentity:
        hits.length > 0
          ? hits.reduce((sum, hit) => sum + hit.identity, 0) / hits.length
          : 0,
      averageEvalue:
        hits.length > 0
          ? hits.reduce((sum, hit) => sum + Math.log10(hit.evalue), 0) /
            hits.length
          : 0,
      topHit: hits[0] || null,
      hitsByOrganism: hits.reduce((acc, hit) => {
        acc[hit.organism] = (acc[hit.organism] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      evalueBins: {
        highly_significant: hits.filter((hit) => hit.evalue < 1e-50).length,
        significant: hits.filter(
          (hit) => hit.evalue >= 1e-50 && hit.evalue < 1e-10
        ).length,
        moderate: hits.filter((hit) => hit.evalue >= 1e-10 && hit.evalue < 1e-5)
          .length,
        weak: hits.filter((hit) => hit.evalue >= 1e-5).length,
      },
    };
  })[0];

  return analysis;
};
