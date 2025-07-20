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
          "🔍 [useProteins] Fetching all data for structural filtering"
        );
        const { data: allResults, error, count } = await query;

        if (error) {
          console.error("Error fetching proteins:", error);
          throw error;
        }

        allData = allResults || [];
        totalCount = count || 0;
        console.log(
          "🔍 [useProteins] Fetched all proteins for filtering:",
          allData.length
        );
      } else {
        // Normal pagination when no structural filtering
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

      // Apply SCOP filtering if specified
      if (
        results.length > 0 &&
        (filters.scopClasses?.length > 0 ||
          filters.scopFolds?.length > 0 ||
          filters.scopSuperfamilies?.length > 0 ||
          filters.scopFamilies?.length > 0 ||
          filters.scopProteinTypes?.length > 0)
      ) {
        console.log("🔍 [useProteins] Applying SCOP filtering");
        const uniprotIds = results
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
            const beforeScopFilter = results.length;
            results = results.filter(
              (protein) =>
                protein.uniprot_id &&
                validScopUniprotIds.has(protein.uniprot_id)
            );
            console.log(
              `🔍 [useProteins] SCOP filtering: ${beforeScopFilter} -> ${results.length} proteins`
            );
          } else {
            console.log(
              "❌ [useProteins] No SCOP data found, filtering out all results"
            );
            results = [];
          }
        } else {
          results = [];
        }
      }

      // Apply CATH filtering if specified
      if (
        results.length > 0 &&
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
        console.log("🔍 [useProteins] Applying CATH filtering");
        const uniprotIds = results
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
            const beforeCathFilter = results.length;
            results = results.filter(
              (protein) =>
                protein.uniprot_id &&
                validCathUniprotIds.has(protein.uniprot_id)
            );
            console.log(
              `🔍 [useProteins] CATH filtering: ${beforeCathFilter} -> ${results.length} proteins`
            );
          } else {
            console.log(
              "❌ [useProteins] No CATH data found, filtering out all results"
            );
            results = [];
          }
        } else {
          results = [];
        }
      }

      // Apply pagination to the filtered results
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedResults = results.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      console.log(
        "🔍 [useProteins] Final results after all filtering and pagination:",
        paginatedResults.length,
        "out of",
        results.length,
        "total"
      );

      return {
        data: paginatedResults,
        count: results.length, // Use the filtered count for proper pagination
      };
    },
  });
};
