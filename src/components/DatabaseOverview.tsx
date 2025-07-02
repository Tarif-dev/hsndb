import React from "react";
import { Database, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useStatistics } from "@/hooks/useStatistics";

const DatabaseOverview = () => {
  const navigate = useNavigate();
  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = useStatistics();

  // Helper function to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto mb-12">
      {/* Overview Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Database Overview
        </h2>
        <p className="text-gray-600">
          Comprehensive statistics from our experimental and computational
          protein databases
        </p>
      </div>

      {/* Database Type Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Experimental Database Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Experimental Database
                </h3>
                <p className="text-sm text-gray-600">
                  Laboratory-validated S-nitrosylation sites
                </p>
              </div>
            </div>
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              High Confidence
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {statisticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : statisticsError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  formatNumber(statistics?.totalProteins || 0)
                )}
              </div>
              <div className="text-xs text-gray-600">Total Proteins</div>
              {!statisticsLoading && !statisticsError && statistics && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatNumber(statistics.experimentalProteins)} experimental +{" "}
                  {formatNumber(statistics.motifBasedProteins)} motif-based
                </div>
              )}
            </div>
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {statisticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : statisticsError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  formatNumber(statistics?.cancerAssociatedProteins || 0)
                )}
              </div>
              <div className="text-xs text-gray-600">Cancer-Associated</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {statisticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : statisticsError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  formatNumber(statistics?.totalSites || 0)
                )}
              </div>
              <div className="text-xs text-gray-600">S-nitrosylation Sites</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {statisticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : statisticsError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  formatNumber(statistics?.disorderedProteins || 0)
                )}
              </div>
              <div className="text-xs text-gray-600">Disordered Proteins</div>
            </div>
          </div>

          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => navigate("/browse?type=experimental")}
          >
            Browse Experimental Data
          </Button>
        </div>

        {/* Motif-Based Database Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Motif-Based Database
                </h3>
                <p className="text-sm text-gray-600">
                  Computationally predicted S-nitrosylation sites
                </p>
              </div>
            </div>
            <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Computational
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                14,188
              </div>
              <div className="text-xs text-gray-600">Total Proteins</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">~8,500</div>
              <div className="text-xs text-gray-600">Cancer-Associated</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ~42,000
              </div>
              <div className="text-xs text-gray-600">Predicted Sites</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                ~6,800
              </div>
              <div className="text-xs text-gray-600">Disordered Proteins</div>
            </div>
          </div>

          <Button
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => navigate("/browse?type=motif")}
          >
            Browse Motif-Based Data
          </Button>
        </div>
      </div>

      {/* Combined Statistics Banner */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-1">18,721</div>
            <div className="text-blue-100 text-sm">Total Proteins</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              {statisticsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                "2"
              )}
            </div>
            <div className="text-blue-100 text-sm">Database Types</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">100%</div>
            <div className="text-blue-100 text-sm">Human Proteome</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">2024</div>
            <div className="text-blue-100 text-sm">Latest Data</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseOverview;
