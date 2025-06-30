import React, { useState, useRef, useEffect } from "react";
import { Search, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchSuggestion {
  type: "protein" | "gene" | "uniprot" | "hsn_id";
  value: string;
  description: string;
  hsn_id?: string;
  id?: string; // Add the UUID id field
  source: "experimental" | "motif";
}

const CentralSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const popularSearches = [
    "Human proteins",
    "Cancer proteins",
    "BRCA1",
    "TP53",
    "Cardiac proteins",
    "Motif-based predictions",
  ];

  // Fetch real-time suggestions from both databases
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching suggestions for query:", query);

      // Search in experimental proteins table
      const { data: expData, error: expError } = await supabase
        .from("proteins")
        .select("id, hsn_id, gene_name, protein_name, uniprot_id, cancer_causing")
        .or(
          `gene_name.ilike.%${query}%,protein_name.ilike.%${query}%,uniprot_id.ilike.%${query}%,hsn_id.ilike.%${query}%`
        )
        .limit(6);

      // Search in motif-based proteins table
      const { data: motifData, error: motifError } = await supabase
        .from("motif_based_proteins")
        .select("id, hsn_id, gene_name, protein_name, uniprot_id")
        .or(
          `gene_name.ilike.%${query}%,protein_name.ilike.%${query}%,uniprot_id.ilike.%${query}%,hsn_id.ilike.%${query}%`
        )
        .limit(6);

      console.log("Experimental data response:", {
        data: expData,
        error: expError,
      });
      console.log("Motif data response:", {
        data: motifData,
        error: motifError,
      });

      if (expError) {
        console.error("Error fetching experimental suggestions:", expError);
      }

      if (motifError) {
        console.error("Error fetching motif suggestions:", motifError);
      }

      const newSuggestions: SearchSuggestion[] = [];

      // Process experimental proteins
      expData?.forEach((protein) => {
        console.log("Processing experimental protein:", protein);

        // Add gene name suggestion
        if (protein.gene_name?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "gene",
            value: protein.gene_name,
            description: `Gene: ${protein.protein_name || "Unknown protein"}${
              protein.cancer_causing ? " (Cancer-related)" : ""
            }`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "experimental",
          });
        }

        // Add protein name suggestion
        if (protein.protein_name?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "protein",
            value: protein.protein_name,
            description: `Protein: ${protein.gene_name || "Unknown gene"}${
              protein.cancer_causing ? " (Cancer-related)" : ""
            }`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "experimental",
          });
        }

        // Add UniProt ID suggestion
        if (protein.uniprot_id?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "uniprot",
            value: protein.uniprot_id,
            description: `UniProt: ${protein.gene_name || "Unknown"} - ${
              protein.protein_name || "Unknown"
            }`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "experimental",
          });
        }

        // Add HSN ID suggestion
        if (protein.hsn_id?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "hsn_id",
            value: protein.hsn_id,
            description: `HSN ID: ${protein.gene_name || "Unknown"} - ${
              protein.protein_name || "Unknown"
            }`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "experimental",
          });
        }
      });

      // Process motif-based proteins
      motifData?.forEach((protein) => {
        console.log("Processing motif protein:", protein);

        // Add gene name suggestion
        if (protein.gene_name?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "gene",
            value: protein.gene_name,
            description: `Gene: ${
              protein.protein_name || "Unknown protein"
            } (Motif-based)`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "motif",
          });
        }

        // Add protein name suggestion
        if (protein.protein_name?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "protein",
            value: protein.protein_name,
            description: `Protein: ${
              protein.gene_name || "Unknown gene"
            } (Motif-based)`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "motif",
          });
        }

        // Add UniProt ID suggestion
        if (protein.uniprot_id?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "uniprot",
            value: protein.uniprot_id,
            description: `UniProt: ${protein.gene_name || "Unknown"} - ${
              protein.protein_name || "Unknown"
            } (Motif-based)`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "motif",
          });
        }

        // Add HSN ID suggestion
        if (protein.hsn_id?.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: "hsn_id",
            value: protein.hsn_id,
            description: `HSN ID: ${protein.gene_name || "Unknown"} - ${
              protein.protein_name || "Unknown"
            } (Motif-based)`,
            hsn_id: protein.hsn_id,
            id: protein.id,
            source: "motif",
          });
        }
      });

      console.log("Generated suggestions:", newSuggestions);

      // Remove duplicates and prioritize experimental results
      const uniqueSuggestions = newSuggestions
        .filter((suggestion, index, self) => {
          // Find if there's an earlier suggestion with the same value and type
          const earlierIndex = self.findIndex(
            (s) => s.value === suggestion.value && s.type === suggestion.type
          );
          // Keep if this is the first occurrence, or if this is experimental and the earlier one is motif
          return (
            earlierIndex === index ||
            (suggestion.source === "experimental" &&
              self[earlierIndex].source === "motif")
          );
        })
        .sort((a, b) => {
          // Sort experimental results first, then by relevance
          if (a.source !== b.source) {
            return a.source === "experimental" ? -1 : 1;
          }
          return 0;
        })
        .slice(0, 8); // Increased limit to 8 to show more suggestions

      console.log("Final unique suggestions:", uniqueSuggestions);
      setSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.id) {
      // Open protein details in new tab using the UUID id
      const proteinDetailsUrl = `/protein/${suggestion.id}`;
      window.open(proteinDetailsUrl, "_blank");
    } else {
      // Fallback to search if no ID available
      handleSearch(suggestion.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        handleSuggestionClick(suggestions[activeSuggestion]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "protein":
        return "🧬";
      case "gene":
        return "🔬";
      case "uniprot":
        return "📋";
      case "hsn_id":
        return "🔢";
      default:
        return "🔍";
    }
  };

  const getSourceIndicator = (source: "experimental" | "motif") => {
    return source === "experimental" ? "🔬" : "🧠";
  };

  const getSourceLabel = (source: "experimental" | "motif") => {
    return source === "experimental" ? "Experimental" : "Motif-based";
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Search the Global Database
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover S-nitrosylated proteins across 18,000+ entries from both
            experimental validation and motif-based prediction databases.
          </p>
        </div>

        {/* Main Search Interface */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <Input
              type="text"
              placeholder="Search proteins, genes, UniProt IDs, or HSN IDs... (Click suggestions to view details)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setActiveSuggestion(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="pl-14 pr-32 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
            <Button
              size="lg"
              onClick={() => handleSearch()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Search
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchQuery && suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2 flex items-center justify-between">
                    <span>Real-time suggestions from both databases</span>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="flex items-center">🔬 Experimental</span>
                      <span className="flex items-center">🧠 Motif-based</span>
                    </div>
                    {isLoading && (
                      <div className="ml-2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 px-3 pb-2">
                    Click any suggestion to open protein details in a new tab
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}-${suggestion.source}-${index}`}
                      className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3 ${
                        index === activeSuggestion
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="text-lg">
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {suggestion.value}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {suggestion.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-sm"
                          title={getSourceLabel(suggestion.source)}
                        >
                          {getSourceIndicator(suggestion.source)}
                        </span>
                        {suggestion.id && (
                          <>
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {suggestion.hsn_id}
                            </div>
                            <span title="Opens in new tab">
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div className="p-2">
                  <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 px-3 py-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Popular Searches</span>
                  </div>
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && suggestions.length === 0 && !isLoading && (
                <div className="p-4 text-center text-gray-500">
                  No suggestions found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/browse")}
            className="rounded-full"
          >
            Browse All Proteins
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSearch("cancer_causing:true")}
            className="rounded-full"
          >
            Cancer Proteins
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSearch("S-Nitrosylation")}
            className="rounded-full"
          >
            S-Nitrosylation
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSearch("BRCA1")}
            className="rounded-full"
          >
            Sample Gene
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/browse?type=motif")}
            className="rounded-full"
          >
            Motif-Based Predictions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CentralSearch;
