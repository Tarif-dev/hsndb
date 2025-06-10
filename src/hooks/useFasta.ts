
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FastaData {
  hsn_id: string;
  fasta: string;
}

export const useFasta = (hsnId: string) => {
  return useQuery({
    queryKey: ["fasta", hsnId],
    queryFn: async (): Promise<FastaData | null> => {
      const { data, error } = await supabase
        .from("formats")
        .select("hsn_id, fasta")
        .eq("hsn_id", hsnId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching FASTA data:", error);
        throw error;
      }

      return data;
    },
    enabled: !!hsnId,
  });
};
