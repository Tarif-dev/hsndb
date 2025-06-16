import React from "react";

// Debug component to show environment variables
export const DebugEnv: React.FC = () => {
  const isDevelopment = import.meta.env.MODE === "development";
  const envApiUrl = import.meta.env.VITE_BLAST_API_URL;

  const getBaseUrl = () => {
    if (isDevelopment) {
      return "http://localhost:3001/api";
    }

    if (envApiUrl) {
      return envApiUrl.endsWith("/api") ? envApiUrl : `${envApiUrl}/api`;
    }

    return "https://hsndb-backend-production.up.railway.app/api";
  };

  const baseUrl = getBaseUrl();
  const healthUrl = `${baseUrl}/health`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        background: "black",
        color: "white",
        padding: "10px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <h4>🔧 Debug Info</h4>
      <div>Mode: {import.meta.env.MODE}</div>
      <div>
        VITE_BLAST_API_URL: {import.meta.env.VITE_BLAST_API_URL || "NOT SET"}
      </div>
      <div>Is Dev: {isDevelopment ? "Yes" : "No"}</div>
      <div>Base URL: {baseUrl}</div>
      <div>Health URL: {healthUrl}</div>
      <button
        onClick={() => {
          console.log("Testing health endpoint...");
          fetch(healthUrl)
            .then((r) => r.json())
            .then((data) => console.log("Health response:", data))
            .catch((err) => console.error("Health error:", err));
        }}
        style={{ marginTop: "5px", padding: "2px 5px" }}
      >
        Test Health
      </button>
    </div>
  );
};
