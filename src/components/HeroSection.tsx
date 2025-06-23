import React from "react";
import {
  Search,
  ArrowDown,
  Database,
  BarChart3,
  Globe,
  Dna,
  Heart,
  Brain,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useStatistics } from "@/hooks/useStatistics";

const HeroSection = () => {
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
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="block">Human S-nitrosylation</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Database (HSNDB)
            </span>
          </h1>

          {/* Detailed Explanation */}
          <div className="max-w-5xl mx-auto mb-12">
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              The most comprehensive database of human S-nitrosylated proteins,
              designed for researchers studying nitric oxide signaling and its
              role in health and disease.
            </p>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Understanding Human S-nitrosylation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <Dna className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      What is S-nitrosylation?
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    S-nitrosylation is a reversible post-translational
                    modification where nitric oxide (NO) forms covalent bonds
                    with cysteine residues in proteins, creating S-nitrosothiol
                    groups. This modification serves as a critical regulatory
                    mechanism in cellular signaling.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Clinical Significance
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    In humans, dysregulated S-nitrosylation is implicated in
                    cardiovascular diseases, neurodegenerative disorders,
                    cancer, and metabolic diseases. Understanding these
                    modifications helps identify therapeutic targets and disease
                    biomarkers.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <Brain className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Research Applications
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    HSNDB enables researchers to explore S-nitrosylation
                    patterns, identify cancer-related modifications, study
                    tissue-specific distributions, and develop targeted
                    interventions for diseases involving nitric oxide signaling
                    pathways.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <Database className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Our Database
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    HSNDB aggregates human S-nitrosylation data from
                    peer-reviewed studies, providing comprehensive information
                    on modification sites, tissue distributions, disease
                    associations, and functional annotations with
                    high-confidence experimental evidence.
                  </p>
                </div>{" "}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {statisticsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : statisticsError ? (
                  <span className="text-red-500 text-lg">Error</span>
                ) : (
                  formatNumber(statistics?.totalProteins || 0)
                )}
              </div>
              <div className="text-gray-600">S-nitrosylated Proteins</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <Heart className="h-8 w-8 text-red-600" />
              </div>{" "}
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {statisticsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : statisticsError ? (
                  <span className="text-red-500 text-lg">Error</span>
                ) : (
                  formatNumber(statistics?.cancerAssociatedProteins || 0)
                )}
              </div>
              <div className="text-gray-600">Cancer-Associated Proteins</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {statisticsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : statisticsError ? (
                  <span className="text-red-500 text-lg">Error</span>
                ) : (
                  formatNumber(statistics?.totalSites || 0)
                )}
              </div>
              <div className="text-gray-600">Total S-nitrosylation Sites</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
              onClick={() => navigate("/browse")}
            >
              Explore Database
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 rounded-xl"
            >
              View Documentation
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16 flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
