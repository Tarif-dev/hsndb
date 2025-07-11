import { ProteinVisualizationData } from "@/hooks/useProteinVisualizationDataNew";

interface DisorderData {
  protein_id: string;
  length: number;
  scores: number[];
  summaries: any;
  uniprot_id: string;
  gene_name: string | null;
  protein_name: string | null;
  sequence: string | null;
}

interface ProteinData {
  id: string;
  uniprot_id: string;
  gene_name: string | null;
  protein_name: string | null;
  positions_of_nitrosylation: string;
}

export function createVisualizationDataFromLegacy(
  disorderData: DisorderData,
  proteinData: ProteinData
): ProteinVisualizationData {
  const sequence = disorderData.sequence || "A".repeat(disorderData.length);

  // Parse S-nitrosylation positions
  const nitrosylationPositions = proteinData.positions_of_nitrosylation
    ? proteinData.positions_of_nitrosylation
        .split(",")
        .map((pos) => parseInt(pos.trim()))
        .filter((pos) => !isNaN(pos))
    : [];

  // Create cysteine modifications based on nitrosylation positions
  const cysteineModifications = nitrosylationPositions.map((position) => ({
    position,
    type: "s-nitrosylation" as const,
  }));

  // Generate synthetic secondary structure based on disorder scores
  const secondaryStructure = [];
  let currentStructure = null;

  for (let i = 0; i < disorderData.scores.length; i++) {
    const score = disorderData.scores[i];
    const position = i + 1;

    // Determine structure type based on disorder score
    let structureType: "alpha-helix" | "beta-strand" | "coil";
    if (score < 0.3) {
      // Low disorder - could be helix or strand
      structureType = Math.random() > 0.6 ? "alpha-helix" : "beta-strand";
    } else if (score < 0.5) {
      // Medium disorder - prefer strands
      structureType = Math.random() > 0.7 ? "beta-strand" : "coil";
    } else {
      // High disorder - coil
      structureType = "coil";
    }

    if (!currentStructure || currentStructure.type !== structureType) {
      // End previous structure
      if (currentStructure) {
        currentStructure.end = position - 1;
        if (currentStructure.end >= currentStructure.start) {
          secondaryStructure.push(currentStructure);
        }
      }

      // Start new structure
      currentStructure = {
        start: position,
        end: position,
        type: structureType,
      };
    } else {
      // Continue current structure
      currentStructure.end = position;
    }
  }

  // Add final structure
  if (currentStructure) {
    secondaryStructure.push(currentStructure);
  }

  // Merge very short structures with neighbors
  const mergedStructures = [];
  for (let i = 0; i < secondaryStructure.length; i++) {
    const current = secondaryStructure[i];
    const length = current.end - current.start + 1;

    if (length < 3 && mergedStructures.length > 0) {
      // Merge with previous structure
      mergedStructures[mergedStructures.length - 1].end = current.end;
    } else {
      mergedStructures.push(current);
    }
  }

  // Generate synthetic surface accessibility based on disorder and structure
  const surfaceAccessibility = disorderData.scores.map((disorderScore, i) => {
    const position = i + 1;
    const structure = mergedStructures.find(
      (s) => position >= s.start && position <= s.end
    );

    let baseAccessibility = disorderScore * 0.7; // Disordered regions are more accessible

    // Adjust based on secondary structure
    if (structure) {
      switch (structure.type) {
        case "alpha-helix":
          baseAccessibility *= 0.6; // Less accessible
          break;
        case "beta-strand":
          baseAccessibility *= 0.8; // Moderately accessible
          break;
        case "coil":
          baseAccessibility *= 1.2; // More accessible
          break;
      }
    }

    // Add some noise
    const noise = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, baseAccessibility + noise));
  });

  // Convert disorder scores array to Record<string, number>
  const disorderScoresRecord: Record<string, number> = {};
  disorderData.scores.forEach((score, index) => {
    disorderScoresRecord[(index + 1).toString()] = score;
  });

  // Convert surface accessibility array to Record<string, number>
  const sasaValuesRecord: Record<string, number> = {};
  surfaceAccessibility.forEach((value, index) => {
    sasaValuesRecord[(index + 1).toString()] = value;
  });

  // Convert secondary structure to simple string format
  const secondaryStructureString = mergedStructures
    .map((s) => `${s.start}-${s.end}:${s.type[0].toUpperCase()}`)
    .join(",");

  return {
    id: parseInt(disorderData.protein_id) || 0,
    uniprot_id: disorderData.uniprot_id,
    source: "legacy_adapter",
    protein_name: disorderData.protein_name,
    sequence,
    length: disorderData.length,
    positions_of_nitrosylation: nitrosylationPositions,
    cysteine_positions: nitrosylationPositions, // Assuming all nitrosylation sites are cysteines
    secondary_structure: secondaryStructureString,
    disorder_scores: disorderScoresRecord,
    sasa_values: sasaValuesRecord,
  };
}
