import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DisorderData {
  protein_id: string;
  length: number;
  scores: number[];
  summaries: any;
  uniprot_id: string;
  gene_name: string | null;
  protein_name: string | null;
  sequence: string | null;
}

export const useProteinDisorder = (
  uniprotId: string | null,
  hsnId: string | null
) => {
  return useQuery({
    queryKey: ["protein-disorder", uniprotId, hsnId],
    queryFn: async (): Promise<DisorderData | null> => {
      if (!uniprotId && !hsnId) {
        throw new Error("Either UniProt ID or HSN ID is required");
      }

      // First try to match by uniprot_id directly
      if (uniprotId) {
        const { data: disorderData, error } = await supabase
          .from("protein_disorder")
          .select("*")
          .eq("uniprot_id", uniprotId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching disorder data by UniProt ID:", error);
        }

        if (disorderData) {
          return disorderData;
        }
      }

      // If no direct match, try to find by matching hsn_id to uniprot_id in proteins table
      if (hsnId) {
        // First get the UniProt ID from the proteins table using HSN ID
        const { data: proteinData, error: proteinError } = await supabase
          .from("proteins")
          .select("uniprot_id")
          .eq("hsn_id", hsnId)
          .maybeSingle();

        if (proteinError) {
          console.error("Error fetching protein data:", proteinError);
          throw proteinError;
        }

        if (proteinData?.uniprot_id) {
          // Now get disorder data using the UniProt ID
          const { data: disorderData, error: disorderError } = await supabase
            .from("protein_disorder")
            .select("*")
            .eq("uniprot_id", proteinData.uniprot_id)
            .maybeSingle();

          if (disorderError) {
            console.error(
              "Error fetching disorder data by matched UniProt ID:",
              disorderError
            );
          }

          return disorderData;
        }
      }

      return null;
    },
    enabled: !!(uniprotId || hsnId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export default useProteinDisorder;
