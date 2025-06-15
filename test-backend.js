// Test script to verify API integration
const testBackend = async () => {
  const baseUrl = "https://hsndb-blast-backend.onrender.com/api";

  console.log("Testing backend integration...");

  try {
    // Test 1: Health check
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData.status);

    // Test 2: Database info
    console.log("2. Testing database info...");
    const dbResponse = await fetch(`${baseUrl}/database/info`);
    const dbData = await dbResponse.json();
    console.log("✅ Database info:", `${dbData.totalSequences} sequences`);

    // Test 3: BLAST submission
    console.log("3. Testing BLAST submission...");
    const blastResponse = await fetch(`${baseUrl}/blast/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sequence:
          "MVKVGVNGFGRIGRLVTRAAFNSGKVDIVAINDPFIDLNYMVYMFQYDSTHGKFHGTVKAENGKLVINGNPITIFQERDPSKIKWGDAGAEYYVVESTGVFTTMEKAGAHLQGGAKRVIISAPSADAPMFVMGVNHEKYDNSLKIISNASCINKCSLLKENLLGKTIV",
        algorithm: "blastp",
        evalue: 10,
        maxTargetSeqs: 10,
      }),
    });

    if (!blastResponse.ok) {
      const error = await blastResponse.text();
      console.error("❌ BLAST submission failed:", error);
      return;
    }

    const blastData = await blastResponse.json();
    console.log("✅ BLAST submission:", blastData.jobId);

    // Test 4: Job status
    console.log("4. Testing job status...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

    const statusResponse = await fetch(
      `${baseUrl}/blast/status/${blastData.jobId}`
    );
    const statusData = await statusResponse.json();
    console.log("✅ Job status:", statusData.status || statusData.error);

    console.log("Backend integration test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Run in browser console or Node.js
if (typeof window !== "undefined") {
  // Browser environment
  testBackend();
} else {
  // Node.js environment
  import("node-fetch")
    .then(({ default: fetch }) => {
      global.fetch = fetch;
      testBackend();
    })
    .catch(() => {
      console.log("Install node-fetch: npm install node-fetch");
      console.log("Or run this test in a browser console");
    });
}
