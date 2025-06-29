import React, { useState } from "react";
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
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useStatistics } from "@/hooks/useStatistics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  const navigate = useNavigate();
  const [disorderDialogOpen, setDisorderDialogOpen] = useState(false);
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
          </div>{" "}
          {/* Enhanced Database Statistics */}
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
                      ) : (
                        "4,533"
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Total Proteins</div>
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
                    <div className="text-xs text-gray-600">
                      Cancer-Associated
                    </div>
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
                    <div className="text-xs text-gray-600">
                      S-nitrosylation Sites
                    </div>
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
                    <div className="text-xs text-gray-600">
                      Disordered Proteins
                    </div>
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
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      ~8,500
                    </div>
                    <div className="text-xs text-gray-600">
                      Cancer-Associated
                    </div>
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
                    <div className="text-xs text-gray-600">
                      Disordered Proteins
                    </div>
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
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
              onClick={() => navigate("/browse")}
            >
              Explore All Databases
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 rounded-xl"
            >
              View Documentation
            </Button>
          </div>{" "}
          {/* Scroll Indicator */}
          <div className="mt-16 flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Disorder Details Dialog */}
      <Dialog open={disorderDialogOpen} onOpenChange={setDisorderDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2">
              Protein Disorder Statistics
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of proteins with intrinsic disorder predictions
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <p className="text-gray-700 mb-6">
              Intrinsic disorder refers to regions in proteins that lack a
              stable secondary or tertiary structure under physiological
              conditions. These regions are important for protein function,
              particularly in signaling, regulation, and protein-protein
              interactions.
            </p>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium">
                      Total Disordered Proteins:
                    </span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 ml-auto text-sm px-3 py-1">
                    {statisticsLoading
                      ? "Loading..."
                      : formatNumber(statistics?.disorderedProteins || 0)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Proteins with at least one disordered region (disorder score ≥
                  0.5)
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="font-medium">
                      Fully Disordered Proteins:
                    </span>
                  </div>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200 ml-auto text-sm px-3 py-1">
                    {statisticsLoading
                      ? "Loading..."
                      : formatNumber(statistics?.fullyDisorderedProteins || 0)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Proteins with 100% disordered residues
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                    <span className="font-medium">
                      Moderately Disordered Proteins:
                    </span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 ml-auto text-sm px-3 py-1">
                    {statisticsLoading
                      ? "Loading..."
                      : formatNumber(
                          statistics?.moderatelyDisorderedProteins || 0
                        )}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Proteins with 50-99% disordered residues
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="font-medium">
                      Weakly Disordered Proteins:
                    </span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ml-auto text-sm px-3 py-1">
                    {statisticsLoading
                      ? "Loading..."
                      : formatNumber(statistics?.weaklyDisorderedProteins || 0)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Proteins with 1-49% disordered residues
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" /> About Protein Disorder
              </h4>
              <p className="text-sm text-blue-700">
                Disordered regions in proteins are particularly important in
                post-translational modifications like S-nitrosylation. These
                flexible regions often contain regulatory sites and are more
                accessible for modifications. Understanding the relationship
                between disorder and S-nitrosylation helps elucidate protein
                function and regulation mechanisms.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => {
                    setDisorderDialogOpen(false);
                    navigate("/browse");
                  }}
                >
                  Explore Disordered Proteins
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
