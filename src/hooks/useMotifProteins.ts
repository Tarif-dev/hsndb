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
    cathPercentRanges?: string[];
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
        console.log("🔍 [useMotifProteins] Fetching all data for disorder filtering");
        const { data: allResults, error, count } = await query;

        if (error) {
          console.error("Error fetching motif proteins:", error);
          throw new Error(`Failed to fetch motif proteins: ${error.message}`);
        }

        allData = allResults || [];
        totalCount = count || 0;
        console.log("🔍 [useMotifProteins] Fetched all motif proteins for filtering:", allData.length);

      } else {
        // Normal pagination when no disorder filtering
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);
      }
      try {
        let safeData: any[] = [];
        let finalCount = 0;

        if (needsDisorderFiltering) {
          // Process all data for disorder filtering
          safeData = (allData || []).map((item) => {
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
          finalCount = totalCount;
        } else {
          // Normal pagination path
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
          console.log("Total count:", count || 0);

          // Make sure we're handling empty data appropriately and ensure all required fields exist
          safeData = (data || []).map((item) => {
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
          finalCount = count || 0;
        }

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

        // Apply disorder percentage filtering if specified
        if (
          filters.cathPercentRanges &&
          filters.cathPercentRanges.length > 0 &&
          filteredData.length > 0
        ) {
          console.log(
            "🔍 [useMotifProteins] Applying disorder filtering with ranges:",
            filters.cathPercentRanges
          );
          console.log(
            "🔍 [useMotifProteins] Total results before disorder filtering:",
            filteredData.length
          );

          // Get unique uniprot_ids from results
          const uniprotIds = filteredData
            .map((r) => r.uniprot_id)
            .filter(Boolean)
            .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

          console.log(
            "🔍 [useMotifProteins] Unique UniProt IDs found:",
            uniprotIds.length
          );

          if (uniprotIds.length > 0) {
            // Fetch disorder data for these proteins - try both percentage_disorder and scores
            const { data: disorderData, error: disorderError } = await supabase
              .from("protein_disorder")
              .select("uniprot_id, percentage_disorder, scores")
              .in("uniprot_id", uniprotIds);

            console.log("🔍 [useMotifProteins] Disorder data query result:", {
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
                "🔍 [useMotifProteins] Disorder percentage map size:",
                disorderPercentageMap.size
              );
              console.log(
                "🔍 [useMotifProteins] Sample disorder data:",
                Array.from(disorderPercentageMap.entries()).slice(0, 3)
              );

              const originalResultsCount = filteredData.length;
              // Filter results based on disorder percentage
              filteredData = filteredData.filter((protein) => {
                if (!protein.uniprot_id) return false;
                const disorderPercentage = disorderPercentageMap.get(
                  protein.uniprot_id
                );
                if (
                  disorderPercentage === undefined ||
                  disorderPercentage === null
                )
                  return false;

                const matchesRange = filters.cathPercentRanges!.some(
                  (range) => {
                    switch (range) {
                      case "0-10%":
                        return (
                          disorderPercentage >= 0 && disorderPercentage <= 10
                        );
                      case "11-25%":
                        return (
                          disorderPercentage >= 11 && disorderPercentage <= 25
                        );
                      case "26-50%":
                        return (
                          disorderPercentage >= 26 && disorderPercentage <= 50
                        );
                      case "51-75%":
                        return (
                          disorderPercentage >= 51 && disorderPercentage <= 75
                        );
                      case "76-100%":
                        return (
                          disorderPercentage >= 76 && disorderPercentage <= 100
                        );
                      default:
                        return false;
                    }
                  }
                );

                if (matchesRange) {
                  console.log(
                    `✅ [useMotifProteins] Protein ${protein.uniprot_id} with ${disorderPercentage}% disorder matches filter`
                  );
                }

                return matchesRange;
              });

              console.log(
                "🔍 [useMotifProteins] Results after disorder filtering:",
                filteredData.length,
                "out of",
                originalResultsCount
              );
            } else {
              console.log(
                "❌ [useMotifProteins] No disorder data found, filtering out all results"
              );
              // No disorder data found, so no proteins match the disorder filter
              filteredData = [];
            }
          } else {
            console.log(
              "❌ [useMotifProteins] No uniprot_ids to filter by, filtering out all results"
            );
            // No uniprot_ids to filter by, so no results
            filteredData = [];
          }
        }

        // If disorder filtering is needed, apply pagination to the filtered results
        if (needsDisorderFiltering) {
          // Apply pagination to the filtered results
          const startIndex = (page - 1) * itemsPerPage;
          const paginatedResults = filteredData.slice(startIndex, startIndex + itemsPerPage);

          console.log("🔍 [useMotifProteins] Final results after disorder filtering and pagination:", paginatedResults.length, "out of", filteredData.length, "total");

          return {
            data: paginatedResults as MotifProtein[],
            count: filteredData.length, // Use the filtered count for proper pagination
          };
        } else {
          return {
            data: filteredData as MotifProtein[],
            count: finalCount, // Use the original count from the database
          };
        }
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
