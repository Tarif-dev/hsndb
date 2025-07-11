import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProteinVisualizationData {
  id: number;
  uniprot_id: string;
  source: string;
  protein_name: string | null;
  sequence: string | null;
  length: number;
  positions_of_nitrosylation: number[];
  cysteine_positions: number[];
  secondary_structure: string | null;
  disorder_scores: Record<string, number>;
  sasa_values: Record<string, number>;
}

export const useProteinVisualizationDataNew = (
  uniprotId: string | undefined,
  proteinId?: string | number
) => {
  return useQuery({
    queryKey: ["protein-visualization-data", uniprotId, proteinId],
    queryFn: async (): Promise<ProteinVisualizationData | null> => {
      if (!uniprotId && !proteinId) {
        console.log("No UniProt ID or protein ID provided");
        return null;
      }

      console.log("Fetching protein visualization data for:", {
        uniprotId,
        proteinId,
      });

      // Build query based on available identifiers
      let query = supabase.from("protein_visualization_data").select("*");

      if (uniprotId) {
        query = query.eq("uniprot_id", uniprotId);
      } else if (proteinId) {
        query = query.eq("id", Number(proteinId));
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching protein visualization data:", error);
        throw error;
      }

      if (!data) {
        console.log("No visualization data found for protein");
        return null;
      }

      console.log("Raw data from database:", data);

      // Process the data to match our interface
      const processedData: ProteinVisualizationData = {
        id: data.id,
        uniprot_id: data.uniprot_id,
        source: data.source,
        protein_name: data.protein_name,
        sequence: data.sequence,
        length: data.length,

        // Process positions_of_nitrosylation
        positions_of_nitrosylation: (() => {
          if (!data.positions_of_nitrosylation) return [];

          try {
            const parsed =
              typeof data.positions_of_nitrosylation === "string"
                ? JSON.parse(data.positions_of_nitrosylation)
                : data.positions_of_nitrosylation;

            // Handle both array format [273, 621, 86] and object format
            if (Array.isArray(parsed)) {
              return parsed;
            } else if (typeof parsed === "object") {
              // If it's an object, extract the values or keys depending on format
              return Object.values(parsed).filter((v) => typeof v === "number");
            }
            return [];
          } catch (e) {
            console.error("Error parsing positions_of_nitrosylation:", e);
            return [];
          }
        })(),

        // Process cysteine_positions
        cysteine_positions: data.cysteine_positions || [],

        // Keep secondary_structure as string for now
        secondary_structure: data.secondary_structure,

        // Process disorder_scores
        disorder_scores: (() => {
          if (!data.disorder_scores) return {};

          try {
            return typeof data.disorder_scores === "string"
              ? JSON.parse(data.disorder_scores)
              : data.disorder_scores;
          } catch (e) {
            console.error("Error parsing disorder_scores:", e);
            return {};
          }
        })(),

        // Process sasa_values
        sasa_values: (() => {
          if (!data.sasa_values) return {};

          try {
            return typeof data.sasa_values === "string"
              ? JSON.parse(data.sasa_values)
              : data.sasa_values;
          } catch (e) {
            console.error("Error parsing sasa_values:", e);
            return {};
          }
        })(),
      };

      console.log("Processed data:", {
        uniprot_id: processedData.uniprot_id,
        source: processedData.source,
        length: processedData.length,
        nitrosylation_count: processedData.positions_of_nitrosylation.length,
        cysteine_count: processedData.cysteine_positions.length,
        has_disorder_scores:
          Object.keys(processedData.disorder_scores).length > 0,
        has_sasa_values: Object.keys(processedData.sasa_values).length > 0,
        has_secondary_structure: !!processedData.secondary_structure,
      });

      return processedData;
    },
    enabled: !!(uniprotId || proteinId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
