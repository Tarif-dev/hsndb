import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCancerTypes = () => {
  return useQuery({
    queryKey: ["cancer-types"],
    queryFn: async () => {
      console.log("Fetching distinct cancer types from database...");

      const { data, error } = await supabase
        .from("proteins")
        .select("cancer_types")
        .not("cancer_types", "is", null);

      if (error) {
        console.error("Error fetching cancer types:", error);
        throw error;
      }

      // Extract all unique cancer types
      const allCancerTypes = new Set<string>();

      data.forEach((protein) => {
        if (protein.cancer_types && Array.isArray(protein.cancer_types)) {
          protein.cancer_types.forEach((type) => {
            if (type && type.trim()) {
              allCancerTypes.add(type.trim());
            }
          });
        }
      });

      const sortedCancerTypes = Array.from(allCancerTypes).sort();

      console.log("Found cancer types:", sortedCancerTypes);
      console.log("Total unique cancer types:", sortedCancerTypes.length);

      return sortedCancerTypes;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
