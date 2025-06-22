import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Protein {
  id: string;
  hsn_id: string;
  gene_name: string;
  uniprot_id: string;
  protein_name: string;
  protein_length: number;
  alphafold_id: string;
  total_sites: number;
  positions_of_nitrosylation: string; // Fixed: changed from position_of_nitrosylation to positions_of_nitrosylation
  cancer_causing: boolean;
  cancer_types: string[] | null;
  created_at: string;
  updated_at: string;
}

interface UseProteinsParams {
  searchQuery?: string;
  filters?: {
    cancerCausing?: boolean;
    totalSites?: string;
    cancerTypes?: string[];
  };
  sortBy?: string;
  page?: number;
  itemsPerPage?: number;
}

export const useProteins = (params: UseProteinsParams = {}) => {
  const {
    searchQuery = "",
    filters = {},
    sortBy = "hsn_id",
    page = 1,
    itemsPerPage = 10,
  } = params;

  return useQuery({
    queryKey: ["proteins", searchQuery, filters, sortBy, page, itemsPerPage],
    queryFn: async () => {
      console.log("Fetching proteins with params:", params);

      let query = supabase.from("proteins").select("*", { count: "exact" });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `gene_name.ilike.%${searchQuery}%,protein_name.ilike.%${searchQuery}%,uniprot_id.ilike.%${searchQuery}%,hsn_id.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
      if (filters.cancerCausing !== undefined) {
        query = query.eq("cancer_causing", filters.cancerCausing);
      }
      if (filters.totalSites) {
        switch (filters.totalSites) {
          case "1":
            query = query.eq("total_sites", 1);
            break;
          case "2":
            query = query.eq("total_sites", 2);
            break;
          case "3-5":
            query = query.gte("total_sites", 3).lte("total_sites", 5);
            break;
          case "6-10":
            query = query.gte("total_sites", 6).lte("total_sites", 10);
            break;
          case "11+":
            query = query.gte("total_sites", 11);
            break;
        }
      } // Apply cancer types filter
      if (filters.cancerTypes && filters.cancerTypes.length > 0) {
        // Use the overlaps operator to check if any of the selected cancer types
        // are present in the cancer_types array column
        query = query.overlaps("cancer_types", filters.cancerTypes);
      }

      // Apply sorting
      let ascending = true;
      const orderColumn = sortBy === "relevance" ? "hsn_id" : sortBy;

      // For total_sites and protein_length, sort in descending order (larger numbers first)
      if (sortBy === "total_sites" || sortBy === "protein_length") {
        ascending = false;
      } else if (sortBy === "relevance") {
        ascending = false; // For relevance, also sort in descending order
      }

      query = query.order(orderColumn, { ascending });

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching proteins:", error);
        throw error;
      }

      console.log("Fetched proteins:", data);
      console.log("Total count:", count);

      return {
        data: data as Protein[],
        count: count || 0,
      };
    },
  });
};
