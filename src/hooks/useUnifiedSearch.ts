import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnifiedSearchResult {
  id: string;
  hsn_id: string;
  gene_name: string | null;
  protein_name: string | null;
  uniprot_id: string | null;
  source: "experimental" | "motif";
  protein_length?: number | null;
  total_sites?: number | null;
  cancer_causing?: boolean | null;
  cancer_types?: string[] | null;
}

interface UseUnifiedSearchParams {
  searchQuery?: string;
  filters?: {
    cancerCausing?: boolean;
    totalSites?: string;
    cancerTypes?: string[];
    source?: "experimental" | "motif" | "both";
  };
  sortBy?: string;
  page?: number;
  itemsPerPage?: number;
}

export const useUnifiedSearch = (params: UseUnifiedSearchParams = {}) => {
  const {
    searchQuery = "",
    filters = {},
    sortBy = "hsn_id",
    page = 1,
    itemsPerPage = 10,
  } = params;

  return useQuery({
    queryKey: [
      "unified-search",
      searchQuery,
      filters,
      sortBy,
      page,
      itemsPerPage,
    ],
    queryFn: async () => {
      console.log("Unified search with params:", params);

      const results: UnifiedSearchResult[] = [];
      let totalCount = 0;

      // Search experimental proteins if not filtering for motif only
      if (
        !filters.source ||
        filters.source === "experimental" ||
        filters.source === "both"
      ) {
        let expQuery = supabase
          .from("proteins")
          .select("*", { count: "exact" });

        // Apply search filter
        if (searchQuery) {
          expQuery = expQuery.or(
            `gene_name.ilike.%${searchQuery}%,protein_name.ilike.%${searchQuery}%,uniprot_id.ilike.%${searchQuery}%,hsn_id.ilike.%${searchQuery}%`
          );
        }

        // Apply filters
        if (filters.cancerCausing !== undefined) {
          expQuery = expQuery.eq("cancer_causing", filters.cancerCausing);
        }

        if (filters.totalSites) {
          switch (filters.totalSites) {
            case "1":
              expQuery = expQuery.eq("total_sites", 1);
              break;
            case "2":
              expQuery = expQuery.eq("total_sites", 2);
              break;
            case "3-5":
              expQuery = expQuery.gte("total_sites", 3).lte("total_sites", 5);
              break;
            case "6-10":
              expQuery = expQuery.gte("total_sites", 6).lte("total_sites", 10);
              break;
            case "11+":
              expQuery = expQuery.gte("total_sites", 11);
              break;
          }
        }

        if (filters.cancerTypes && filters.cancerTypes.length > 0) {
          expQuery = expQuery.overlaps("cancer_types", filters.cancerTypes);
        }

        const {
          data: expData,
          error: expError,
          count: expCount,
        } = await expQuery;

        if (expError) {
          console.error("Error fetching experimental proteins:", expError);
        } else if (expData) {
          const mappedExpData = expData.map((protein) => ({
            ...protein,
            source: "experimental" as const,
            total_sites: protein.total_sites,
          }));
          results.push(...mappedExpData);
          totalCount += expCount || 0;
        }
      }

      // Search motif-based proteins if not filtering for experimental only
      if (
        !filters.source ||
        filters.source === "motif" ||
        filters.source === "both"
      ) {
        let motifQuery = supabase
          .from("motif_based_proteins")
          .select("*", { count: "exact" });

        // Apply search filter
        if (searchQuery) {
          motifQuery = motifQuery.or(
            `gene_name.ilike.%${searchQuery}%,protein_name.ilike.%${searchQuery}%,uniprot_id.ilike.%${searchQuery}%,hsn_id.ilike.%${searchQuery}%`
          );
        }

        // For motif proteins, map total_motifs to total_sites for consistency
        const {
          data: motifData,
          error: motifError,
          count: motifCount,
        } = await motifQuery;

        if (motifError) {
          console.error("Error fetching motif proteins:", motifError);
        } else if (motifData) {
          const mappedMotifData = motifData.map((protein) => ({
            ...protein,
            source: "motif" as const,
            total_sites: protein.total_motifs,
            cancer_causing: null, // Motif proteins don't have cancer association data
            cancer_types: null,
          }));

          // Apply total sites filter for motif data
          let filteredMotifData = mappedMotifData;
          if (filters.totalSites) {
            filteredMotifData = mappedMotifData.filter((protein) => {
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
          }

          results.push(...filteredMotifData);
          totalCount += motifCount || 0;
        }
      }

      // Sort results
      const sortedResults = results.sort((a, b) => {
        // Prioritize experimental results when sorting by relevance
        if (sortBy === "relevance") {
          if (a.source !== b.source) {
            return a.source === "experimental" ? -1 : 1;
          }
        }

        // Apply specific sorting
        let ascending = true;
        let orderColumn = sortBy === "relevance" ? "hsn_id" : sortBy;

        if (sortBy === "total_sites" || sortBy === "protein_length") {
          ascending = false;
        }

        const aValue = a[orderColumn as keyof UnifiedSearchResult];
        const bValue = b[orderColumn as keyof UnifiedSearchResult];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return ascending ? comparison : -comparison;
      });

      // Apply pagination
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedResults = sortedResults.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      console.log(
        `Unified search results: ${paginatedResults.length} of ${sortedResults.length} total`
      );

      return {
        data: paginatedResults,
        count: sortedResults.length, // Use actual filtered count for pagination
      };
    },
  });
};
