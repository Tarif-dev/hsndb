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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Submit BLAST search mutation
  const submitMutation = useMutation({
    mutationFn: async (params: BlastParameters) => {
      const validation = validateSequence(params.sequence);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      return BlastAPI.submitBlastSearch(params);
    },
    onSuccess: (jobId) => {
      setCurrentJobId(jobId);
      setShouldPoll(true);
      toast({
        title: "BLAST Search Submitted",
        description: `Job ${jobId} has been queued for processing.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  }); // Poll job status
  const { data: jobStatus, isLoading: isPolling } = useQuery({
    queryKey: ["blast-job-status", currentJobId],
    queryFn: () => (currentJobId ? BlastAPI.getJobStatus(currentJobId) : null),
    enabled: !!currentJobId && shouldPoll,
    refetchInterval: shouldPoll ? 2000 : false,
    refetchIntervalInBackground: true,
  });

  // Stop polling when job is complete
  useEffect(() => {
    if (
      jobStatus &&
      (jobStatus.status === "completed" || jobStatus.status === "failed")
    ) {
      setShouldPoll(false);
    }
  }, [jobStatus]);

  // Get results query
  const { data: results, isLoading: isLoadingResults } = useQuery({
    queryKey: ["blast-results", currentJobId],
    queryFn: () => (currentJobId ? BlastAPI.getResults(currentJobId) : null),
    enabled: jobStatus?.status === "completed",
  });

  const submitBlastSearch = useCallback(
    (params: BlastParameters) => {
      submitMutation.mutate(params);
    },
    [submitMutation]
  );
  const clearResults = useCallback(() => {
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

    // Data
    jobId: currentJobId,
    jobStatus,
    results,

    // Error handling
    error:
      submitMutation.error ||
      (jobStatus?.status === "failed" ? jobStatus.error : null),

    // Computed states
    isSearching:
      jobStatus?.status === "running" || jobStatus?.status === "pending",
    isCompleted: jobStatus?.status === "completed",
    isFailed: jobStatus?.status === "failed",
    progress: jobStatus?.progress || 0,
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
