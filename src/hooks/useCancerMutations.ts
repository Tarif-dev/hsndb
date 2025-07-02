import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CancerMutation {
  id: number;
  gene_name: string;
  uniprot_id: string;
  position: number;
  reference_aa: string;
  altered_aa: string;
  cancer_type: string;
  created_at: string;
  updated_at: string;
}

export interface CancerMutationSummary {
  totalMutations: number;
  uniqueCancerTypes: string[];
  mutationsByPosition: { position: number; mutations: CancerMutation[] }[];
  mutationsByCancerType: {
    cancerType: string;
    count: number;
    mutations: CancerMutation[];
  }[];
}

export const useCancerMutations = (geneNameOrUniprotId: string | null) => {
  return useQuery({
    queryKey: ["cancerMutations", geneNameOrUniprotId],
    queryFn: async (): Promise<CancerMutationSummary | null> => {
      if (!geneNameOrUniprotId) return null;

      // Query by both gene_name and uniprot_id to ensure we get all relevant mutations
      const { data, error } = await supabase
        .from("cancer_cysteine_mutations")
        .select("*")
        .or(
          `gene_name.eq.${geneNameOrUniprotId},uniprot_id.eq.${geneNameOrUniprotId}`
        )
        .order("position", { ascending: true });

      if (error) {
        console.error("Error fetching cancer mutations:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Process the data to create summary statistics
      const mutations = data as CancerMutation[];
      const uniqueCancerTypes = [
        ...new Set(mutations.map((m) => m.cancer_type)),
      ];

      // Group mutations by position
      const mutationsByPosition = mutations.reduce((acc, mutation) => {
        const existing = acc.find(
          (item) => item.position === mutation.position
        );
        if (existing) {
          existing.mutations.push(mutation);
        } else {
          acc.push({
            position: mutation.position,
            mutations: [mutation],
          });
        }
        return acc;
      }, [] as { position: number; mutations: CancerMutation[] }[]);

      // Group mutations by cancer type
      const mutationsByCancerType = uniqueCancerTypes
        .map((cancerType) => {
          const cancerMutations = mutations.filter(
            (m) => m.cancer_type === cancerType
          );
          return {
            cancerType,
            count: cancerMutations.length,
            mutations: cancerMutations,
          };
        })
        .sort((a, b) => b.count - a.count); // Sort by count descending

      return {
        totalMutations: mutations.length,
        uniqueCancerTypes,
        mutationsByPosition,
        mutationsByCancerType,
      };
    },
    enabled: !!geneNameOrUniprotId,
  });
};

// Hook to get all unique cancer types for filtering
export const useAllCancerTypes = () => {
  return useQuery({
    queryKey: ["allCancerTypes"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("cancer_cysteine_mutations")
        .select("cancer_type")
        .order("cancer_type");

      if (error) {
        console.error("Error fetching cancer types:", error);
        throw error;
      }

      const uniqueTypes = [...new Set(data?.map((d) => d.cancer_type) || [])];
      return uniqueTypes;
    },
  });
};
