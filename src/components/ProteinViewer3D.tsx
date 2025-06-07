
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RotateCcw, Download, Maximize } from 'lucide-react';

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
        // If AlphaFold file exists, load it
        newViewer.addModel(await fetchPDBData(alphafoldUrl), 'pdb');
      } catch {
        // Fallback to RCSB PDB search by UniProt ID
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
    
    // Re-add model with new style
    const alphafoldUrl = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.pdb`;
    
    fetchPDBData(alphafoldUrl).then(pdbData => {
      viewer.addModel(pdbData, 'pdb');
      
      const styleConfig: any = {};
      styleConfig[newStyle] = { color: colorScheme };
      
      viewer.setStyle({}, styleConfig);
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>3D Protein Structure</CardTitle>
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
            className="w-full h-96 bg-white rounded-lg border border-border overflow-hidden"
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
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Controls:</strong> Left click & drag to rotate • Right click & drag to zoom • 
          Middle click & drag to pan • Scroll wheel to zoom
        </div>
      </CardContent>
    </Card>
  );
};

export default ProteinViewer3D;
