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
    // SCOP filters
    scopClasses?: string[];
    scopFolds?: string[];
    scopSuperfamilies?: string[];
    scopFamilies?: string[];
    scopProteinTypes?: string[];
    // CATH filters
    cathClasses?: string[];
    cathArchitectures?: string[];
    cathTopologies?: string[];
    cathSuperfamilies?: string[];
    cathSources?: string[];
    cathAssignments?: string[];
    cathOrganisms?: string[];
    cathPackings?: string[];
    cathLengthRanges?: string[];
    cathSseRanges?: string[];
    cathPldtRanges?: string[];
    cathLur?: string[];
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

      // Check if we need any filtering that requires fetching all data first
      const needsStructuralFiltering =
        (filters.cathPercentRanges && filters.cathPercentRanges.length > 0) ||
        (filters.scopClasses && filters.scopClasses.length > 0) ||
        (filters.scopFolds && filters.scopFolds.length > 0) ||
        (filters.scopSuperfamilies && filters.scopSuperfamilies.length > 0) ||
        (filters.scopFamilies && filters.scopFamilies.length > 0) ||
        (filters.scopProteinTypes && filters.scopProteinTypes.length > 0) ||
        (filters.cathClasses && filters.cathClasses.length > 0) ||
        (filters.cathArchitectures && filters.cathArchitectures.length > 0) ||
        (filters.cathTopologies && filters.cathTopologies.length > 0) ||
        (filters.cathSuperfamilies && filters.cathSuperfamilies.length > 0) ||
        (filters.cathSources && filters.cathSources.length > 0) ||
        (filters.cathAssignments && filters.cathAssignments.length > 0) ||
        (filters.cathOrganisms && filters.cathOrganisms.length > 0) ||
        (filters.cathPackings && filters.cathPackings.length > 0) ||
        (filters.cathLengthRanges && filters.cathLengthRanges.length > 0) ||
        (filters.cathSseRanges && filters.cathSseRanges.length > 0) ||
        (filters.cathPldtRanges && filters.cathPldtRanges.length > 0) ||
        (filters.cathLur && filters.cathLur.length > 0);

      let allData: any[] = [];
      let totalCount = 0;

      if (needsStructuralFiltering) {
        // Fetch ALL data without pagination for structural filtering
        console.log(
          "🔍 [useMotifProteins] Fetching all data for structural filtering"
        );
        const { data: allResults, error, count } = await query;

        if (error) {
          console.error("Error fetching motif proteins:", error);
          throw new Error(`Failed to fetch motif proteins: ${error.message}`);
        }

        allData = allResults || [];
        totalCount = count || 0;
        console.log(
          "🔍 [useMotifProteins] Fetched all motif proteins for filtering:",
          allData.length
        );
      } else {
        // Normal pagination when no structural filtering
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);
      }
      try {
        let safeData: any[] = [];
        let finalCount = 0;

        if (needsStructuralFiltering) {
          // Process all data for structural filtering
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

          console.log(
            "Fetched motif proteins:",
            data ? data.length : 0,
            "items"
          );
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

        // Apply SCOP filtering if specified
        if (
          filteredData.length > 0 &&
          (filters.scopClasses?.length > 0 ||
            filters.scopFolds?.length > 0 ||
            filters.scopSuperfamilies?.length > 0 ||
            filters.scopFamilies?.length > 0 ||
            filters.scopProteinTypes?.length > 0)
        ) {
          console.log("🔍 [useMotifProteins] Applying SCOP filtering");
          const uniprotIds = filteredData
            .map((r) => r.uniprot_id)
            .filter(Boolean)
            .filter((id, index, self) => self.indexOf(id) === index);

          if (uniprotIds.length > 0) {
            let scopQuery = supabase
              .from("scop")
              .select("uniprot_id")
              .in("uniprot_id", uniprotIds);

            if (filters.scopClasses?.length > 0) {
              scopQuery = scopQuery.in("class_name", filters.scopClasses);
            }
            if (filters.scopFolds?.length > 0) {
              scopQuery = scopQuery.in("fold_name", filters.scopFolds);
            }
            if (filters.scopSuperfamilies?.length > 0) {
              scopQuery = scopQuery.in(
                "superfamily_name",
                filters.scopSuperfamilies
              );
            }
            if (filters.scopFamilies?.length > 0) {
              scopQuery = scopQuery.in("family_name", filters.scopFamilies);
            }
            if (filters.scopProteinTypes?.length > 0) {
              scopQuery = scopQuery.in(
                "protein_type_name",
                filters.scopProteinTypes
              );
            }

            const { data: scopData, error: scopError } = await scopQuery;

            if (scopError) {
              console.error("Error fetching SCOP data:", scopError);
            } else if (scopData?.length > 0) {
              const validScopUniprotIds = new Set(
                scopData.map((s) => s.uniprot_id)
              );
              const beforeScopFilter = filteredData.length;
              filteredData = filteredData.filter(
                (protein) =>
                  protein.uniprot_id &&
                  validScopUniprotIds.has(protein.uniprot_id)
              );
              console.log(
                `🔍 [useMotifProteins] SCOP filtering: ${beforeScopFilter} -> ${filteredData.length} proteins`
              );
            } else {
              console.log(
                "❌ [useMotifProteins] No SCOP data found, filtering out all results"
              );
              filteredData = [];
            }
          } else {
            filteredData = [];
          }
        }

        // Apply CATH filtering if specified
        if (
          filteredData.length > 0 &&
          (filters.cathClasses?.length > 0 ||
            filters.cathArchitectures?.length > 0 ||
            filters.cathTopologies?.length > 0 ||
            filters.cathSuperfamilies?.length > 0 ||
            filters.cathSources?.length > 0 ||
            filters.cathAssignments?.length > 0 ||
            filters.cathOrganisms?.length > 0 ||
            filters.cathPackings?.length > 0 ||
            filters.cathLengthRanges?.length > 0 ||
            filters.cathSseRanges?.length > 0 ||
            filters.cathPldtRanges?.length > 0 ||
            filters.cathLur?.length > 0)
        ) {
          console.log("🔍 [useMotifProteins] Applying CATH filtering");
          const uniprotIds = filteredData
            .map((r) => r.uniprot_id)
            .filter(Boolean)
            .filter((id, index, self) => self.indexOf(id) === index);

          if (uniprotIds.length > 0) {
            let cathQuery = supabase
              .from("cath")
              .select("*")
              .in("uniprot_id", uniprotIds);

            const { data: cathData, error: cathError } = await cathQuery;

            if (cathError) {
              console.error("Error fetching CATH data:", cathError);
            } else if (cathData?.length > 0) {
              // Apply CATH filters
              let filteredCathData = cathData;

              if (filters.cathClasses?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathClasses!.includes(cath.CATH_Class)
                );
              }
              if (filters.cathArchitectures?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathArchitectures!.includes(cath.CATH_Architecture)
                );
              }
              if (filters.cathTopologies?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathTopologies!.includes(cath.CATH_Topology)
                );
              }
              if (filters.cathSuperfamilies?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathSuperfamilies!.includes(cath.CATH_Superfamily)
                );
              }
              if (filters.cathSources?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathSources!.includes(cath.source)
                );
              }
              if (filters.cathAssignments?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathAssignments!.includes(cath.assignment)
                );
              }
              if (filters.cathOrganisms?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathOrganisms!.includes(cath.organism)
                );
              }
              if (filters.cathPackings?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) =>
                  filters.cathPackings!.includes(cath.packing)
                );
              }

              // Apply range filters
              if (filters.cathLengthRanges?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) => {
                  if (cath.length === null) return false;
                  return filters.cathLengthRanges!.some((range) => {
                    switch (range) {
                      case "1-50":
                        return cath.length >= 1 && cath.length <= 50;
                      case "51-100":
                        return cath.length >= 51 && cath.length <= 100;
                      case "101-200":
                        return cath.length >= 101 && cath.length <= 200;
                      case "201-300":
                        return cath.length >= 201 && cath.length <= 300;
                      case "301+":
                        return cath.length >= 301;
                      default:
                        return false;
                    }
                  });
                });
              }

              if (filters.cathSseRanges?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) => {
                  if (cath.SSEs === null) return false;
                  return filters.cathSseRanges!.some((range) => {
                    switch (range) {
                      case "1-5":
                        return cath.SSEs >= 1 && cath.SSEs <= 5;
                      case "6-10":
                        return cath.SSEs >= 6 && cath.SSEs <= 10;
                      case "11-15":
                        return cath.SSEs >= 11 && cath.SSEs <= 15;
                      case "16+":
                        return cath.SSEs >= 16;
                      default:
                        return false;
                    }
                  });
                });
              }

              if (filters.cathPldtRanges?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) => {
                  if (!cath.pLDDT) return false;
                  const plddt = parseFloat(cath.pLDDT);
                  if (isNaN(plddt)) return false;
                  return filters.cathPldtRanges!.some((range) => {
                    switch (range) {
                      case "0-50":
                        return plddt >= 0 && plddt <= 50;
                      case "51-70":
                        return plddt >= 51 && plddt <= 70;
                      case "71-90":
                        return plddt >= 71 && plddt <= 90;
                      case "91-100":
                        return plddt >= 91 && plddt <= 100;
                      default:
                        return false;
                    }
                  });
                });
              }

              if (filters.cathLur?.length > 0) {
                filteredCathData = filteredCathData.filter((cath) => {
                  return filters.cathLur!.some((lur) => {
                    switch (lur) {
                      case "true":
                        return cath.LUR === true;
                      case "false":
                        return cath.LUR === false;
                      default:
                        return false;
                    }
                  });
                });
              }

              const validCathUniprotIds = new Set(
                filteredCathData.map((c) => c.uniprot_id)
              );
              const beforeCathFilter = filteredData.length;
              filteredData = filteredData.filter(
                (protein) =>
                  protein.uniprot_id &&
                  validCathUniprotIds.has(protein.uniprot_id)
              );
              console.log(
                `🔍 [useMotifProteins] CATH filtering: ${beforeCathFilter} -> ${filteredData.length} proteins`
              );
            } else {
              console.log(
                "❌ [useMotifProteins] No CATH data found, filtering out all results"
              );
              filteredData = [];
            }
          } else {
            filteredData = [];
          }
        }

        // If structural filtering is needed, apply pagination to the filtered results
        if (needsStructuralFiltering) {
          // Apply pagination to the filtered results
          const startIndex = (page - 1) * itemsPerPage;
          const paginatedResults = filteredData.slice(
            startIndex,
            startIndex + itemsPerPage
          );

          console.log(
            "🔍 [useMotifProteins] Final results after structural filtering and pagination:",
            paginatedResults.length,
            "out of",
            filteredData.length,
            "total"
          );

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
