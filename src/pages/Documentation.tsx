import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Database,
  Search,
  BarChart3,
  Zap,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Users,
  GitBranch,
  Code,
  FileText,
  Globe,
  Heart,
  Brain,
  Dna,
  Settings,
  Eye,
  TrendingUp,
  Shield,
  Info,
} from "lucide-react";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              HSNDB Documentation
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive guide to the Human S-nitrosylation Database - your
            complete resource for understanding S-nitrosylated proteins,
            database features, and research applications.
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="#overview"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-blue-600">
                  1. Database Overview
                </div>
                <div className="text-sm text-gray-600">
                  Introduction and key features
                </div>
              </a>
              <a
                href="#databases"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-blue-600">
                  2. Database Types
                </div>
                <div className="text-sm text-gray-600">
                  Experimental vs Motif-based
                </div>
              </a>
              <a
                href="#search"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-blue-600">
                  3. Search & Browse
                </div>
                <div className="text-sm text-gray-600">
                  Finding proteins and data
                </div>
              </a>
              <a
                href="#blast"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-blue-600">4. BLAST Search</div>
                <div className="text-sm text-gray-600">
                  Sequence similarity analysis
                </div>
              </a>
              <a
                href="#protein-details"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-blue-600">
                  5. Protein Information
                </div>
                <div className="text-sm text-gray-600">
                  Detailed protein data
                </div>
              </a>
              <a
                href="#data-export"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-blue-600">6. Data Export</div>
                <div className="text-sm text-gray-600">
                  Download and integration
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Database Overview */}
        <section id="overview" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            1. Database Overview
          </h2>

          <div className="space-y-8">
            {/* What is HSNDB */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-6 w-6 text-blue-600" />
                  What is HSNDB?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  The Human S-nitrosylation Database (HSNDB) is the most
                  comprehensive resource for studying S-nitrosylated proteins in
                  humans. S-nitrosylation is a reversible post-translational
                  modification where nitric oxide (NO) covalently binds to
                  cysteine residues, forming S-nitrosothiol groups that regulate
                  cellular signaling pathways.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Dna className="h-5 w-5 text-blue-600" />
                      Scientific Significance
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>
                        • Critical regulatory mechanism in cellular signaling
                      </li>
                      <li>
                        • Reversible modification affecting protein function
                      </li>
                      <li>• Key role in nitric oxide signaling pathways</li>
                      <li>• Important for protein-protein interactions</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      Clinical Relevance
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Cardiovascular diseases</li>
                      <li>• Neurodegenerative disorders</li>
                      <li>• Cancer development and progression</li>
                      <li>• Metabolic diseases</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Database Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      18,721
                    </div>
                    <div className="text-sm text-gray-600">Total Proteins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      ~53,000
                    </div>
                    <div className="text-sm text-gray-600">
                      S-nitrosylation Sites
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      ~10,000
                    </div>
                    <div className="text-sm text-gray-600">
                      Cancer-Associated
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      ~8,000
                    </div>
                    <div className="text-sm text-gray-600">
                      Disordered Proteins
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Database Types */}
        <section id="databases" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-purple-600" />
            2. Database Types
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Experimental Database */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  Experimental Database
                  <Badge className="bg-blue-500 text-white">
                    High Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <p className="text-gray-700">
                  Contains experimentally validated S-nitrosylation sites from
                  peer-reviewed literature with high-confidence experimental
                  evidence.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Key Features:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Laboratory-validated S-nitrosylation sites</li>
                    <li>• Detailed experimental conditions</li>
                    <li>• Cancer association data</li>
                    <li>• Tissue-specific information</li>
                    <li>• Cross-referenced with major databases</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        4,533
                      </div>
                      <div className="text-xs text-gray-600">Proteins</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        11,466
                      </div>
                      <div className="text-xs text-gray-600">Sites</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motif-Based Database */}
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Motif-Based Database
                  <Badge className="bg-purple-500 text-white">
                    Computational
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <p className="text-gray-700">
                  Computationally predicted S-nitrosylation sites using the
                  [I/L]-X-C-X₂-[D/E] motif pattern analysis across the human
                  proteome.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Key Features:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Motif pattern-based predictions</li>
                    <li>• Proteome-wide coverage</li>
                    <li>• Computational validation methods</li>
                    <li>• Cross-referenced with experimental data</li>
                    <li>• Novel target identification</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        14,188
                      </div>
                      <div className="text-xs text-gray-600">Proteins</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ~42,000
                      </div>
                      <div className="text-xs text-gray-600">
                        Predicted Sites
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Motif Pattern Explanation */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-6 w-6 text-green-600" />
                Understanding the [I/L]-X-C-X₂-[D/E] Motif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                This motif represents a specific pattern in protein sequences
                associated with potential S-nitrosylation sites:
              </p>

              <div className="grid grid-cols-5 gap-4 text-center my-6">
                <div className="flex flex-col">
                  <div className="bg-blue-100 rounded-t-lg p-2 font-medium">
                    Position 1
                  </div>
                  <div className="bg-blue-50 p-4 rounded-b-lg font-mono">
                    [I/L]
                  </div>
                  <div className="text-sm mt-1 text-gray-600">
                    Isoleucine or Leucine
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="bg-gray-100 rounded-t-lg p-2 font-medium">
                    Position 2
                  </div>
                  <div className="bg-gray-50 p-4 rounded-b-lg font-mono">X</div>
                  <div className="text-sm mt-1 text-gray-600">
                    Any amino acid
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="bg-red-100 rounded-t-lg p-2 font-medium">
                    Position 3
                  </div>
                  <div className="bg-red-50 p-4 rounded-b-lg font-mono">C</div>
                  <div className="text-sm mt-1 text-gray-600">
                    Cysteine (S-nitrosylation site)
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="bg-gray-100 rounded-t-lg p-2 font-medium">
                    Position 4-5
                  </div>
                  <div className="bg-gray-50 p-4 rounded-b-lg font-mono">
                    X₂
                  </div>
                  <div className="text-sm mt-1 text-gray-600">
                    Any two amino acids
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="bg-red-100 rounded-t-lg p-2 font-medium">
                    Position 6
                  </div>
                  <div className="bg-red-50 p-4 rounded-b-lg font-mono">
                    [D/E]
                  </div>
                  <div className="text-sm mt-1 text-gray-600">
                    Aspartic or Glutamic acid
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                The cysteine (C) at position 3 is the potential S-nitrosylation
                site, while the surrounding amino acids create a
                microenvironment that facilitates the reaction.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Search & Browse */}
        <section id="search" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Search className="h-8 w-8 text-green-600" />
            3. Search & Browse Features
          </h2>

          <div className="space-y-8">
            {/* Central Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-6 w-6 text-blue-600" />
                  Intelligent Search System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  HSNDB features an advanced search system with auto-complete
                  suggestions and multi-parameter filtering capabilities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Search Types:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Gene names (e.g., TP53, BRCA1)</li>
                      <li>• Protein names (e.g., Tumor protein p53)</li>
                      <li>• UniProt IDs (e.g., P04637)</li>
                      <li>• HSN IDs (e.g., HSN_001234)</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Advanced Filters:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Cancer association status</li>
                      <li>• Number of S-nitrosylation sites</li>
                      <li>• Cancer types (29 different types)</li>
                      <li>• Database source (experimental/motif)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browse Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-purple-600" />
                  Browse Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Comprehensive browsing interface with sortable tables and
                  detailed protein information.
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Table Columns:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge variant="outline">HSN ID</Badge> - Unique database
                      identifier
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Gene Name</Badge> - Official gene
                      symbol
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Protein Name</Badge> - Full
                      protein name
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">UniProt ID</Badge> - UniProt
                      accession number
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">AlphaFold ID</Badge> - 3D
                      structure identifier
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Total Sites</Badge> - Number of
                      S-nitrosylation sites
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Positions</Badge> - Site
                      locations in sequence
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Cancer Status</Badge> - Cancer
                      association
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* BLAST Search */}
        <section id="blast" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-600" />
            4. BLAST Search
          </h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-blue-600" />
                Sequence Similarity Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                Perform sequence similarity searches against the HSNDB database
                using the BLAST (Basic Local Alignment Search Tool) algorithm.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Supported Algorithms:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>
                      • <strong>BLASTP</strong> - Protein-protein sequence
                      comparison
                    </li>
                    <li>
                      • <strong>BLASTX</strong> - Translated nucleotide vs
                      protein
                    </li>
                    <li>
                      • <strong>TBLASTN</strong> - Protein vs translated
                      nucleotide
                    </li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 mt-6">
                    Input Formats:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Raw sequence (FASTA format)</li>
                    <li>• Multi-line sequences</li>
                    <li>• File upload support</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Customizable Parameters:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>
                      • <strong>E-value</strong> - Statistical significance
                      threshold
                    </li>
                    <li>
                      • <strong>Matrix</strong> - Scoring matrix (BLOSUM62,
                      PAM30, etc.)
                    </li>
                    <li>
                      • <strong>Word Size</strong> - Initial match length
                    </li>
                    <li>
                      • <strong>Gap Costs</strong> - Insertion/deletion
                      penalties
                    </li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 mt-6">
                    Results Include:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Sequence alignments</li>
                    <li>• Identity and similarity scores</li>
                    <li>• E-values and bit scores</li>
                    <li>• Direct links to protein details</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      BLAST Database Details
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      The BLAST database contains sequences from both
                      experimental and motif-based protein databases, providing
                      comprehensive coverage for similarity searches.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Protein Information */}
        <section id="protein-details" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Dna className="h-8 w-8 text-blue-600" />
            5. Protein Information
          </h2>

          <div className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Comprehensive Protein Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">
                  Each protein entry provides detailed information across
                  multiple categories:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Basic Information
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Gene name and protein name</li>
                      <li>• UniProt and AlphaFold IDs</li>
                      <li>• Protein length (amino acids)</li>
                      <li>• FASTA sequence</li>
                      <li>• Database source</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      S-nitrosylation Data
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Total number of sites</li>
                      <li>• Specific site positions</li>
                      <li>• Experimental validation status</li>
                      <li>• Functional impact assessment</li>
                      <li>• Modified residue details</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      Cancer Information
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• General cancer association</li>
                      <li>• Specific cancer types</li>
                      <li>• Cysteine cancer mutations</li>
                      <li>• Mutation-site correlations</li>
                      <li>• Clinical significance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 3D Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-6 w-6 text-purple-600" />
                    3D Structure Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Interactive 3D protein structure viewer powered by AlphaFold
                    data.
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Features:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Real-time 3D structure rendering</li>
                      <li>• S-nitrosylation site highlighting</li>
                      <li>• Multiple visualization styles</li>
                      <li>• Zoom, rotate, and pan controls</li>
                      <li>• High-resolution image export</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Disorder Prediction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                    Protein Disorder Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Intrinsic disorder predictions showing regions lacking
                    stable structure.
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Analysis Includes:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Disorder score per residue</li>
                      <li>• Overall disorder percentage</li>
                      <li>• Interactive disorder plots</li>
                      <li>• Site-disorder correlations</li>
                      <li>• Functional implications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* External Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-green-600" />
                  External Database Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  HSNDB integrates with major biological databases for
                  comprehensive protein information.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">UniProt</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Protein sequences, functions, and annotations
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900">AlphaFold</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      High-accuracy 3D protein structures
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">STRING</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Protein-protein interaction networks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Export */}
        <section id="data-export" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Download className="h-8 w-8 text-green-600" />
            6. Data Export & Integration
          </h2>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-6 w-6 text-blue-600" />
                  Export Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">
                  HSNDB supports multiple export formats for different research
                  applications:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Structured Data:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>
                        • <strong>CSV</strong> - Spreadsheet compatible
                      </li>
                      <li>
                        • <strong>JSON</strong> - API integration
                      </li>
                      <li>
                        • <strong>XML</strong> - Structured markup
                      </li>
                      <li>
                        • <strong>TSV</strong> - Tab-separated values
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Sequence Data:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>
                        • <strong>FASTA</strong> - Protein sequences
                      </li>
                      <li>
                        • <strong>Multi-FASTA</strong> - Bulk sequences
                      </li>
                      <li>
                        • <strong>Custom formats</strong> - Research-specific
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Research Applications:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900">
                        Bioinformatics
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Sequence analysis, motif discovery, pathway analysis
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900">
                        Statistical Analysis
                      </h5>
                      <p className="text-sm text-green-700 mt-1">
                        R/Python integration, correlation studies, meta-analysis
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-900">
                        Drug Discovery
                      </h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Target identification, therapeutic development
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-6 w-6 text-purple-600" />
                  Programmatic Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  For developers and researchers requiring programmatic access
                  to HSNDB data.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Coming Soon:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• RESTful API endpoints</li>
                    <li>• GraphQL interface</li>
                    <li>• Python/R client libraries</li>
                    <li>• Real-time data synchronization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact & Support */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Contact & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">
              Have questions or need assistance? We're here to help researchers
              make the most of HSNDB.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Research Support:
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Database usage guidance</li>
                  <li>• Data interpretation assistance</li>
                  <li>• Collaboration opportunities</li>
                  <li>• Training and workshops</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Technical Support:
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Bug reports and issues</li>
                  <li>• Feature requests</li>
                  <li>• API integration help</li>
                  <li>• Data export assistance</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                GitHub Repository
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contact Research Team
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Documentation;
