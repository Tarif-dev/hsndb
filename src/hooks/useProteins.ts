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
    cathPercentRanges?: string[];
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

      // Check if we need disorder filtering - if so, fetch all data first, then filter and paginate
      const needsDisorderFiltering = filters.cathPercentRanges && filters.cathPercentRanges.length > 0;

      let allData: any[] = [];
      let totalCount = 0;

      if (needsDisorderFiltering) {
        // Fetch ALL data without pagination for disorder filtering
        console.log("🔍 [useProteins] Fetching all data for disorder filtering");
        const { data: allResults, error, count } = await query;

        if (error) {
          console.error("Error fetching proteins:", error);
          throw error;
        }

        allData = allResults || [];
        totalCount = count || 0;
        console.log("🔍 [useProteins] Fetched all proteins for filtering:", allData.length);

      } else {
        // Normal pagination when no disorder filtering
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
      }

      let results = allData as Protein[];

      // Apply disorder percentage filtering if specified
      if (
        filters.cathPercentRanges &&
        filters.cathPercentRanges.length > 0 &&
        results.length > 0
      ) {
        console.log(
          "🔍 [useProteins] Applying disorder filtering with ranges:",
          filters.cathPercentRanges
        );
        console.log(
          "🔍 [useProteins] Total results before disorder filtering:",
          results.length
        );

        // Get unique uniprot_ids from results
        const uniprotIds = results
          .map((r) => r.uniprot_id)
          .filter(Boolean)
          .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

        console.log(
          "🔍 [useProteins] Unique UniProt IDs found:",
          uniprotIds.length
        );

        if (uniprotIds.length > 0) {
          // Fetch disorder data for these proteins - try both percentage_disorder and scores
          const { data: disorderData, error: disorderError } = await supabase
            .from("protein_disorder")
            .select("uniprot_id, percentage_disorder, scores")
            .in("uniprot_id", uniprotIds);

          console.log("🔍 [useProteins] Disorder data query result:", {
            dataCount: disorderData?.length || 0,
            error: disorderError?.message,
            sampleData: disorderData?.slice(0, 3),
          });

          if (disorderData && disorderData.length > 0) {
            // Create a map of disorder percentages
            const disorderPercentageMap = new Map<string, number>();
            disorderData.forEach((protein) => {
              let percentage = 0;

              // Try to use percentage_disorder column first, fallback to calculating from scores
              if (
                protein.percentage_disorder !== null &&
                protein.percentage_disorder !== undefined
              ) {
                percentage = protein.percentage_disorder;
              } else if (
                protein.scores &&
                Array.isArray(protein.scores) &&
                protein.scores.length > 0
              ) {
                // Calculate percentage from scores (>= 0.5 threshold)
                const disorderedCount = protein.scores.filter(
                  (score: number) => score >= 0.5
                ).length;
                percentage = (disorderedCount / protein.scores.length) * 100;
              }

              if (percentage > 0) {
                disorderPercentageMap.set(protein.uniprot_id, percentage);
              }
            });

            console.log(
              "🔍 [useProteins] Disorder percentage map size:",
              disorderPercentageMap.size
            );
            console.log(
              "🔍 [useProteins] Sample disorder data:",
              Array.from(disorderPercentageMap.entries()).slice(0, 3)
            );

            const originalResultsCount = results.length;
            // Filter results based on disorder percentage
            results = results.filter((protein) => {
              if (!protein.uniprot_id) return false;
              const disorderPercentage = disorderPercentageMap.get(
                protein.uniprot_id
              );
              if (
                disorderPercentage === undefined ||
                disorderPercentage === null
              )
                return false;

              const matchesRange = filters.cathPercentRanges!.some((range) => {
                switch (range) {
                  case "0-10%":
                    return disorderPercentage >= 0 && disorderPercentage <= 10;
                  case "11-25%":
                    return disorderPercentage >= 11 && disorderPercentage <= 25;
                  case "26-50%":
                    return disorderPercentage >= 26 && disorderPercentage <= 50;
                  case "51-75%":
                    return disorderPercentage >= 51 && disorderPercentage <= 75;
                  case "76-100%":
                    return (
                      disorderPercentage >= 76 && disorderPercentage <= 100
                    );
                  default:
                    return false;
                }
              });

              if (matchesRange) {
                console.log(
                  `✅ [useProteins] Protein ${protein.uniprot_id} with ${disorderPercentage}% disorder matches filter`
                );
              }

              return matchesRange;
            });

            console.log(
              "🔍 [useProteins] Results after disorder filtering:",
              results.length,
              "out of",
              originalResultsCount
            );
          } else {
            console.log(
              "❌ [useProteins] No disorder data found, filtering out all results"
            );
            // No disorder data found, so no proteins match the disorder filter
            results = [];
          }
        } else {
          console.log(
            "❌ [useProteins] No uniprot_ids to filter by, filtering out all results"
          );
          // No uniprot_ids to filter by, so no results
          results = [];
        }
      }

      // Apply pagination to the filtered results
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

      console.log("🔍 [useProteins] Final results after disorder filtering and pagination:", paginatedResults.length, "out of", results.length, "total");

      return {
        data: paginatedResults,
        count: results.length, // Use the filtered count for proper pagination
      };
    },
  });
};
