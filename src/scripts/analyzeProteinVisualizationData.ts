import { supabase } from "@/integrations/supabase/client";

interface ProteinVisualizationAnalysis {
  totalProteins: number;
  proteinsWithCysteineModifications: number;
  proteinsWithSecondaryStructure: number;
  proteinsWithDisorderScores: number;
  proteinsWithSurfaceAccessibility: number;
  averageProteinLength: number;
  cysteineModificationTypes: Record<string, number>;
  secondaryStructureTypes: Record<string, number>;
  sampleData: any[];
}

async function analyzeProteinVisualizationData(): Promise<ProteinVisualizationAnalysis> {
  console.log("Starting analysis of protein_visualization_data table...");

  // First, get basic statistics
  const { data: countData, error: countError } = await supabase
    .from("protein_visualization_data")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Error getting count:", countError);
    throw countError;
  }

  const totalProteins = countData?.length || 0;
  console.log(`Total proteins in table: ${totalProteins}`);

  // Get a sample of the data to analyze structure
  const { data: sampleData, error: sampleError } = await supabase
    .from("protein_visualization_data")
    .select("*")
    .limit(10);

  if (sampleError) {
    console.error("Error getting sample data:", sampleError);
    throw sampleError;
  }

  console.log("Sample data structure:", sampleData?.[0]);

  // Get all data for detailed analysis (in chunks to avoid memory issues)
  let allData: any[] = [];
  let from = 0;
  const chunkSize = 100;

  while (true) {
    const { data: chunkData, error: chunkError } = await supabase
      .from("protein_visualization_data")
      .select("*")
      .range(from, from + chunkSize - 1);

    if (chunkError) {
      console.error("Error getting chunk data:", chunkError);
      break;
    }

    if (!chunkData || chunkData.length === 0) {
      break;
    }

    allData = allData.concat(chunkData);
    from += chunkSize;

    console.log(`Loaded ${allData.length} proteins so far...`);

    // Limit to first 500 for analysis to avoid too much processing
    if (allData.length >= 500) {
      console.log("Limiting analysis to first 500 proteins for performance");
      break;
    }
  }

  console.log(`Analyzing ${allData.length} proteins...`);

  // Analyze the data
  const analysis: ProteinVisualizationAnalysis = {
    totalProteins: totalProteins,
    proteinsWithCysteineModifications: 0,
    proteinsWithSecondaryStructure: 0,
    proteinsWithDisorderScores: 0,
    proteinsWithSurfaceAccessibility: 0,
    averageProteinLength: 0,
    cysteineModificationTypes: {},
    secondaryStructureTypes: {},
    sampleData: sampleData || [],
  };

  let totalLength = 0;

  for (const protein of allData) {
    totalLength += protein.length || 0;

    // Check cysteine modifications
    if (protein.cysteine_modifications) {
      try {
        const modifications =
          typeof protein.cysteine_modifications === "string"
            ? JSON.parse(protein.cysteine_modifications)
            : protein.cysteine_modifications;

        if (Array.isArray(modifications) && modifications.length > 0) {
          analysis.proteinsWithCysteineModifications++;

          // Count modification types
          modifications.forEach((mod: any) => {
            if (mod.type) {
              analysis.cysteineModificationTypes[mod.type] =
                (analysis.cysteineModificationTypes[mod.type] || 0) + 1;
            }
          });
        }
      } catch (e) {
        console.log(
          "Error parsing cysteine modifications for protein:",
          protein.uniprot_id
        );
      }
    }

    // Check secondary structure
    if (protein.secondary_structure) {
      try {
        const structure =
          typeof protein.secondary_structure === "string"
            ? JSON.parse(protein.secondary_structure)
            : protein.secondary_structure;

        if (Array.isArray(structure) && structure.length > 0) {
          analysis.proteinsWithSecondaryStructure++;

          // Count structure types
          structure.forEach((struct: any) => {
            if (struct.type) {
              analysis.secondaryStructureTypes[struct.type] =
                (analysis.secondaryStructureTypes[struct.type] || 0) + 1;
            }
          });
        }
      } catch (e) {
        console.log(
          "Error parsing secondary structure for protein:",
          protein.uniprot_id
        );
      }
    }

    // Check disorder scores
    if (
      protein.disorder_scores &&
      Array.isArray(protein.disorder_scores) &&
      protein.disorder_scores.length > 0
    ) {
      analysis.proteinsWithDisorderScores++;
    }

    // Check surface accessibility
    if (
      protein.surface_accessibility &&
      Array.isArray(protein.surface_accessibility) &&
      protein.surface_accessibility.length > 0
    ) {
      analysis.proteinsWithSurfaceAccessibility++;
    }
  }

  analysis.averageProteinLength = totalLength / allData.length;

  return analysis;
}

// Run the analysis
async function runAnalysis() {
  try {
    const analysis = await analyzeProteinVisualizationData();

    console.log("\n=== PROTEIN VISUALIZATION DATA ANALYSIS ===");
    console.log(`Total proteins: ${analysis.totalProteins}`);
    console.log(
      `Proteins with cysteine modifications: ${analysis.proteinsWithCysteineModifications}`
    );
    console.log(
      `Proteins with secondary structure: ${analysis.proteinsWithSecondaryStructure}`
    );
    console.log(
      `Proteins with disorder scores: ${analysis.proteinsWithDisorderScores}`
    );
    console.log(
      `Proteins with surface accessibility: ${analysis.proteinsWithSurfaceAccessibility}`
    );
    console.log(
      `Average protein length: ${analysis.averageProteinLength.toFixed(
        1
      )} residues`
    );

    console.log("\n=== CYSTEINE MODIFICATION TYPES ===");
    Object.entries(analysis.cysteineModificationTypes).forEach(
      ([type, count]) => {
        console.log(`${type}: ${count} modifications`);
      }
    );

    console.log("\n=== SECONDARY STRUCTURE TYPES ===");
    Object.entries(analysis.secondaryStructureTypes).forEach(
      ([type, count]) => {
        console.log(`${type}: ${count} elements`);
      }
    );

    console.log("\n=== SAMPLE DATA STRUCTURE ===");
    if (analysis.sampleData.length > 0) {
      const sample = analysis.sampleData[0];
      console.log("Sample protein:", {
        uniprot_id: sample.uniprot_id,
        gene_name: sample.gene_name,
        protein_name: sample.protein_name,
        length: sample.length,
        has_cysteine_modifications: !!sample.cysteine_modifications,
        has_secondary_structure: !!sample.secondary_structure,
        has_disorder_scores: !!(
          sample.disorder_scores && sample.disorder_scores.length > 0
        ),
        has_surface_accessibility: !!(
          sample.surface_accessibility &&
          sample.surface_accessibility.length > 0
        ),
      });

      // Show sample cysteine modifications
      if (sample.cysteine_modifications) {
        try {
          const modifications =
            typeof sample.cysteine_modifications === "string"
              ? JSON.parse(sample.cysteine_modifications)
              : sample.cysteine_modifications;
          console.log(
            "Sample cysteine modifications:",
            modifications.slice(0, 3)
          );
        } catch (e) {
          console.log("Could not parse cysteine modifications");
        }
      }

      // Show sample secondary structure
      if (sample.secondary_structure) {
        try {
          const structure =
            typeof sample.secondary_structure === "string"
              ? JSON.parse(sample.secondary_structure)
              : sample.secondary_structure;
          console.log("Sample secondary structure:", structure.slice(0, 3));
        } catch (e) {
          console.log("Could not parse secondary structure");
        }
      }
    }
  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

export { runAnalysis, analyzeProteinVisualizationData };
