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
  total_sites: number | null; // Number of nitrosylation sites
  positions_of_nitrosylation: number[] | null; // Positions of nitrosylation sites
  cancer_causing: boolean | null; // Whether the protein is associated with cancer
  cancer_types: string[] | null; // Types of cancer associated with the protein
  created_at: string;
  updated_at: string;
}

interface UseMotifProteinsParams {
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

export const useMotifProteins = (params: UseMotifProteinsParams = {}) => {
  const {
    searchQuery = "",
    filters = {},
    sortBy = "hsn_id",
    page = 1,
    itemsPerPage = 10,
  } = params;

  // Debug logging to track query creation
  console.log("useMotifProteins hook called with:", {
    searchQuery,
    filters,
    sortBy,
    page,
    itemsPerPage,
  });

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

      // First, check if we can access any table to verify connection
      try {
        const tablesTest = await supabase
          .from("proteins")
          .select("id", { count: "exact" })
          .limit(1);

        console.log("Database connection test:", {
          success: !tablesTest.error,
          count: tablesTest.count,
          error: tablesTest.error?.message,
        });
      } catch (err) {
        console.error("Database connection test failed:", err);
      } // Build the base query
      const baseQuery = supabase.from("motif_based_proteins");

      // Apply filters step by step
      let query = baseQuery.select("*", { count: "exact" });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `gene_name.ilike.%${searchQuery}%,protein_name.ilike.%${searchQuery}%,uniprot_id.ilike.%${searchQuery}%,hsn_id.ilike.%${searchQuery}%`
        );
      }

      // Apply cancer causing filter
      if (filters.cancerCausing === true) {
        console.log("Applying cancer causing filter: true");
        query = query.is("cancer_causing", true);
      } else if (filters.cancerCausing === false) {
        console.log("Applying cancer causing filter: false");
        query = query.is("cancer_causing", false);
      }

      // Apply cancer types filter
      if (filters.cancerTypes && filters.cancerTypes.length > 0) {
        console.log("Applying cancer types filter:", filters.cancerTypes);
        query = query.overlaps("cancer_types", filters.cancerTypes);
      }

      // Apply sorting
      let ascending = true;
      const orderColumn = sortBy === "relevance" ? "hsn_id" : sortBy;

      // For total_motifs and protein_length, sort in descending order (larger numbers first)
      if (sortBy === "total_motifs" || sortBy === "protein_length") {
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
        // Extra safety - log the query details
        console.log("Executing query for motif proteins");

        const response = await query;
        const { data, error, count } = response;

        console.log("Raw database response:", {
          hasData: Boolean(data),
          dataLength: data ? data.length : 0,
          error: error ? error.message : null,
          count,
        });

        if (error) {
          console.error("Error fetching motif proteins:", error);
          throw new Error(`Failed to fetch motif proteins: ${error.message}`);
        }

        console.log("Fetched motif proteins:", data ? data.length : 0, "items");
        console.log("Sample data:", data ? data.slice(0, 2) : null);
        console.log("Total count:", count || 0); // Make sure we're handling empty data appropriately and ensure all required fields exist
        const safeData = (data || []).map((item) => {
          return {
            // Basic motif protein fields
            id: item.id || "",
            hsn_id: item.hsn_id || "",
            gene_name: item.gene_name || null,
            uniprot_id: item.uniprot_id || null,
            protein_name: item.protein_name || null,
            protein_length: item.protein_length || null,
            alphafold_id: item.alphafold_id || null,
            // Add nitrosylation site information
            total_sites: (item as any).total_sites || null,
            positions_of_nitrosylation:
              (item as any).positions_of_nitrosylation || null,

            // Get cancer information directly from motif_based_proteins table
            cancer_causing: (item as any).cancer_causing || null,
            cancer_types: (item as any).cancer_types || null,

            // Timestamps
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
          };
        });

        // Apply only client-side filters that can't be done at DB level
        let filteredData = safeData;

        console.log("Processing data - count:", filteredData.length);
        console.log("Filters received:", filters);

        // Apply total sites filter if needed (this can't be done at DB level easily)
        if (filters.totalSites) {
          console.log("Applying total sites filter:", filters.totalSites);
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter((protein) => {
            const totalSites = protein.total_sites || 0;
            switch (filters.totalSites) {
              case "1":
                return totalSites === 1;
              case "2":
                return totalSites === 2;
              case "3-5":
                return totalSites >= 3 && totalSites <= 5;
              case "6-10":
                return totalSites >= 6 && totalSites <= 10;
              case "11+":
                return totalSites >= 11;
              default:
                return true;
            }
          });
          console.log(
            `Total sites filter applied: ${beforeFilter} -> ${filteredData.length} proteins`
          );
        }

        return {
          data: filteredData as MotifProtein[],
          count: count || 0, // Use the original count from the database
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
