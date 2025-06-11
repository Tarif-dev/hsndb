// Final validation of the BLAST implementation fixes
const BlastDatabaseMapper = require("./utils/databaseMapper");
const fs = require("fs");
const path = require("path");

async function validateImplementation() {
  console.log("🔍 Final Validation of BLAST Implementation Fixes\n");

  try {
    // 1. Test database connection and mapping
    console.log("1. Testing database mapping...");
    const mapper = new BlastDatabaseMapper();
    const initSuccess = await mapper.initializeMappings();

    if (!initSuccess) {
      console.log("❌ Database mapping initialization failed");
      return;
    }

    const stats = mapper.getStats();
    console.log(
      `✅ Database mapping successful: ${stats.totalProteins} proteins loaded\n`
    );

    // 2. Test FASTA identifier extraction
    console.log("2. Testing FASTA identifier extraction...");
    const sampleHeaders = [
      ">sp|A0A024RBG1|NUD4B_HUMAN Diphosphoinositol polyphosphate",
      ">sp|A0A075B759|PAL4E_HUMAN Peptidyl-prolyl cis-trans isomerase",
      ">tr|Q9Y6K1|Q9Y6K1_HUMAN Some protein",
    ];

    let extractionSuccess = 0;
    for (const header of sampleHeaders) {
      const extracted = mapper.extractFastaIdentifier(header);
      if (extracted && extracted.match(/^[A-Z0-9]{6,10}$/)) {
        extractionSuccess++;
        console.log(`✅ ${header.substring(0, 30)}... → ${extracted}`);
      } else {
        console.log(`❌ ${header.substring(0, 30)}... → ${extracted}`);
      }
    }

    if (extractionSuccess === sampleHeaders.length) {
      console.log("✅ FASTA identifier extraction working correctly\n");
    } else {
      console.log("⚠️  Some FASTA identifier extractions failed\n");
    }

    // 3. Test protein detail retrieval
    console.log("3. Testing protein detail retrieval...");
    const testUniprotIds = ["A0A024RBG1", "A0A075B759", "A0A075B767"];
    let retrievalSuccess = 0;

    for (const uniprotId of testUniprotIds) {
      const details = await mapper.getProteinDetails(uniprotId);
      if (
        details.geneName !== "Unknown" &&
        details.proteinName !== "Unknown protein"
      ) {
        retrievalSuccess++;
        console.log(
          `✅ ${uniprotId} → ${details.geneName} (${details.proteinName})`
        );
      } else {
        console.log(`❌ ${uniprotId} → Unknown protein`);
      }
    }

    if (retrievalSuccess === testUniprotIds.length) {
      console.log("✅ Protein detail retrieval working correctly\n");
    } else {
      console.log("⚠️  Some protein details not found\n");
    }

    // 4. Check file structure
    console.log("4. Checking file structure...");
    const requiredFiles = [
      "utils/databaseMapper.js",
      "utils/blastRunner.js",
      "utils/jobStore.js",
      "utils/validation.js",
      "server.js",
      "config.js",
    ];

    let fileCheckSuccess = 0;
    for (const file of requiredFiles) {
      if (fs.existsSync(path.join(__dirname, file))) {
        fileCheckSuccess++;
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ Missing: ${file}`);
      }
    }

    if (fileCheckSuccess === requiredFiles.length) {
      console.log("✅ All required files present\n");
    } else {
      console.log("⚠️  Some files missing\n");
    }

    // 5. Check FASTA file
    console.log("5. Checking FASTA file...");
    const fastaPath = path.join(__dirname, "..", "sequences.fasta");
    if (fs.existsSync(fastaPath)) {
      const stats = fs.statSync(fastaPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ FASTA file found: ${sizeInMB} MB\n`);
    } else {
      console.log("❌ FASTA file not found at expected location\n");
    }

    // 6. Final summary
    console.log("📋 VALIDATION SUMMARY:");
    console.log("======================");
    console.log(`✅ Database mapping: ${initSuccess ? "WORKING" : "FAILED"}`);
    console.log(
      `✅ Identifier extraction: ${extractionSuccess}/${sampleHeaders.length} working`
    );
    console.log(
      `✅ Protein retrieval: ${retrievalSuccess}/${testUniprotIds.length} working`
    );
    console.log(
      `✅ File structure: ${fileCheckSuccess}/${requiredFiles.length} files present`
    );

    if (
      initSuccess &&
      extractionSuccess === sampleHeaders.length &&
      retrievalSuccess === testUniprotIds.length &&
      fileCheckSuccess === requiredFiles.length
    ) {
      console.log("\n🎉 ALL VALIDATIONS PASSED!");
      console.log("   The BLAST implementation is ready for use.");
      console.log(
        "   Gene names and protein names will now appear correctly in search results."
      );
    } else {
      console.log(
        "\n⚠️  Some validations failed. Please check the issues above."
      );
    }
  } catch (error) {
    console.error("❌ Validation failed with error:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run validation
validateImplementation();
