// Test script to verify the new UniProt ID mapping system
const BlastDatabaseMapper = require("./utils/databaseMapper");

async function testMapping() {
  console.log("🧪 Testing New UniProt ID Mapping System\n");

  const mapper = new BlastDatabaseMapper();

  try {
    // Initialize the new mapping system
    console.log("1. Initializing mappings...");
    const success = await mapper.initializeMappings();

    if (!success) {
      console.log("❌ Failed to initialize mappings");
      return;
    }

    const stats = mapper.getStats();
    console.log(`✅ Mappings initialized successfully`);
    console.log(`   - Total proteins: ${stats.totalProteins}`);
    console.log(`   - UniProt mappings: ${stats.uniprotToProteinMappings}\n`);

    // Test some UniProt IDs from the FASTA file
    const testUniprotIds = [
      "A0A024RBG1", // From FASTA: NUD4B_HUMAN
      "A0A075B759", // From FASTA: PAL4E_HUMAN
      "A0A075B767", // From FASTA: PAL4H_HUMAN
      "A0A0B4J2A2", // From FASTA: PAL4C_HUMAN
      "P12345", // Non-existent for testing fallback
    ];

    console.log("2. Testing protein detail retrieval:");
    console.log("=====================================\n");

    for (const uniprotId of testUniprotIds) {
      console.log(`Testing UniProt ID: ${uniprotId}`);

      const details = await mapper.getProteinDetails(uniprotId);

      if (details.geneName !== "Unknown") {
        console.log(`✅ FOUND: ${details.geneName} - ${details.proteinName}`);
        console.log(`   HSN ID: ${details.hsnId}`);
        console.log(`   UniProt: ${details.uniprotId}`);
        console.log(`   Organism: ${details.organism}`);
      } else {
        console.log(`❌ NOT FOUND: Using fallback data`);
        console.log(`   UniProt: ${details.uniprotId}`);
      }
      console.log("");
    }

    // Test FASTA identifier extraction
    console.log("3. Testing FASTA identifier extraction:");
    console.log("=======================================\n");

    const testHeaders = [
      ">sp|A0A024RBG1|NUD4B_HUMAN Diphosphoinositol polyphosphate phosphohydrolase NUDT4B OS=Homo sapiens OX=9606 GN=NUDT4B PE=1 SV=1",
      ">sp|A0A075B759|PAL4E_HUMAN Peptidyl-prolyl cis-trans isomerase A-like 4E OS=Homo sapiens OX=9606 GN=PPIAL4E PE=3 SV=1",
      ">tr|Q9Y6K1|Q9Y6K1_HUMAN Some protein OS=Homo sapiens GN=TESTGENE PE=1 SV=1",
    ];

    for (const header of testHeaders) {
      const extracted = mapper.extractFastaIdentifier(header);
      console.log(`Header: ${header.substring(0, 50)}...`);
      console.log(`Extracted ID: ${extracted}\n`);
    }

    console.log("🎉 Testing completed successfully!");
  } catch (error) {
    console.error("❌ Testing failed:", error.message);
    console.error(error);
  }
}

// Run the test
testMapping();
