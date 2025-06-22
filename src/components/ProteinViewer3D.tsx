import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, RotateCcw, Download, Maximize, Info } from "lucide-react";

declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface ProteinViewer3DProps {
  uniprotId: string;
  alphafoldId: string;
  proteinName: string;
  nitrosylationSites?: number[]; // Add this prop to accept nitrosylation positions
}

interface ResidueInfo {
  resn: string;
  resi: number;
  chain: string;
  atom: string;
  position: { x: number; y: number; z: number };
}

const ProteinViewer3D: React.FC<ProteinViewer3DProps> = ({
  uniprotId,
  alphafoldId,
  proteinName,
  nitrosylationSites = [], // Default to empty array if not provided
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("cartoon");
  const [colorScheme, setColorScheme] = useState("spectrum");
  const [hoveredResidue, setHoveredResidue] = useState<ResidueInfo | null>(
    null
  );

  // Amino acid properties lookup
  const aminoAcidProperties = {
    ALA: {
      name: "Alanine",
      type: "Nonpolar",
      symbol: "A",
      hydrophobic: true,
      color: "#C8C8C8",
    },
    ARG: {
      name: "Arginine",
      type: "Positively charged",
      symbol: "R",
      hydrophobic: false,
      color: "#145AFF",
    },
    ASN: {
      name: "Asparagine",
      type: "Polar",
      symbol: "N",
      hydrophobic: false,
      color: "#00DCDC",
    },
    ASP: {
      name: "Aspartic acid",
      type: "Negatively charged",
      symbol: "D",
      hydrophobic: false,
      color: "#E60A0A",
    },
    CYS: {
      name: "Cysteine",
      type: "Polar",
      symbol: "C",
      hydrophobic: false,
      color: "#E6E600",
    },
    GLN: {
      name: "Glutamine",
      type: "Polar",
      symbol: "Q",
      hydrophobic: false,
      color: "#00DCDC",
    },
    GLU: {
      name: "Glutamic acid",
      type: "Negatively charged",
      symbol: "E",
      hydrophobic: false,
      color: "#E60A0A",
    },
    GLY: {
      name: "Glycine",
      type: "Nonpolar",
      symbol: "G",
      hydrophobic: true,
      color: "#EBEBEB",
    },
    HIS: {
      name: "Histidine",
      type: "Positively charged",
      symbol: "H",
      hydrophobic: false,
      color: "#8282D2",
    },
    ILE: {
      name: "Isoleucine",
      type: "Nonpolar",
      symbol: "I",
      hydrophobic: true,
      color: "#0F820F",
    },
    LEU: {
      name: "Leucine",
      type: "Nonpolar",
      symbol: "L",
      hydrophobic: true,
      color: "#0F820F",
    },
    LYS: {
      name: "Lysine",
      type: "Positively charged",
      symbol: "K",
      hydrophobic: false,
      color: "#145AFF",
    },
    MET: {
      name: "Methionine",
      type: "Nonpolar",
      symbol: "M",
      hydrophobic: true,
      color: "#E6E600",
    },
    PHE: {
      name: "Phenylalanine",
      type: "Nonpolar",
      symbol: "F",
      hydrophobic: true,
      color: "#3232AA",
    },
    PRO: {
      name: "Proline",
      type: "Nonpolar",
      symbol: "P",
      hydrophobic: true,
      color: "#DC9682",
    },
    SER: {
      name: "Serine",
      type: "Polar",
      symbol: "S",
      hydrophobic: false,
      color: "#FA9600",
    },
    THR: {
      name: "Threonine",
      type: "Polar",
      symbol: "T",
      hydrophobic: false,
      color: "#FA9600",
    },
    TRP: {
      name: "Tryptophan",
      type: "Nonpolar",
      symbol: "W",
      hydrophobic: true,
      color: "#B45AB4",
    },
    TYR: {
      name: "Tyrosine",
      type: "Polar",
      symbol: "Y",
      hydrophobic: false,
      color: "#3232AA",
    },
    VAL: {
      name: "Valine",
      type: "Nonpolar",
      symbol: "V",
      hydrophobic: true,
      color: "#0F820F",
    },
  };

  useEffect(() => {
    // Load 3Dmol.js script
    const script = document.createElement("script");
    script.src = "https://3Dmol.csb.pitt.edu/build/3Dmol-min.js";
    script.onload = () => {
      initializeViewer();
    };
    document.head.appendChild(script);

    return () => {
      if (viewer) {
        viewer.clear();
      }
    };
  }, []);

  const initializeViewer = async () => {
    if (!viewerRef.current || !window.$3Dmol) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create 3Dmol viewer with optimized settings
      const config = {
        backgroundColor: "white",
        antialias: true,
        quality: "medium", // Changed from 'high' to 'medium' for better performance
      };
      const newViewer = window.$3Dmol.createViewer(viewerRef.current, config);

      // Try AlphaFold first, then fallback to RCSB PDB
      const alphafoldUrl = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.pdb`;

      try {
        await fetch(alphafoldUrl);
        newViewer.addModel(await fetchPDBData(alphafoldUrl), "pdb");
      } catch {
        const rcsdbUrl = `https://data.rcsb.org/rest/v1/core/uniprot/${uniprotId}`;
        try {
          const response = await fetch(rcsdbUrl);
          const data = await response.json();
          if (data.rcsb_id) {
            const pdbUrl = `https://files.rcsb.org/view/${data.rcsb_id}.pdb`;
            newViewer.addModel(await fetchPDBData(pdbUrl), "pdb");
          } else {
            throw new Error("No structure available");
          }
        } catch {
          throw new Error("No 3D structure found for this protein");
        }
      } // Set initial style
      newViewer.setStyle({}, { cartoon: { color: "spectrum" } });

      // Add optimized hover interactions
      setupHoverInteractions(newViewer);

      // Highlight nitrosylation sites
      highlightNitrosylationSites(newViewer);

      newViewer.zoomTo();
      newViewer.render();

      setViewer(newViewer);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading 3D structure:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load 3D structure"
      );
      setIsLoading(false);
    }
  };

  const setupHoverInteractions = (viewerInstance: any) => {
    let hoverTimeout: NodeJS.Timeout;

    // Optimized hover callback with debouncing
    viewerInstance.setHoverable(
      {},
      true,
      (atom: any, viewer: any, event: any) => {
        if (atom) {
          // Clear any existing timeout
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
          }

          // Debounce the hover effect to improve performance
          hoverTimeout = setTimeout(() => {
            setHoveredResidue({
              resn: atom.resn,
              resi: atom.resi,
              chain: atom.chain,
              atom: atom.elem,
              position: { x: atom.x, y: atom.y, z: atom.z },
            });
          }, 50); // 50ms debounce
        }
      },
      (atom: any, viewer: any) => {
        // Mouse out - clear residue info
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }

        setTimeout(() => {
          setHoveredResidue(null);
        }, 100); // Small delay to prevent flickering
      }
    );
  };

  const fetchPDBData = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch PDB data");
    }
    return await response.text();
  };

  const updateStyle = (newStyle: string) => {
    if (!viewer) return;

    setStyle(newStyle);
    viewer.removeAllModels();

    const alphafoldUrl = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.pdb`;

    fetchPDBData(alphafoldUrl)
      .then((pdbData) => {
        viewer.addModel(pdbData, "pdb");

        const styleConfig: any = {};
        styleConfig[newStyle] = { color: colorScheme };
        viewer.setStyle({}, styleConfig);
        setupHoverInteractions(viewer);
        // Re-apply nitrosylation site highlighting after style change
        highlightNitrosylationSites(viewer);
        viewer.render();
      })
      .catch(() => {
        // Handle error silently as we already have error handling above
      });
  };
  const updateColorScheme = (newColorScheme: string) => {
    if (!viewer) return;

    setColorScheme(newColorScheme);

    if (newColorScheme === "nitrosylation") {
      // For nitrosylation scheme, set base color to light grey for contrast
      const baseStyleConfig: any = {};
      baseStyleConfig[style] = { color: "#CCCCCC" }; // Light grey base
      viewer.setStyle({}, baseStyleConfig);

      // Then highlight the nitrosylation sites with bright color
      highlightNitrosylationSites(viewer);
    } else {
      // For other color schemes, apply normally
      const styleConfig: any = {};
      styleConfig[style] = { color: newColorScheme };
      viewer.setStyle({}, styleConfig);

      // Re-apply nitrosylation site highlighting
      highlightNitrosylationSites(viewer);
    }

    viewer.render();
  };

  const resetView = () => {
    if (!viewer) return;
    viewer.zoomTo();
    viewer.render();
  };

  const downloadImage = () => {
    if (!viewer) return;
    const imgData = viewer.pngURI();
    const link = document.createElement("a");
    link.download = `${proteinName}_3D_structure.png`;
    link.href = imgData;
    link.click();
  };

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      viewerRef.current.requestFullscreen();
    }
  };

  // Highlight nitrosylation sites in the model
  const highlightNitrosylationSites = (viewerInstance: any) => {
    if (!viewerInstance || nitrosylationSites.length === 0) return;

    // Bright red color for highlighting nitrosylation sites
    const highlightColor = "#FF3333";

    // Add a visual highlight for each nitrosylation site
    nitrosylationSites.forEach((position) => {
      // Select the residue at the specific position
      const sele = { resi: position };

      if (style === "surface") {
        // For surface style, color the surface at the position
        viewerInstance.addSurface(
          window.$3Dmol.SurfaceType.VDW,
          {
            opacity: 0.8,
            color: highlightColor,
          },
          sele
        );
      } else if (style === "cartoon") {
        // For cartoon style, add a sphere at the CA atom position (alpha carbon)
        // and color the cartoon at that position
        viewerInstance.addSphere({
          center: { resi: position },
          radius: 1.5,
          color: highlightColor,
          opacity: 0.8,
        });

        // Also color the cartoon at that position
        const styleSpec: any = {};
        styleSpec[style] = { color: highlightColor };
        viewerInstance.setStyle(sele, styleSpec);
      } else {
        // For other styles (stick, sphere, line), just color the residue
        const styleSpec: any = {};
        styleSpec[style] = { color: highlightColor };
        viewerInstance.setStyle(sele, styleSpec);
      }
    });

    viewerInstance.render();
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>3D Protein Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-200 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Structure Not Available
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Main 3D Viewer with integrated Residue Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                {" "}
                3D Protein Structure
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 max-w-xs">
                      <p>
                        Hover over the structure to see amino acid details in
                        the side panel
                      </p>
                      {nitrosylationSites.length > 0 && (
                        <p className="text-xs text-red-500">
                          S-Nitrosylation sites are highlighted in red when
                          using the "Highlight S-Nitrosylation" color option
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  AlphaFold: {alphafoldId}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  UniProt: {uniprotId}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Style:</label>
                <Select value={style} onValueChange={updateStyle}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="stick">Stick</SelectItem>
                    <SelectItem value="sphere">Sphere</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="surface">Surface</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Color:</label>
                <Select value={colorScheme} onValueChange={updateColorScheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {" "}
                    <SelectItem value="spectrum">Spectrum</SelectItem>
                    <SelectItem value="chain">By Chain</SelectItem>
                    <SelectItem value="residue">By Residue</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="grey">Grey</SelectItem>
                    {nitrosylationSites.length > 0 && (
                      <SelectItem value="nitrosylation">
                        Highlight S-Nitrosylation
                      </SelectItem>
                    )}
                    <SelectItem value="nitrosylation">
                      Nitrosylation Sites
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadImage}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 3D Viewer with Side Panel */}
            <div className="flex gap-4">
              {/* 3D Viewer - Takes most of the space */}
              <div className="flex-1 relative">
                <div
                  ref={viewerRef}
                  className="w-full h-96 bg-white rounded-lg border border-border overflow-hidden cursor-pointer"
                  style={{ minHeight: "400px" }}
                />

                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Loading 3D structure...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Residue Details Panel - Fixed width on the right */}
              <div className="w-80 flex-shrink-0">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Residue Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hoveredResidue ? (
                      <div className="space-y-4">
                        {" "}
                        {/* Header with badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-sm">
                            {hoveredResidue.chain}:{hoveredResidue.resi}
                          </Badge>
                          <Badge
                            variant={
                              aminoAcidProperties[
                                hoveredResidue.resn as keyof typeof aminoAcidProperties
                              ]?.hydrophobic
                                ? "default"
                                : "outline"
                            }
                            className="text-sm"
                          >
                            {aminoAcidProperties[
                              hoveredResidue.resn as keyof typeof aminoAcidProperties
                            ]?.symbol || hoveredResidue.resn}
                          </Badge>
                          {nitrosylationSites.includes(hoveredResidue.resi) && (
                            <Badge variant="destructive" className="text-xs">
                              S-Nitrosylation Site
                            </Badge>
                          )}
                        </div>
                        {/* Amino acid info */}
                        {aminoAcidProperties[
                          hoveredResidue.resn as keyof typeof aminoAcidProperties
                        ] && (
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-base">
                                {
                                  aminoAcidProperties[
                                    hoveredResidue.resn as keyof typeof aminoAcidProperties
                                  ].name
                                }
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {
                                  aminoAcidProperties[
                                    hoveredResidue.resn as keyof typeof aminoAcidProperties
                                  ].type
                                }
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Chain:
                                </span>
                                <span className="font-medium">
                                  {hoveredResidue.chain}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Position:
                                </span>
                                <span className="font-medium">
                                  {hoveredResidue.resi}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Residue:
                                </span>
                                <span className="font-medium">
                                  {hoveredResidue.resn}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Property:
                                </span>
                                <span className="font-medium">
                                  {aminoAcidProperties[
                                    hoveredResidue.resn as keyof typeof aminoAcidProperties
                                  ].hydrophobic
                                    ? "Hydrophobic"
                                    : "Hydrophilic"}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs space-y-1 pt-2 border-t">
                              <div className="font-medium text-muted-foreground">
                                3D Coordinates:
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  X: {hoveredResidue.position.x.toFixed(2)}
                                </div>
                                <div>
                                  Y: {hoveredResidue.position.y.toFixed(2)}
                                </div>
                                <div>
                                  Z: {hoveredResidue.position.z.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Hover over the protein structure to see residue
                          details
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-1">
              <div>
                <strong>Navigation:</strong> Left click & drag to rotate • Right
                click & drag to zoom • Middle click & drag to pan
              </div>
              <div>
                <strong>Interaction:</strong> Hover over any part of the protein
                to see amino acid residue details in the side panel
              </div>
            </div>
          </CardContent>
        </Card>{" "}
      </div>
    </TooltipProvider>
  );
};

export default ProteinViewer3D;
