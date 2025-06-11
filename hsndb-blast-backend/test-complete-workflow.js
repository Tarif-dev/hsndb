// Simple test to verify the complete BLAST workflow
const axios = require("axios");

const API_BASE = "http://localhost:3001/api";

async function testBlastWorkflow() {
  console.log("🧪 Testing Complete BLAST Workflow\n");

  try {
    // 1. Health check
    console.log("1. Testing health endpoint...");
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log("✅ Health check passed:", healthResponse.data.status);

    // 2. Submit a BLAST job with a real protein sequence
    console.log("\n2. Submitting BLAST job...");
    const testSequence =
      "MVNSVVFFEITRDGKPLGRISIKLFADKIPKTAENFRALSTGEKGFRYKGSCFHRIIPGFMCQGGDFTRPNGTGDKSIYGEKFDDENLIRKHTGSGILSMANAGPNTNGSQFFICAAKTEWLDGKHVAFGKVKERVNIVEAMEHFGYRNSKTSKKITIADCGQF";

    const submitResponse = await axios.post(`${API_BASE}/blast/submit`, {
      sequence: testSequence,
      algorithm: "blastp",
      evalue: 10,
      maxTargetSeqs: 10,
    });

    const jobId = submitResponse.data.jobId;
    console.log("✅ Job submitted successfully, JobID:", jobId);

    // 3. Poll for job completion
    console.log("\n3. Waiting for job completion...");
    let completed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (!completed && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await axios.get(
        `${API_BASE}/blast/status/${jobId}`
      );
      const status = statusResponse.data;

      console.log(`   Status: ${status.status}, Progress: ${status.progress}%`);

      if (status.status === "completed") {
        completed = true;
      } else if (status.status === "failed") {
        console.log("❌ Job failed:", status.error);
        return;
      }

      attempts++;
    }

    if (!completed) {
      console.log("⏰ Job timed out after 30 seconds");
      return;
    }

    // 4. Get results
    console.log("\n4. Retrieving results...");
    const resultsResponse = await axios.get(
      `${API_BASE}/blast/results/${jobId}`
    );
    const results = resultsResponse.data;

    console.log("✅ Results retrieved successfully");
    console.log(`   Total hits: ${results.totalHits}`);
    console.log(`   Query length: ${results.queryLength}`);

    // 5. Check if gene names and protein names are populated
    console.log("\n5. Checking protein details mapping...");

    if (results.hits && results.hits.length > 0) {
      console.log(
        `   Examining first ${Math.min(5, results.hits.length)} hits:`
      );

      for (let i = 0; i < Math.min(5, results.hits.length); i++) {
        const hit = results.hits[i];
        console.log(`   
   Hit ${i + 1}:
     - HSN ID: ${hit.hsnId}
     - Gene Name: ${hit.geneName}
     - Protein Name: ${hit.proteinName}
     - UniProt ID: ${hit.uniprotId}
     - E-value: ${hit.evalue}
     - Identity: ${hit.identity}%`);

        if (
          hit.geneName === "Unknown" ||
          hit.proteinName === "Unknown protein"
        ) {
          console.log(
            '     ⚠️  Still showing "Unknown" - mapping may need improvement'
          );
        } else {
          console.log("     ✅ Proper gene/protein names found!");
        }
      }
    } else {
      console.log("   ⚠️  No hits found in results");
    }

    console.log("\n🎉 BLAST workflow test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }
  }
}

// Only run if axios is available
try {
  require("axios");
  testBlastWorkflow();
} catch (error) {
  console.log("❌ axios not available. Install with: npm install axios");
  console.log("   Alternatively, test manually with curl or frontend");
}
