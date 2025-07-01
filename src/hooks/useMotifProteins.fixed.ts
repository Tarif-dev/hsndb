import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MotifProtein {
  id: string;
  hsn_id: string; // Unique identifier for the Human S-nitrosylated protein in the database
  gene_name: string | null; // Name of the gene encoding the protein
  uniprot_id: string | null; // UniProt accession number for the protein
  protein_name: string | null; // Full name of the protein
  protein_length: number | null; // Number of amino acids in the protein
  alphafold_id: string | null; // Corresponding AlphaFold structure ID
  positions_of_nitrosylation: string | null; // Specific residue positions where the [I/L]-X-C-X₂-[D/E] motif is found
  total_sites: number | null; // Total number of motif occurrences in the protein
  created_at: string;
  updated_at: string;
}

interface UseMotifProteinsParams {
  searchQuery?: string;
  filters?: {
    totalSites?: string;
  };
  sortBy?: string;
  page?: number;
  itemsPerPage?: number;
}

export const useMotifProteins = (params: UseMotifProteinsParams = {}) => {
  const {
    searchQuery = "",
    filters = {},
    sortBy = "hsn_id",
    page = 1,
    itemsPerPage = 10,
  } = params;

  return useQuery({
    queryKey: [
      "motif-proteins",
      searchQuery,
      filters,
      sortBy,
      page,
      itemsPerPage,
    ],
    queryFn: async () => {
      console.log("Fetching motif proteins with params:", params);

      let query = supabase
        .from("motif_based_proteins")
        .select("*", { count: "exact" });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `gene_name.ilike.%${searchQuery}%,protein_name.ilike.%${searchQuery}%,uniprot_id.ilike.%${searchQuery}%,hsn_id.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
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
          case "6+":
            query = query.gte("total_sites", 6);
            break;
        }
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

      try {
        // Extra safety - log the SQL being executed
        console.log("Executing query for motif proteins");

        const { data, error, count } = await query;

        if (error) {
          console.error("Error fetching motif proteins:", error);
          throw new Error(`Failed to fetch motif proteins: ${error.message}`);
        }

        console.log("Fetched motif proteins:", data ? data.length : 0, "items");
        console.log("Total count:", count);

        // Make sure we're handling empty data appropriately and ensure all required fields exist
        const safeData = (data || []).map((protein) => ({
          ...protein,
          // Ensure all required fields have fallback values
          id: protein.id || "",
          hsn_id: protein.hsn_id || "",
          gene_name: protein.gene_name || null,
          uniprot_id: protein.uniprot_id || null,
          protein_name: protein.protein_name || null,
          protein_length: protein.protein_length || null,
          alphafold_id: protein.alphafold_id || null,
          positions_of_nitrosylation:
            protein.positions_of_nitrosylation || null,
          total_sites: protein.total_sites || 0,
          created_at: protein.created_at || new Date().toISOString(),
          updated_at: protein.updated_at || new Date().toISOString(),
        }));

        return {
          data: safeData as MotifProtein[],
          count: count || 0,
        };
      } catch (err) {
        console.error("Exception in useMotifProteins:", err);
        // Return empty data set instead of crashing
        return {
          data: [] as MotifProtein[],
          count: 0,
        };
      }
    },
  });
};
