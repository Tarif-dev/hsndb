const https = require("https");

function checkJob(jobId) {
  const url = `https://hsndb-blast-backend.onrender.com/api/blast/status/${jobId}`;

  https
    .get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          console.log("Job Status:", JSON.stringify(result, null, 2));
        } catch (error) {
          console.log("Raw response:", data);
        }
      });
    })
    .on("error", (error) => {
      console.error("Error:", error.message);
    });
}

// Check the job from the latest test
checkJob("966ea7e0-0a93-4197-819b-264baa093d71");
