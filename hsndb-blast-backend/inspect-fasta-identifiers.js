// Inspect actual FASTA identifiers in the database
const BlastDatabaseMapper = require("./utils/databaseMapper");

async function inspectFastaIdentifiers() {
  console.log("🔍 Inspecting FASTA Identifiers in Database\n");

  const mapper = new BlastDatabaseMapper();

  try {
    // Get a few sample FASTA entries to understand the format
    const { data: formats, error } = await mapper.supabase
      .from("formats")
      .select("hsn_id, fasta")
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch formats: ${error.message}`);
    }

    console.log("📋 Sample FASTA entries from database:");
    console.log("=====================================\n");

    formats.forEach((format, index) => {
      console.log(`${index + 1}. HSN ID: ${format.hsn_id}`);

      if (format.fasta) {
        const lines = format.fasta.split("\n");
        const header = lines[0];
        console.log(`   FASTA Header: ${header}`);

        // Extract identifier that would be used by BLAST
        const fastaId = mapper.extractFastaIdentifier(header);
        console.log(`   Extracted ID: ${fastaId}`);
        console.log("");
      } else {
        console.log("   FASTA: null");
        console.log("");
      }
    });

    // Test the mapper with real identifiers
    if (formats.length > 0) {
      console.log("🧪 Testing mapping with real identifiers:");
      console.log("==========================================\n");

      for (let i = 0; i < Math.min(3, formats.length); i++) {
        const format = formats[i];
        if (format.fasta) {
          const header = format.fasta.split("\n")[0];
          const fastaId = mapper.extractFastaIdentifier(header);

          await mapper.initializeMappings();
          const details = await mapper.getProteinDetails(fastaId);

          console.log(`FASTA ID: ${fastaId}`);
          console.log(
            `Mapped to: ${details.hsnId} (${details.geneName}: ${details.proteinName})`
          );
          console.log("");
        }
      }
    }
  } catch (error) {
    console.error("❌ Inspection failed:", error.message);
  }
}

// Run the inspection
inspectFastaIdentifiers();
