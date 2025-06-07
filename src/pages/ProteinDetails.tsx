import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Download, Share2, Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProteinViewer3D from "@/components/ProteinViewer3D";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const ProteinDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: protein,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["protein", id],
    queryFn: async () => {
      if (!id) throw new Error("No protein ID provided");

      const { data, error } = await supabase
        .from("proteins")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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
            <Button onClick={() => navigate("/browse")}>Back to Browse</Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/browse")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Browse
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {protein.protein_name}
                </h1>

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

                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge
                    variant={
                      protein.cancer_causing ? "destructive" : "secondary"
                    }
                  >
                    {protein.cancer_causing
                      ? "Cancer Associated"
                      : "Non-Cancer Associated"}
                  </Badge>
                  <Badge variant="outline">
                    {protein.total_sites} Nitrosylation Sites
                  </Badge>
                  <Badge variant="outline">
                    {protein.protein_length} amino acids
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="function">Function</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Protein Length
                        </label>
                        <p className="text-lg">
                          {protein.protein_length} amino acids
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Total Nitrosylation Sites
                        </label>
                        <p className="text-lg font-semibold">
                          {protein.total_sites}
                        </p>
                      </div>
                    </div>

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
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Cancer Association
                      </label>
                      <div className="mt-2">
                        <Badge
                          variant={
                            protein.cancer_causing ? "destructive" : "secondary"
                          }
                          className="text-sm"
                        >
                          {protein.cancer_causing ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    {protein.cancer_types &&
                      protein.cancer_types.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Associated Cancer Types
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {protein.cancer_types.map((type, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="pt-4">
                      <h4 className="font-medium mb-2">
                        Cancer Research Links
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
            </TabsContent>

            <TabsContent value="structure" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3D Protein Structure - Now with real data */}
                <ProteinViewer3D
                  uniprotId={protein.uniprot_id}
                  alphafoldId={protein.alphafold_id}
                  proteinName={protein.protein_name}
                />

                {/* Structural Properties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Structural Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Molecular Weight
                      </label>
                      <p className="text-lg">
                        ~{Math.round(protein.protein_length * 0.11)} kDa
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Predicted Domains
                      </label>
                      <div className="space-y-2 mt-2">
                        <Badge variant="outline">Signal Peptide (1-25)</Badge>
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
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Secondary Structure
                      </label>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>α-Helices</span>
                          <span>~35%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>β-Sheets</span>
                          <span>~25%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Random Coils</span>
                          <span>~40%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="function" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Functional Annotation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        GO Terms
                      </label>
                      <div className="space-y-2 mt-2">
                        <Badge variant="outline">
                          Molecular Function: Protein binding
                        </Badge>
                        <Badge variant="outline">
                          Biological Process: Signal transduction
                        </Badge>
                        <Badge variant="outline">
                          Cellular Component: Cytoplasm
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Pathways
                      </label>
                      <div className="space-y-2 mt-2">
                        <Badge variant="outline">MAPK signaling pathway</Badge>
                        <Badge variant="outline">Cell cycle regulation</Badge>
                        <Badge variant="outline">Apoptosis</Badge>
                      </div>
                    </div>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Protein Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Interaction Network
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          STRING Database Integration
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Known Interactions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Direct Interactions
                      </label>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-mono">PROTEIN1</span>
                          <Badge variant="outline" className="text-xs">
                            High confidence
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-mono">PROTEIN2</span>
                          <Badge variant="outline" className="text-xs">
                            Medium confidence
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-mono">PROTEIN3</span>
                          <Badge variant="outline" className="text-xs">
                            High confidence
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Interaction Databases
                      </label>
                      <div className="space-y-2 mt-2">
                        <a
                          href={`https://string-db.org/network/${protein.uniprot_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          STRING Database
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={`https://www.ebi.ac.uk/intact/search?query=${protein.gene_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          IntAct Database
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProteinDetails;
