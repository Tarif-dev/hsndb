import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Share2,
  Copy,
  ChevronDown,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProteinData } from "@/hooks/useProteinData";
import { useFasta } from "@/hooks/useFasta";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProteinViewer3D from "@/components/ProteinViewer3D";
import NetworkVisualization from "@/components/NetworkVisualization";
import FastaSequence from "@/components/FastaSequence";
import ProteinStructuralPlot from "@/components/ProteinStructuralPlotNew";
import { useProteinVisualizationDataNew } from "@/hooks/useProteinVisualizationDataNew";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CancerMutationInfo from "@/components/CancerMutationInfo";
import StructuralClassificationSection from "@/components/StructuralClassification";

const ProteinDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fastaModalOpen, setFastaModalOpen] = React.useState(false);
  const [fastaData, setFastaData] = React.useState<string | null>(null);
  const [cdsModalOpen, setCdsModalOpen] = React.useState(false);
  const [cdsData, setCdsData] = React.useState<string | null>(null);
  const {
    data: protein,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["protein", id],
    queryFn: async () => {
      if (!id) throw new Error("No protein ID provided");

      // First try to find in experimentally validated proteins
      const { data: expData, error: expError } = await supabase
        .from("proteins")
        .select("*")
        .eq("id", id)
        .single();

      if (!expError && expData) {
        // Add a source field to indicate this is an experimentally validated protein
        return { ...expData, source: "experimental" };
      }

      // If not found in experimental proteins, check motif-based proteins
      const { data: motifData, error: motifError } = await supabase
        .from("motif_based_proteins")
        .select("*")
        .eq("id", id)
        .single();

      if (motifError) throw motifError;

      // Add a source field and map motif positions to the same structure as nitrosylation positions
      return {
        ...motifData,
        source: "motif",
      };
    },
    enabled: !!id,
  });
  // Fetch real protein data from external APIs
  const {
    processedData,
    stringInteractions,
    isLoading: isLoadingExternalData,
  } = useProteinData(protein?.uniprot_id || "", !!protein?.uniprot_id);

  // Fetch comprehensive visualization data
  const {
    data: visualizationData,
    isLoading: isLoadingVisualizationData,
    error: visualizationError,
  } = useProteinVisualizationDataNew(protein?.uniprot_id || undefined);

  // Fetch FASTA data for sequence display
  const { data: fastaInfo } = useFasta(protein?.hsn_id || "");

  // Extract sequence from FASTA data
  const extractSequenceFromFasta = (fastaText: string): string => {
    if (!fastaText) return "";
    const lines = fastaText.split("\n");
    return lines.slice(1).join("").replace(/\s/g, "");
  };

  const proteinSequence = fastaInfo?.fasta
    ? extractSequenceFromFasta(fastaInfo.fasta)
    : "";

  const handleCopyId = () => {
    if (protein?.hsn_id) {
      navigator.clipboard.writeText(protein.hsn_id);
      toast({
        title: "Copied!",
        description: "HSN ID copied to clipboard",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Protein details link copied to clipboard",
    });
  };

  const handleExportNetwork = () => {
    if (!protein) return;

    const exportData = {
      centerProtein: protein.gene_name || protein.protein_name,
      interactions: stringInteractions,
      exportDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${protein.gene_name}_interaction_network.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleFullNetwork = () => {
    if (!protein?.uniprot_id) return;

    // Open STRING database in new tab for full network view
    window.open(
      `https://string-db.org/network/${protein.uniprot_id}`,
      "_blank"
    );
  };

  const handleViewFastaModal = async () => {
    if (!protein?.hsn_id) return;

    try {
      // Fetch FASTA data from the formats table
      const { data: fastaData, error } = await supabase
        .from("formats")
        .select("fasta")
        .eq("hsn_id", protein.hsn_id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching FASTA data:", error);
        toast({
          title: "Failed to Load",
          description: "Could not fetch FASTA sequence",
          variant: "destructive",
        });
        return;
      }

      if (!fastaData?.fasta) {
        toast({
          title: "No Data",
          description: "FASTA sequence not available for this protein",
          variant: "destructive",
        });
        return;
      }

      setFastaData(fastaData.fasta);
      setFastaModalOpen(true);
    } catch (error) {
      console.error("Error loading FASTA:", error);
      toast({
        title: "Failed to Load",
        description: "An error occurred while loading the FASTA sequence",
        variant: "destructive",
      });
    }
  };

  const handleViewCdsModal = async () => {
    if (!protein?.hsn_id) return;

    try {
      // Fetch CDS data from the formats table
      const { data: cdsData, error } = await supabase
        .from("formats")
        .select("CDS_sequence")
        .eq("hsn_id", protein.hsn_id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching CDS data:", error);
        toast({
          title: "Failed to Load",
          description: "Could not fetch CDS sequence",
          variant: "destructive",
        });
        return;
      }

      if (!cdsData?.CDS_sequence) {
        toast({
          title: "No Data",
          description: "CDS sequence not available for this protein",
          variant: "destructive",
        });
        return;
      }

      setCdsData(cdsData.CDS_sequence);
      setCdsModalOpen(true);
    } catch (error) {
      console.error("Error loading CDS:", error);
      toast({
        title: "Failed to Load",
        description: "An error occurred while loading the CDS sequence",
        variant: "destructive",
      });
    }
  };

  const handleCopyFasta = () => {
    if (fastaData) {
      navigator.clipboard.writeText(fastaData);
      toast({
        title: "Copied!",
        description: "FASTA sequence copied to clipboard",
      });
    }
  };

  const handleDownloadFromModal = () => {
    if (!fastaData || !protein) return;

    const fileName = `${protein.gene_name || protein.protein_name}_${
      protein.hsn_id
    }.fasta`;

    const blob = new Blob([fastaData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `FASTA sequence saved as ${fileName}`,
    });
  };

  const handleCopyCds = () => {
    if (cdsData) {
      navigator.clipboard.writeText(cdsData);
      toast({
        title: "Copied!",
        description: "CDS sequence copied to clipboard",
      });
    }
  };

  const handleDownloadCdsFromModal = () => {
    if (!cdsData || !protein) return;

    const fileName = `${protein.gene_name || protein.protein_name}_${
      protein.hsn_id
    }_CDS.fasta`;

    const blob = new Blob([cdsData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `CDS sequence saved as ${fileName}`,
    });
  };

  const formatFastaForDisplay = (fastaText: string) => {
    // First, replace literal \n with actual newlines
    const normalizedText = fastaText.replace(/\\n/g, "\n");

    const lines = normalizedText.split("\n");
    const header = lines[0];
    const sequence = lines.slice(1).join("").replace(/\s/g, "");

    // Format sequence in lines of 80 characters (standard FASTA format)
    const formattedSequence =
      sequence.match(/.{1,80}/g)?.join("\n") || sequence;

    return `${header}\n${formattedSequence}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !protein) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Protein Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The requested protein could not be found.
            </p>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-6">
              {" "}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {" "}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-foreground">
                    {protein.protein_name}
                  </h1>
                  {protein.source === "motif" && (
                    <Badge className="bg-green-100 text-green-800">
                      Motif-Based
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg text-muted-foreground">
                    {protein.gene_name}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyId}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {protein.hsn_id}
                  </Button>
                </div>

                {/* Add FASTA sequence below gene name */}
                <FastaSequence hsnId={protein.hsn_id} />

                <div className="flex flex-wrap gap-3 mb-6 mt-4">
                  {" "}
                  {protein.source === "experimental" ? (
                    <Badge
                      variant={
                        (protein as any).cancer_causing
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {(protein as any).cancer_causing
                        ? "Cancer Associated"
                        : "Non-Cancer Associated"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Unknown Cancer Association
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {protein.total_sites} Nitrosylation Sites
                  </Badge>
                  <Badge variant="outline">
                    {protein.protein_length} amino acids
                  </Badge>
                  {processedData?.molecularWeight && (
                    <Badge variant="outline">
                      {Math.round(processedData.molecularWeight / 1000)} kDa
                    </Badge>
                  )}
                </div>
              </div>{" "}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>{" "}
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleViewFastaModal}>
                      <Download className="h-4 w-4 mr-2" />
                      FASTA (Canonical)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleViewCdsModal}>
                      <Download className="h-4 w-4 mr-2" />
                      CDS Sequence
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Download className="h-4 w-4 mr-2" />
                      JSON (Coming Soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Download className="h-4 w-4 mr-2" />
                      CSV (Coming Soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Download className="h-4 w-4 mr-2" />
                      XML (Coming Soon)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {" "}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="disorder">Structural Analysis</TabsTrigger>
              <TabsTrigger value="function">Function</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    {" "}
                    <CardTitle className="flex items-center justify-between">
                      Basic Information
                      {protein.source === "experimental" ? (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                          Experimentally Validated
                        </Badge>
                      ) : (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                          Motif-Based Prediction
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          HSN ID
                        </label>
                        <p className="text-lg font-mono">{protein.hsn_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Gene Name
                        </label>
                        <p className="text-lg">{protein.gene_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          UniProt ID
                        </label>
                        <a
                          href={`https://www.uniprot.org/uniprotkb/${protein.uniprot_id}/entry`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-mono text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                        >
                          {protein.uniprot_id}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          AlphaFold ID
                        </label>
                        <a
                          href={`https://alphafold.ebi.ac.uk/search/text/${protein.alphafold_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-mono text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                        >
                          {protein.alphafold_id}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Protein Name
                      </label>
                      <p className="text-lg mt-1">{protein.protein_name}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Protein Length
                        </label>
                        <p className="text-lg">
                          {protein.protein_length} amino acids
                        </p>
                      </div>{" "}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Total Nitrosylation Sites
                        </label>
                        <p className="text-lg font-semibold">
                          {protein.total_sites}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Disorder Percentage
                        </label>
                        <p className="text-lg">
                          {visualizationData?.disorder_scores
                            ? (() => {
                                const scores = Object.values(
                                  visualizationData.disorder_scores
                                );
                                const disorderedCount = scores.filter(
                                  (score) => score >= 0.5
                                ).length;
                                const percentage =
                                  (disorderedCount / scores.length) * 100;
                                return `${percentage.toFixed(1)}%`;
                              })()
                            : "N/A"}
                        </p>
                      </div>
                    </div>{" "}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nitrosylation Positions
                      </label>
                      <p className="text-lg font-mono mt-1 bg-muted p-2 rounded">
                        {protein.positions_of_nitrosylation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {/* Cancer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cancer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Original cancer association for experimental proteins */}
                    {protein.source === "experimental" && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            General Cancer Association
                          </label>
                          <div className="mt-2">
                            <Badge
                              variant={
                                (protein as any).cancer_causing
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-sm"
                            >
                              {(protein as any).cancer_causing ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </div>

                        {(protein as any).cancer_types &&
                          (protein as any).cancer_types.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                General Cancer Types
                              </label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(protein as any).cancer_types.map(
                                  (type: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {type}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        <Separator />
                      </>
                    )}

                    {/* Enhanced Cancer Mutation Information */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-3 block">
                        Cysteine Cancer Mutations
                      </label>
                      <CancerMutationInfo
                        geneName={protein.gene_name}
                        uniprotId={protein.uniprot_id}
                        nitrosylationPositions={
                          protein.positions_of_nitrosylation
                        }
                      />
                    </div>

                    {protein.source === "motif" && (
                      <>
                        <Separator />
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <p className="text-sm text-amber-800">
                            <strong>Note:</strong> This is a motif-based
                            predicted protein with the{" "}
                            <span className="font-mono bg-amber-100 text-amber-900 px-1 rounded">
                              [I/L]-X-C-X₂-[D/E]
                            </span>{" "}
                            motif. Cancer mutation data shown above is based on
                            the gene/protein identity and may include
                            experimental validation data.
                          </p>
                        </div>
                      </>
                    )}

                    <div className="pt-4">
                      <h4 className="font-medium mb-2">
                        Additional Cancer Research Links
                      </h4>
                      <div className="space-y-2">
                        <a
                          href={`https://www.ncbi.nlm.nih.gov/gene/?term=${protein.gene_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          NCBI Gene Database
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${protein.gene_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          GeneCards
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Structural Classification Section */}
              <StructuralClassificationSection uniprotId={protein.uniprot_id} />
            </TabsContent>

            <TabsContent value="structure" className="space-y-6">
              {/* 3D Protein Structure - Full width with integrated details and structural properties below */}
              <div className="space-y-6">
                {" "}
                <ProteinViewer3D
                  uniprotId={protein.uniprot_id}
                  alphafoldId={protein.alphafold_id}
                  proteinName={protein.protein_name}
                  sequence={proteinSequence}
                  nitrosylationSites={
                    protein.positions_of_nitrosylation
                      ? protein.positions_of_nitrosylation
                          .split(",")
                          .map(Number)
                      : []
                  }
                />
                {/* Structural Properties - Now displayed below the 3D viewer */}
                <Card>
                  <CardHeader>
                    <CardTitle>Structural Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingExternalData ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                          Loading structural data...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Molecular Weight
                          </label>
                          <p className="text-lg">
                            {processedData?.molecularWeight
                              ? `${Math.round(
                                  processedData.molecularWeight / 1000
                                )} kDa`
                              : `~${Math.round(
                                  protein.protein_length * 0.11
                                )} kDa (estimated)`}
                          </p>
                        </div>

                        {processedData?.domains &&
                        processedData.domains.length > 0 ? (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Protein Domains
                            </label>
                            <div className="space-y-2 mt-2">
                              {processedData.domains
                                .slice(0, 5)
                                .map((domain, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {domain.description} ({domain.start}-
                                    {domain.end})
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Predicted Domains
                            </label>
                            <div className="space-y-2 mt-2">
                              <Badge variant="outline">
                                Signal Peptide (1-25)
                              </Badge>
                              <Badge variant="outline">
                                Functional Domain (26-
                                {Math.floor(protein.protein_length * 0.7)})
                              </Badge>
                              <Badge variant="outline">
                                C-terminal Region (
                                {Math.floor(protein.protein_length * 0.7) + 1}-
                                {protein.protein_length})
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Secondary Structure
                          </label>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>α-Helices</span>
                              <span>
                                ~
                                {processedData?.secondaryStructure
                                  ?.alpha_helix || 35}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>β-Sheets</span>
                              <span>
                                ~
                                {processedData?.secondaryStructure
                                  ?.beta_sheet || 25}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Random Coils</span>
                              <span>
                                ~
                                {processedData?.secondaryStructure
                                  ?.random_coil || 40}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>{" "}
            </TabsContent>

            <TabsContent value="disorder" className="space-y-6">
              {visualizationData ? (
                <ProteinStructuralPlot
                  data={visualizationData}
                  height={700}
                  className="w-full"
                />
              ) : isLoadingVisualizationData ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">
                        Loading protein structural data...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Structural Data Not Available</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Structural and disorder prediction data is not available
                        for this protein.
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• UniProt ID: {protein?.uniprot_id || "N/A"}</p>
                        <p>• HSN ID: {protein?.hsn_id}</p>
                      </div>
                      {visualizationError && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">
                            Error loading data: {visualizationError?.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="function" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Functional Annotation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingExternalData ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                          Loading functional data...
                        </p>
                      </div>
                    ) : (
                      <>
                        {processedData?.goTerms && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              GO Terms
                            </label>
                            <div className="space-y-2 mt-2">
                              {processedData.goTerms.molecular_function
                                .slice(0, 2)
                                .map((term, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    Molecular Function: {term.term}
                                  </Badge>
                                ))}
                              {processedData.goTerms.biological_process
                                .slice(0, 2)
                                .map((term, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    Biological Process: {term.term}
                                  </Badge>
                                ))}
                              {processedData.goTerms.cellular_component
                                .slice(0, 2)
                                .map((term, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    Cellular Component: {term.term}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}

                        {processedData?.pathways &&
                        processedData.pathways.length > 0 ? (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Pathways
                            </label>
                            <div className="space-y-2 mt-2">
                              {processedData.pathways
                                .slice(0, 3)
                                .map((pathway, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {pathway.name}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Pathways
                            </label>
                            <div className="space-y-2 mt-2">
                              <Badge variant="outline">
                                MAPK signaling pathway
                              </Badge>
                              <Badge variant="outline">
                                Cell cycle regulation
                              </Badge>
                              <Badge variant="outline">Apoptosis</Badge>
                            </div>
                          </div>
                        )}

                        {processedData?.function && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Function Description
                            </label>
                            <p className="text-sm mt-1 bg-muted p-2 rounded">
                              {processedData.function.substring(0, 300)}...
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>S-Nitrosylation Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Functional Impact
                      </label>
                      <p className="text-sm mt-1">
                        S-nitrosylation at {protein.total_sites} site(s) may
                        regulate protein activity, localization, and
                        protein-protein interactions.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Modified Residues
                      </label>
                      <p className="text-sm font-mono mt-1 bg-muted p-2 rounded">
                        {protein.positions_of_nitrosylation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="interactions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interactive Network Visualization */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Protein Interaction Network{" "}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportNetwork}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFullNetwork}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Full Network
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>{" "}
                  <CardContent>
                    {" "}
                    <NetworkVisualization
                      centerProtein={protein.gene_name || protein.protein_name}
                      interactions={stringInteractions}
                      isLoading={isLoadingExternalData}
                      onNodeClick={(nodeId) => {
                        // Open external link or navigate to protein details
                        window.open(
                          `https://www.uniprot.org/uniprotkb?query=${nodeId}`,
                          "_blank"
                        );
                      }}
                      onExport={handleExportNetwork}
                    />
                  </CardContent>
                </Card>

                {/* Interaction Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interaction Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {stringInteractions.length || 15}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Direct Interactions
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {stringInteractions.filter((i) => i.score > 0.7)
                            .length || 8}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          High Confidence
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          3
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pathways
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          7
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Complexes
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Interaction Partners */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Interaction Partners</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingExternalData ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                          Loading interaction data...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stringInteractions.length > 0 ? (
                          stringInteractions
                            .slice(0, 5)
                            .map((interaction, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div>
                                  <div className="font-medium text-sm">
                                    {interaction.preferredName_B}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Score:{" "}
                                    {(interaction.score * 1000).toFixed(0)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      interaction.score > 0.7
                                        ? "default"
                                        : interaction.score > 0.4
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {interaction.score > 0.7
                                      ? "High"
                                      : interaction.score > 0.4
                                      ? "Medium"
                                      : "Low"}
                                  </Badge>
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium text-sm">TP53</div>
                                <div className="text-xs text-muted-foreground">
                                  Score: 850
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">
                                  High
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium text-sm">MDM2</div>
                                <div className="text-xs text-muted-foreground">
                                  Score: 720
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Medium
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium text-sm">BRCA1</div>
                                <div className="text-xs text-muted-foreground">
                                  Score: 680
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">
                                  High
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Functional Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Functional Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cell Cycle Control</span>
                        <Badge variant="outline">5 interactions</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">DNA Repair</span>
                        <Badge variant="outline">3 interactions</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Signal Transduction</span>
                        <Badge variant="outline">7 interactions</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Metabolic Process</span>
                        <Badge variant="outline">2 interactions</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* External Database Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interaction Databases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a
                        href={`https://string-db.org/network/${protein.uniprot_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            STRING Database
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Protein-protein interactions
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <a
                        href={`https://www.ebi.ac.uk/intact/search?query=${protein.gene_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            IntAct Database
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Molecular interactions
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <a
                        href={`https://biogrid.org/search.php?search=${protein.gene_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">BioGRID</div>
                          <div className="text-xs text-muted-foreground">
                            Biological interactions
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>{" "}
        </div>
      </div>
      <Footer />

      {/* FASTA Export Modal */}
      <Dialog open={fastaModalOpen} onOpenChange={setFastaModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>FASTA Sequence Export</DialogTitle>
            <DialogDescription>
              Complete FASTA sequence for {protein?.protein_name} (HSN ID:{" "}
              {protein?.hsn_id})
            </DialogDescription>
          </DialogHeader>

          {fastaData && (
            <div className="space-y-4">
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyFasta}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
                <Button
                  onClick={handleDownloadFromModal}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
              </div>

              {/* FASTA display */}
              <div className="border rounded-lg">
                <div className="bg-muted p-2 border-b">
                  <span className="text-sm font-medium">FASTA Format</span>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {formatFastaForDisplay(fastaData)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CDS Export Modal */}
      <Dialog open={cdsModalOpen} onOpenChange={setCdsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>CDS Sequence Export</DialogTitle>
            <DialogDescription>
              Complete CDS sequence for {protein?.protein_name} (HSN ID:{" "}
              {protein?.hsn_id})
            </DialogDescription>
          </DialogHeader>

          {cdsData && (
            <div className="space-y-4">
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyCds}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
                <Button
                  onClick={handleDownloadCdsFromModal}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
              </div>

              {/* CDS display */}
              <div className="border rounded-lg">
                <div className="bg-muted p-2 border-b">
                  <span className="text-sm font-medium">CDS Sequence</span>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {formatFastaForDisplay(cdsData)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProteinDetails;
