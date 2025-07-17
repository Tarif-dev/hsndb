import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook to fetch unique SCOP filter values
export const useScopFilterOptions = () => {
  return useQuery({
    queryKey: ["scop-filter-options"],
    queryFn: async () => {
      // Fetch all unique values from SCOP table
      const [
        classNames,
        foldNames,
        superfamilyNames,
        familyNames,
        proteinTypes,
      ] = await Promise.all([
        // Class names
        supabase
          .from("scop")
          .select("class_name")
          .not("class_name", "is", null)
          .order("class_name"),

        // Fold names
        supabase
          .from("scop")
          .select("fold_name")
          .not("fold_name", "is", null)
          .order("fold_name"),

        // Superfamily names
        supabase
          .from("scop")
          .select("superfamily_name")
          .not("superfamily_name", "is", null)
          .order("superfamily_name"),

        // Family names
        supabase
          .from("scop")
          .select("family_name")
          .not("family_name", "is", null)
          .order("family_name"),

        // Protein type names
        supabase
          .from("scop")
          .select("protein_type_name")
          .not("protein_type_name", "is", null)
          .order("protein_type_name"),
      ]);

      // Extract unique values
      const uniqueClassNames = [
        ...new Set(
          classNames.data?.map((item) => item.class_name).filter(Boolean)
        ),
      ];
      const uniqueFoldNames = [
        ...new Set(
          foldNames.data?.map((item) => item.fold_name).filter(Boolean)
        ),
      ];
      const uniqueSuperfamilyNames = [
        ...new Set(
          superfamilyNames.data
            ?.map((item) => item.superfamily_name)
            .filter(Boolean)
        ),
      ];
      const uniqueFamilyNames = [
        ...new Set(
          familyNames.data?.map((item) => item.family_name).filter(Boolean)
        ),
      ];
      const uniqueProteinTypes = [
        ...new Set(
          proteinTypes.data
            ?.map((item) => item.protein_type_name)
            .filter(Boolean)
        ),
      ];

      return {
        classNames: uniqueClassNames,
        foldNames: uniqueFoldNames,
        superfamilyNames: uniqueSuperfamilyNames,
        familyNames: uniqueFamilyNames,
        proteinTypes: uniqueProteinTypes,
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook to fetch unique CATH filter values
export const useCathFilterOptions = () => {
  return useQuery({
    queryKey: ["cath-filter-options"],
    queryFn: async () => {
      // Fetch all unique values from CATH table
      const [
        cathClasses,
        cathArchitectures,
        cathTopologies,
        cathSuperfamilies,
        sources,
        assignments,
        organisms,
        packings,
      ] = await Promise.all([
        // CATH Classes
        supabase
          .from("cath")
          .select("CATH_Class")
          .not("CATH_Class", "is", null)
          .order("CATH_Class"),

        // CATH Architectures
        supabase
          .from("cath")
          .select("CATH_Architecture")
          .not("CATH_Architecture", "is", null)
          .order("CATH_Architecture"),

        // CATH Topologies
        supabase
          .from("cath")
          .select("CATH_Topology")
          .not("CATH_Topology", "is", null)
          .order("CATH_Topology"),

        // CATH Superfamilies
        supabase
          .from("cath")
          .select("CATH_Superfamily")
          .not("CATH_Superfamily", "is", null)
          .order("CATH_Superfamily"),

        // Sources
        supabase
          .from("cath")
          .select("source")
          .not("source", "is", null)
          .order("source"),

        // Assignments
        supabase
          .from("cath")
          .select("assignment")
          .not("assignment", "is", null)
          .order("assignment"),

        // Organisms
        supabase
          .from("cath")
          .select("organism")
          .not("organism", "is", null)
          .order("organism"),

        // Packing
        supabase
          .from("cath")
          .select("packing")
          .not("packing", "is", null)
          .order("packing"),
      ]);

      // Extract unique values
      const uniqueCathClasses = [
        ...new Set(
          cathClasses.data?.map((item) => item.CATH_Class).filter(Boolean)
        ),
      ];
      const uniqueCathArchitectures = [
        ...new Set(
          cathArchitectures.data
            ?.map((item) => item.CATH_Architecture)
            .filter(Boolean)
        ),
      ];
      const uniqueCathTopologies = [
        ...new Set(
          cathTopologies.data?.map((item) => item.CATH_Topology).filter(Boolean)
        ),
      ];
      const uniqueCathSuperfamilies = [
        ...new Set(
          cathSuperfamilies.data
            ?.map((item) => item.CATH_Superfamily)
            .filter(Boolean)
        ),
      ];
      const uniqueSources = [
        ...new Set(sources.data?.map((item) => item.source).filter(Boolean)),
      ];
      const uniqueAssignments = [
        ...new Set(
          assignments.data?.map((item) => item.assignment).filter(Boolean)
        ),
      ];
      const uniqueOrganisms = [
        ...new Set(
          organisms.data?.map((item) => item.organism).filter(Boolean)
        ),
      ];
      const uniquePackings = [
        ...new Set(packings.data?.map((item) => item.packing).filter(Boolean)),
      ];

      return {
        cathClasses: uniqueCathClasses,
        cathArchitectures: uniqueCathArchitectures,
        cathTopologies: uniqueCathTopologies,
        cathSuperfamilies: uniqueCathSuperfamilies,
        sources: uniqueSources,
        assignments: uniqueAssignments,
        organisms: uniqueOrganisms,
        packings: uniquePackings,
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook for numerical/range filters
export const useCathNumericalFilters = () => {
  return useQuery({
    queryKey: ["cath-numerical-filters"],
    queryFn: async () => {
      // Get min/max values for numerical fields
      const { data: lengthData } = await supabase
        .from("cath")
        .select("length")
        .not("length", "is", null)
        .order("length");

      const { data: sseData } = await supabase
        .from("cath")
        .select("SSEs")
        .not("SSEs", "is", null)
        .order("SSEs");

      const { data: percData } = await supabase
        .from("cath")
        .select("perc_not_in_SS")
        .not("perc_not_in_SS", "is", null)
        .order("perc_not_in_SS");

      // Create range buckets for easier filtering
      const lengthRanges = [
        "1-100",
        "101-200",
        "201-300",
        "301-500",
        "501-1000",
        "1000+",
      ];

      const sseRanges = ["1-5", "6-10", "11-15", "16-20", "21+"];

      const percentRanges = ["0-10%", "11-25%", "26-50%", "51-75%", "76-100%"];

      const pldtRanges = [
        "Very High (90-100)",
        "High (70-89)",
        "Medium (50-69)",
        "Low (0-49)",
      ];

      return {
        lengthRanges,
        sseRanges,
        percentRanges,
        pldtRanges,
        lurOptions: ["Yes", "No"], // Low Uncertainty Region
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour (static data)
  });
};
