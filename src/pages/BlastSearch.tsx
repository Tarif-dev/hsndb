import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  Database,
  Search,
  TrendingUp,
  Clock,
  Shield,
  Info,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BlastForm from "@/components/BlastForm";
import BlastResults from "@/components/BlastResults";
import { useBlastSearch } from "@/hooks/useBlastSearch";

const BlastSearch = () => {
  const {
    submitBlastSearch,
    clearResults,
    isLoading,
    jobStatus,
    results,
    error,
    isCompleted,
  } = useBlastSearch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">BLAST Search</h1>
          </div>{" "}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Perform sequence similarity searches against the HSNDB database of
            S-nitrosylated proteins using the BLAST (Basic Local Alignment
            Search Tool) algorithm.
          </p>
        </div>

        {/* Key Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Database className="h-12 w-12 mx-auto text-blue-600 mb-3" />{" "}
              <h3 className="font-semibold mb-2">HSNDB Database</h3>
              <p className="text-sm text-gray-600">
                4,533 S-nitrosylated proteins
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">High Accuracy</h3>
              <p className="text-sm text-gray-600">
                Advanced algorithms & scoring
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 mx-auto text-orange-600 mb-3" />
              <h3 className="font-semibold mb-2">Fast Results</h3>
              <p className="text-sm text-gray-600">Results in 5-30 seconds</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 mx-auto text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">Reliable & Secure</h3>
              <p className="text-sm text-gray-600">Validated and protected</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              How to Use BLAST Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                  >
                    1
                  </Badge>
                  <h4 className="font-medium">Input Sequence</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Paste your protein or nucleotide sequence in the text area.
                  FASTA format is supported but not required.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                  >
                    2
                  </Badge>
                  <h4 className="font-medium">Set Parameters</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Choose the appropriate BLAST algorithm and adjust parameters
                  like E-value threshold for your specific needs.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                  >
                    3
                  </Badge>
                  <h4 className="font-medium">Analyze Results</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Review the tabular results, view alignments, and export data.
                  Click on HSN IDs to view detailed protein information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLAST Algorithms Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              Supported BLAST Algorithms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-600 mb-2">BLASTP</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Protein query sequence against protein database. Best for
                  comparing protein sequences.
                </p>

                <h4 className="font-medium text-green-600 mb-2">BLASTN</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Nucleotide query sequence against nucleotide database. For
                  DNA/RNA sequence comparison.
                </p>

                <h4 className="font-medium text-purple-600 mb-2">BLASTX</h4>
                <p className="text-sm text-gray-600">
                  Translated nucleotide query against protein database. Useful
                  for finding protein-coding regions.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-orange-600 mb-2">TBLASTN</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Protein query against translated nucleotide database. For
                  finding genes encoding similar proteins.
                </p>

                <h4 className="font-medium text-red-600 mb-2">TBLASTX</h4>
                <p className="text-sm text-gray-600">
                  Translated nucleotide query against translated nucleotide
                  database. Most sensitive but slowest.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main BLAST Interface */}
        <div className="space-y-8">
          {/* BLAST Form */}
          <BlastForm
            onSubmit={submitBlastSearch}
            isLoading={isLoading}
            disabled={isLoading}
          />{" "}
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Error:</strong>{" "}
                {typeof error === "string"
                  ? error
                  : error.message || "An unexpected error occurred."}
              </AlertDescription>
            </Alert>
          )}
          {/* Results Display */}
          {(jobStatus || results) && (
            <BlastResults
              jobStatus={jobStatus}
              results={results}
              onClearResults={clearResults}
            />
          )}
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6 text-blue-600" />
              Tips for Better Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Sequence Quality</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • Use sequences of at least 20 amino acids for proteins
                  </li>
                  <li>• Remove low-complexity regions if needed</li>
                  <li>• Ensure sequences contain only valid characters</li>
                  <li>• FASTA headers are optional but recommended</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Parameter Selection</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Lower E-values (1e-10) for more stringent searches</li>
                  <li>• Higher E-values (10, 100) for distant homologs</li>
                  <li>• Use BLASTP for most protein comparisons</li>
                  <li>• Adjust word size for sensitivity vs. speed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default BlastSearch;
