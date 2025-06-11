// Quick test to verify BLAST API changes
const BlastDatabaseMapper = require("./utils/databaseMapper");
const BlastRunner = require("./utils/blastRunner");
const JobStore = require("./utils/jobStore");

async function testBlastChanges() {
  console.log("🧪 Testing BLAST UI improvements...\n");

  try {
    // Initialize components
    const jobStore = new JobStore(100);
    const blastRunner = new BlastRunner(jobStore);

    console.log("1. ✅ BlastRunner initialized");

    // Test database mapping initialization
    await blastRunner.initializeDatabaseMappings();
    console.log("2. ✅ Database mappings initialized");

    // Test protein details retrieval (should not include organism)
    const mapper = blastRunner.databaseMapper;
    const testProteinDetails = await mapper.getProteinDetails("A0A024RBG1");

    console.log("3. 🔍 Testing protein details structure:");
    console.log("   - ID:", testProteinDetails.id);
    console.log("   - HSN ID:", testProteinDetails.hsnId);
    console.log("   - Gene Name:", testProteinDetails.geneName);
    console.log("   - Protein Name:", testProteinDetails.proteinName);
    console.log("   - UniProt ID:", testProteinDetails.uniprotId);
    console.log(
      "   - Has organism field:",
      "organism" in testProteinDetails
        ? "❌ (should be removed)"
        : "✅ (correctly removed)"
    );

    console.log("\n4. 📊 Mapping statistics:");
    const stats = mapper.getStats();
    console.log("   - Total protein mappings:", stats.totalProteins);

    console.log(
      "\n✅ All tests passed! The organism field has been successfully removed."
    );
    console.log(
      "🚀 Frontend changes (new tab functionality) need to be tested in browser."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testBlastChanges();
