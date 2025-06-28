import React from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MotifTable from "@/components/MotifTable";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "react-error-boundary";

const MotifBrowse = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // Add error logging
  React.useEffect(() => {
    console.log("MotifBrowse page mounted");
    try {
      // Testing if we can access key browser APIs
      console.log("Window object accessible:", !!window);
      console.log("Document object accessible:", !!document);
      console.log("Browser info:", navigator.userAgent);
    } catch (err) {
      console.error("Error in MotifBrowse initialization:", err);
    }

    return () => {
      console.log("MotifBrowse page unmounted");
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
        {" "}
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div className="container mx-auto px-4 py-12 max-w-7xl">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                <h2 className="text-lg font-semibold">
                  Error Loading Motif Proteins
                </h2>
                <p className="mt-2">
                  Sorry, we encountered a problem while loading the motif
                  proteins page.
                </p>
                <p className="text-sm mt-2">
                  Error details: {error.message || "Unknown error"}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={resetErrorBoundary}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-red-600 border border-red-600 rounded-md"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-medium mb-4">Other Actions</h3>
                <div className="flex gap-4">
                  <a
                    href="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Return to Home
                  </a>
                  <a
                    href="/browse?type=experimental"
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md"
                  >
                    Browse Experimental Proteins
                  </a>
                </div>
              </div>
            </div>
          )}
          onReset={() => {
            // Clear any cached data that might be causing problems
            console.log("Attempting recovery from error...");
          }}
        >
          <MotifTable initialQuery={initialQuery} />
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

export default MotifBrowse;
