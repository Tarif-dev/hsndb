import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useScopData = (uniprotId: string) => {
  return useQuery({
    queryKey: ["scop", uniprotId],
    queryFn: async () => {
      if (!uniprotId) return null;

      const { data, error } = await supabase
        .from("scop")
        .select("*")
        .eq("uniprot_id", uniprotId);

      if (error) {
        console.error("Error fetching SCOP data:", error);
        return null;
      }

      return data;
    },
    enabled: !!uniprotId,
  });
};

export const useCathData = (uniprotId: string) => {
  return useQuery({
    queryKey: ["cath", uniprotId],
    queryFn: async () => {
      if (!uniprotId) return null;

      const { data, error } = await supabase
        .from("cath")
        .select("*")
        .eq("uniprot_id", uniprotId);

      if (error) {
        console.error("Error fetching CATH data:", error);
        return null;
      }

      return data;
    },
    enabled: !!uniprotId,
  });
};
