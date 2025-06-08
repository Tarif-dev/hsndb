import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, RotateCcw, Download, Maximize, Info } from 'lucide-react';

declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface ProteinViewer3DProps {
  uniprotId: string;
  alphafoldId: string;
  proteinName: string;
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
  proteinName 
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState('cartoon');
  const [colorScheme, setColorScheme] = useState('spectrum');
  const [hoveredResidue, setHoveredResidue] = useState<ResidueInfo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [highlightedAtoms, setHighlightedAtoms] = useState<any[]>([]);

  // Amino acid properties lookup
  const aminoAcidProperties = {
    'ALA': { name: 'Alanine', type: 'Nonpolar', symbol: 'A', hydrophobic: true },
    'ARG': { name: 'Arginine', type: 'Positively charged', symbol: 'R', hydrophobic: false },
    'ASN': { name: 'Asparagine', type: 'Polar', symbol: 'N', hydrophobic: false },
    'ASP': { name: 'Aspartic acid', type: 'Negatively charged', symbol: 'D', hydrophobic: false },
    'CYS': { name: 'Cysteine', type: 'Polar', symbol: 'C', hydrophobic: false },
    'GLN': { name: 'Glutamine', type: 'Polar', symbol: 'Q', hydrophobic: false },
    'GLU': { name: 'Glutamic acid', type: 'Negatively charged', symbol: 'E', hydrophobic: false },
    'GLY': { name: 'Glycine', type: 'Nonpolar', symbol: 'G', hydrophobic: true },
    'HIS': { name: 'Histidine', type: 'Positively charged', symbol: 'H', hydrophobic: false },
    'ILE': { name: 'Isoleucine', type: 'Nonpolar', symbol: 'I', hydrophobic: true },
    'LEU': { name: 'Leucine', type: 'Nonpolar', symbol: 'L', hydrophobic: true },
    'LYS': { name: 'Lysine', type: 'Positively charged', symbol: 'K', hydrophobic: false },
    'MET': { name: 'Methionine', type: 'Nonpolar', symbol: 'M', hydrophobic: true },
    'PHE': { name: 'Phenylalanine', type: 'Nonpolar', symbol: 'F', hydrophobic: true },
    'PRO': { name: 'Proline', type: 'Nonpolar', symbol: 'P', hydrophobic: true },
    'SER': { name: 'Serine', type: 'Polar', symbol: 'S', hydrophobic: false },
    'THR': { name: 'Threonine', type: 'Polar', symbol: 'T', hydrophobic: false },
    'TRP': { name: 'Tryptophan', type: 'Nonpolar', symbol: 'W', hydrophobic: true },
    'TYR': { name: 'Tyrosine', type: 'Polar', symbol: 'Y', hydrophobic: false },
    'VAL': { name: 'Valine', type: 'Nonpolar', symbol: 'V', hydrophobic: true }
  };

  useEffect(() => {
    // Load 3Dmol.js script
    const script = document.createElement('script');
    script.src = 'https://3Dmol.csb.pitt.edu/build/3Dmol-min.js';
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

      // Create 3Dmol viewer
      const config = { 
        backgroundColor: 'white',
        antialias: true,
        quality: 'high'
      };
      const newViewer = window.$3Dmol.createViewer(viewerRef.current, config);
      
      // Try AlphaFold first, then fallback to RCSB PDB
      const alphafoldUrl = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.pdb`;
      
      try {
        await fetch(alphafoldUrl);
        newViewer.addModel(await fetchPDBData(alphafoldUrl), 'pdb');
      } catch {
        const rcsdbUrl = `https://data.rcsb.org/rest/v1/core/uniprot/${uniprotId}`;
        try {
          const response = await fetch(rcsdbUrl);
          const data = await response.json();
          if (data.rcsb_id) {
            const pdbUrl = `https://files.rcsb.org/view/${data.rcsb_id}.pdb`;
            newViewer.addModel(await fetchPDBData(pdbUrl), 'pdb');
          } else {
            throw new Error('No structure available');
          }
        } catch {
          throw new Error('No 3D structure found for this protein');
        }
      }

      // Set initial style
      newViewer.setStyle({}, { cartoon: { color: 'spectrum' } });
      
      // Add hover interactions
      setupHoverInteractions(newViewer);
      
      newViewer.zoomTo();
      newViewer.render();
      
      setViewer(newViewer);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading 3D structure:', err);
      setError(err instanceof Error ? err.message : 'Failed to load 3D structure');
      setIsLoading(false);
    }
  };

  const setupHoverInteractions = (viewerInstance: any) => {
    // Add hover callback for atoms
    viewerInstance.setHoverable({}, true, (atom: any, viewer: any, event: any) => {
      if (atom) {
        // Get mouse position for tooltip
        const rect = viewerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
        }

        // Clear previous highlights
        clearHighlights(viewer);

        // Highlight the entire residue
        const residueAtoms = viewer.selectedAtoms({
          resi: atom.resi,
          chain: atom.chain
        });

        // Add yellow highlight to the residue
        viewer.addStyle(
          { resi: atom.resi, chain: atom.chain },
          { stick: { color: 'yellow', radius: 0.3 } }
        );

        setHighlightedAtoms(residueAtoms);

        // Set residue info for tooltip
        setHoveredResidue({
          resn: atom.resn,
          resi: atom.resi,
          chain: atom.chain,
          atom: atom.elem,
          position: { x: atom.x, y: atom.y, z: atom.z }
        });

        setShowTooltip(true);
        viewer.render();
      }
    }, (atom: any, viewer: any) => {
      // Mouse out - clear highlights
      if (highlightedAtoms.length > 0) {
        clearHighlights(viewer);
        setShowTooltip(false);
        setHoveredResidue(null);
        viewer.render();
      }
    });
  };

  const clearHighlights = (viewer: any) => {
    if (hoveredResidue) {
      // Remove highlight styles
      viewer.removeStyle(
        { resi: hoveredResidue.resi, chain: hoveredResidue.chain },
        { stick: { color: 'yellow', radius: 0.3 } }
      );
    }
    setHighlightedAtoms([]);
  };

  const fetchPDBData = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch PDB data');
    }
    return await response.text();
  };

  const updateStyle = (newStyle: string) => {
    if (!viewer) return;
    
    setStyle(newStyle);
    viewer.removeAllModels();
    
    const alphafoldUrl = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.pdb`;
    
    fetchPDBData(alphafoldUrl).then(pdbData => {
      viewer.addModel(pdbData, 'pdb');
      
      const styleConfig: any = {};
      styleConfig[newStyle] = { color: colorScheme };
      
      viewer.setStyle({}, styleConfig);
      setupHoverInteractions(viewer);
      viewer.render();
    }).catch(() => {
      // Handle error silently as we already have error handling above
    });
  };

  const updateColorScheme = (newColorScheme: string) => {
    if (!viewer) return;
    
    setColorScheme(newColorScheme);
    const styleConfig: any = {};
    styleConfig[style] = { color: newColorScheme };
    
    viewer.setStyle({}, styleConfig);
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
    const link = document.createElement('a');
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

  // Custom tooltip component
  const ResidueTooltip = () => {
    if (!hoveredResidue || !showTooltip) return null;

    const aaInfo = aminoAcidProperties[hoveredResidue.resn as keyof typeof aminoAcidProperties];

    return (
      <div
        className="absolute z-50 bg-popover border border-border rounded-lg p-3 shadow-lg pointer-events-none max-w-xs"
        style={{
          left: tooltipPosition.x + 10,
          top: tooltipPosition.y - 10,
          transform: 'translateY(-100%)'
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {hoveredResidue.chain}:{hoveredResidue.resi}
            </Badge>
            <Badge 
              variant={aaInfo?.hydrophobic ? "default" : "outline"} 
              className="text-xs"
            >
              {aaInfo?.symbol || hoveredResidue.resn}
            </Badge>
          </div>
          
          {aaInfo && (
            <>
              <div>
                <p className="font-medium text-sm">{aaInfo.name}</p>
                <p className="text-xs text-muted-foreground">{aaInfo.type}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Chain:</span> {hoveredResidue.chain}
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span> {hoveredResidue.resi}
                </div>
                <div>
                  <span className="text-muted-foreground">Residue:</span> {hoveredResidue.resn}
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span> {aaInfo.hydrophobic ? 'Hydrophobic' : 'Hydrophilic'}
                </div>
              </div>
              
              <div className="text-xs">
                <span className="text-muted-foreground">Coordinates:</span>
                <br />
                X: {hoveredResidue.position.x.toFixed(2)}, 
                Y: {hoveredResidue.position.y.toFixed(2)}, 
                Z: {hoveredResidue.position.z.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </div>
    );
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
              <p className="text-sm text-muted-foreground mb-2">Structure Not Available</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              3D Protein Structure
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hover over the structure to see amino acid details</p>
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
                  <SelectItem value="spectrum">Spectrum</SelectItem>
                  <SelectItem value="chain">By Chain</SelectItem>
                  <SelectItem value="residue">By Residue</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="grey">Grey</SelectItem>
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

          {/* 3D Viewer */}
          <div className="relative">
            <div 
              ref={viewerRef} 
              className="w-full h-96 bg-white rounded-lg border border-border overflow-hidden cursor-pointer"
              style={{ minHeight: '400px' }}
            />
            
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading 3D structure...</p>
                </div>
              </div>
            )}

            {/* Custom Tooltip */}
            <ResidueTooltip />
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-1">
            <div><strong>Navigation:</strong> Left click & drag to rotate • Right click & drag to zoom • Middle click & drag to pan</div>
            <div><strong>Interaction:</strong> Hover over any part of the protein to see amino acid residue details</div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProteinViewer3D;
