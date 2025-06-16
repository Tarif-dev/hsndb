// Debug script to check environment variables and API URL
console.log("=== Frontend Environment Debug ===");
console.log("MODE:", import.meta.env.MODE);
console.log("VITE_BLAST_API_URL:", import.meta.env.VITE_BLAST_API_URL);
console.log("DEV:", import.meta.env.DEV);
console.log("PROD:", import.meta.env.PROD);
console.log("All env vars:", import.meta.env);

// Test URL construction
const isDevelopment = import.meta.env.MODE === "development";
const envApiUrl = import.meta.env.VITE_BLAST_API_URL;

console.log("Is Development?", isDevelopment);
console.log("Environment API URL:", envApiUrl);

let finalUrl;
if (isDevelopment) {
  finalUrl = "http://localhost:3001/api";
} else if (envApiUrl) {
  finalUrl = envApiUrl.endsWith("/api") ? envApiUrl : `${envApiUrl}/api`;
} else {
  finalUrl = "https://hsndb-backend-production.up.railway.app/api";
}

console.log("Final API URL:", finalUrl);
console.log("Health check URL would be:", `${finalUrl}/health`);
console.log("=== Debug Complete ===");
