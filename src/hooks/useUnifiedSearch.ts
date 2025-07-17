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
    cathPercentRanges?: string[];
    cathPldtRanges?: string[];
    cathLur?: string[];
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

        // Apply basic filters
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
          let filteredExpData = expData;

          // Apply SCOP/CATH filtering if any structural filters are applied
          const hasStructuralFilters = Object.keys(filters).some(
            (key) => key.startsWith("scop") || key.startsWith("cath")
          );

          if (hasStructuralFilters && filteredExpData.length > 0) {
            // Get UniProt IDs for structural data lookup
            const uniprotIds = filteredExpData
              .map((p) => p.uniprot_id)
              .filter(Boolean);

            if (uniprotIds.length > 0) {
              // Fetch SCOP data if SCOP filters are applied
              let scopData: any[] = [];
              const hasScopFilters = Object.keys(filters).some((key) =>
                key.startsWith("scop")
              );
              if (hasScopFilters) {
                let scopQuery = supabase
                  .from("scop")
                  .select("*")
                  .in("uniprot_id", uniprotIds);

                if (filters.scopClasses && filters.scopClasses.length > 0) {
                  scopQuery = scopQuery.in("class_name", filters.scopClasses);
                }
                if (filters.scopFolds && filters.scopFolds.length > 0) {
                  scopQuery = scopQuery.in("fold_name", filters.scopFolds);
                }
                if (
                  filters.scopSuperfamilies &&
                  filters.scopSuperfamilies.length > 0
                ) {
                  scopQuery = scopQuery.in(
                    "superfamily_name",
                    filters.scopSuperfamilies
                  );
                }
                if (filters.scopFamilies && filters.scopFamilies.length > 0) {
                  scopQuery = scopQuery.in("family_name", filters.scopFamilies);
                }
                if (
                  filters.scopProteinTypes &&
                  filters.scopProteinTypes.length > 0
                ) {
                  scopQuery = scopQuery.in(
                    "protein_type_name",
                    filters.scopProteinTypes
                  );
                }

                const { data: scopResult } = await scopQuery;
                scopData = scopResult || [];
              }

              // Fetch CATH data if CATH filters are applied
              let cathData: any[] = [];
              const hasCathFilters = Object.keys(filters).some((key) =>
                key.startsWith("cath")
              );
              if (hasCathFilters) {
                let cathQuery = supabase
                  .from("cath")
                  .select("*")
                  .in("uniprot_id", uniprotIds);

                if (filters.cathClasses && filters.cathClasses.length > 0) {
                  cathQuery = cathQuery.in("CATH_Class", filters.cathClasses);
                }
                if (
                  filters.cathArchitectures &&
                  filters.cathArchitectures.length > 0
                ) {
                  cathQuery = cathQuery.in(
                    "CATH_Architecture",
                    filters.cathArchitectures
                  );
                }
                if (
                  filters.cathTopologies &&
                  filters.cathTopologies.length > 0
                ) {
                  cathQuery = cathQuery.in(
                    "CATH_Topology",
                    filters.cathTopologies
                  );
                }
                if (
                  filters.cathSuperfamilies &&
                  filters.cathSuperfamilies.length > 0
                ) {
                  cathQuery = cathQuery.in(
                    "CATH_Superfamily",
                    filters.cathSuperfamilies
                  );
                }
                if (filters.cathSources && filters.cathSources.length > 0) {
                  cathQuery = cathQuery.in("source", filters.cathSources);
                }
                if (
                  filters.cathAssignments &&
                  filters.cathAssignments.length > 0
                ) {
                  cathQuery = cathQuery.in(
                    "assignment",
                    filters.cathAssignments
                  );
                }
                if (filters.cathOrganisms && filters.cathOrganisms.length > 0) {
                  cathQuery = cathQuery.in("organism", filters.cathOrganisms);
                }
                if (filters.cathPackings && filters.cathPackings.length > 0) {
                  cathQuery = cathQuery.in("packing", filters.cathPackings);
                }
                if (filters.cathLur && filters.cathLur.length > 0) {
                  const lurValue = filters.cathLur.includes("Yes");
                  cathQuery = cathQuery.eq("LUR", lurValue);
                }

                const { data: cathResult } = await cathQuery;
                cathData = cathResult || [];

                // Apply client-side filtering for CATH range filters
                if (
                  filters.cathLengthRanges &&
                  filters.cathLengthRanges.length > 0
                ) {
                  cathData = cathData.filter((cath) => {
                    if (!cath.length) return false;
                    return filters.cathLengthRanges!.some((range) => {
                      switch (range) {
                        case "1-100":
                          return cath.length >= 1 && cath.length <= 100;
                        case "101-200":
                          return cath.length >= 101 && cath.length <= 200;
                        case "201-300":
                          return cath.length >= 201 && cath.length <= 300;
                        case "301-500":
                          return cath.length >= 301 && cath.length <= 500;
                        case "501-1000":
                          return cath.length >= 501 && cath.length <= 1000;
                        case "1000+":
                          return cath.length > 1000;
                        default:
                          return false;
                      }
                    });
                  });
                }

                if (filters.cathSseRanges && filters.cathSseRanges.length > 0) {
                  cathData = cathData.filter((cath) => {
                    if (cath.SSEs === null) return false;
                    return filters.cathSseRanges!.some((range) => {
                      switch (range) {
                        case "1-5":
                          return cath.SSEs >= 1 && cath.SSEs <= 5;
                        case "6-10":
                          return cath.SSEs >= 6 && cath.SSEs <= 10;
                        case "11-15":
                          return cath.SSEs >= 11 && cath.SSEs <= 15;
                        case "16-20":
                          return cath.SSEs >= 16 && cath.SSEs <= 20;
                        case "21+":
                          return cath.SSEs > 20;
                        default:
                          return false;
                      }
                    });
                  });
                }

                if (
                  filters.cathPercentRanges &&
                  filters.cathPercentRanges.length > 0
                ) {
                  cathData = cathData.filter((cath) => {
                    if (cath.perc_not_in_SS === null) return false;
                    return filters.cathPercentRanges!.some((range) => {
                      switch (range) {
                        case "0-10%":
                          return (
                            cath.perc_not_in_SS >= 0 &&
                            cath.perc_not_in_SS <= 10
                          );
                        case "11-25%":
                          return (
                            cath.perc_not_in_SS >= 11 &&
                            cath.perc_not_in_SS <= 25
                          );
                        case "26-50%":
                          return (
                            cath.perc_not_in_SS >= 26 &&
                            cath.perc_not_in_SS <= 50
                          );
                        case "51-75%":
                          return (
                            cath.perc_not_in_SS >= 51 &&
                            cath.perc_not_in_SS <= 75
                          );
                        case "76-100%":
                          return (
                            cath.perc_not_in_SS >= 76 &&
                            cath.perc_not_in_SS <= 100
                          );
                        default:
                          return false;
                      }
                    });
                  });
                }

                if (
                  filters.cathPldtRanges &&
                  filters.cathPldtRanges.length > 0
                ) {
                  cathData = cathData.filter((cath) => {
                    if (!cath.pLDDT) return false;
                    const plddt = parseFloat(cath.pLDDT);
                    if (isNaN(plddt)) return false;
                    return filters.cathPldtRanges!.some((range) => {
                      switch (range) {
                        case "Very High (90-100)":
                          return plddt >= 90 && plddt <= 100;
                        case "High (70-89)":
                          return plddt >= 70 && plddt < 90;
                        case "Medium (50-69)":
                          return plddt >= 50 && plddt < 70;
                        case "Low (0-49)":
                          return plddt >= 0 && plddt < 50;
                        default:
                          return false;
                      }
                    });
                  });
                }
              }

              // Filter proteins based on structural data matches
              const validUniprotIds = new Set();

              if (hasScopFilters && !hasCathFilters) {
                // Only SCOP filters applied
                scopData.forEach((scop) =>
                  validUniprotIds.add(scop.uniprot_id)
                );
              } else if (!hasScopFilters && hasCathFilters) {
                // Only CATH filters applied
                cathData.forEach((cath) =>
                  validUniprotIds.add(cath.uniprot_id)
                );
              } else if (hasScopFilters && hasCathFilters) {
                // Both SCOP and CATH filters applied - need intersection
                const scopUniprots = new Set(scopData.map((s) => s.uniprot_id));
                const cathUniprots = new Set(cathData.map((c) => c.uniprot_id));
                scopUniprots.forEach((id) => {
                  if (cathUniprots.has(id)) {
                    validUniprotIds.add(id);
                  }
                });
              }

              // Filter proteins to only those with matching structural data
              if (validUniprotIds.size > 0) {
                filteredExpData = filteredExpData.filter((protein) =>
                  validUniprotIds.has(protein.uniprot_id)
                );
              } else {
                // No matches found
                filteredExpData = [];
              }
            } else {
              // No UniProt IDs available, can't apply structural filters
              filteredExpData = [];
            }
          }

          const mappedExpData = filteredExpData.map((protein) => ({
            ...protein,
            source: "experimental" as const,
            total_sites: protein.total_sites,
          }));
          results.push(...mappedExpData);
          totalCount += filteredExpData.length;
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

        // For motif proteins, they already have total_sites field
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
