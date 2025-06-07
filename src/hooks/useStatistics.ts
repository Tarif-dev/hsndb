import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseStatistics {
  totalProteins: number;
  cancerAssociatedSites: number;
  totalSites: number;
}

export const useStatistics = () => {
  return useQuery({
    queryKey: ["database-statistics"],
    queryFn: async (): Promise<DatabaseStatistics> => {
      console.log("Fetching database statistics...");

      // Query for total number of proteins
      const { count: totalProteins, error: proteinsError } = await supabase
        .from("proteins")
        .select("*", { count: "exact", head: true });

      if (proteinsError) {
        console.error("Error fetching total proteins count:", proteinsError);
        throw proteinsError;
      }

      // Query for cancer-associated proteins count
      const { count: cancerAssociatedProteins, error: cancerError } =
        await supabase
          .from("proteins")
          .select("*", { count: "exact", head: true })
          .eq("cancer_causing", true);

      if (cancerError) {
        console.error(
          "Error fetching cancer-associated proteins count:",
          cancerError
        );
        throw cancerError;
      }

      // Query for sum of total sites across all proteins
      const { data: sitesData, error: sitesError } = await supabase
        .from("proteins")
        .select("total_sites")
        .not("total_sites", "is", null);

      if (sitesError) {
        console.error("Error fetching total sites:", sitesError);
        throw sitesError;
      }

      // Calculate the sum of all sites
      const totalSites =
        sitesData?.reduce((sum, protein) => {
          return sum + (protein.total_sites || 0);
        }, 0) || 0;

      console.log("Database statistics calculated:", {
        totalProteins: totalProteins || 0,
        cancerAssociatedSites: cancerAssociatedProteins || 0,
        totalSites,
      });

      return {
        totalProteins: totalProteins || 0,
        cancerAssociatedSites: cancerAssociatedProteins || 0,
        totalSites,
      };
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};
