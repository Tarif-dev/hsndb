import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  ExternalLink,
  Search,
  BarChart3,
  AlignLeft,
  Clock,
  Database,
  TrendingUp,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Copy,
  FileText,
} from "lucide-react";
import { BlastResult, BlastHit, BlastJobStatus } from "@/utils/blastApi";
import { useNavigate } from "react-router-dom";

interface BlastResultsProps {
  jobStatus: BlastJobStatus | null;
  results: BlastResult | null;
  onClearResults: () => void;
}

const BlastResults: React.FC<BlastResultsProps> = ({
  jobStatus,
  results,
  onClearResults,
}) => {
  const navigate = useNavigate();
  const [selectedHit, setSelectedHit] = useState<BlastHit | null>(null);
  const [sortField, setSortField] = useState<keyof BlastHit>("evalue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterText, setFilterText] = useState("");
  const [minIdentity, setMinIdentity] = useState("0");
  const [maxEvalue, setMaxEvalue] = useState("10");

  // Filter and sort hits
  const filteredHits = useMemo(() => {
    if (!results?.hits) return [];

    let filtered = results.hits.filter((hit) => {
      const matchesText =
        filterText === "" ||
        hit.geneName.toLowerCase().includes(filterText.toLowerCase()) ||
        hit.proteinName.toLowerCase().includes(filterText.toLowerCase()) ||
        hit.hsnId.toLowerCase().includes(filterText.toLowerCase()) ||
        hit.organism.toLowerCase().includes(filterText.toLowerCase());

      const matchesIdentity = hit.identity >= parseFloat(minIdentity);
      const matchesEvalue = hit.evalue <= parseFloat(maxEvalue);

      return matchesText && matchesIdentity && matchesEvalue;
    });

    // Sort hits
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "evalue") {
        // For e-value, lower is better (more significant)
        aVal = Math.log10(a.evalue);
        bVal = Math.log10(b.evalue);
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [
    results?.hits,
    filterText,
    minIdentity,
    maxEvalue,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: keyof BlastHit) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof BlastHit) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="h-4 w-4" />
    ) : (
      <SortDesc className="h-4 w-4" />
    );
  };

  const formatEvalue = (evalue: number): string => {
    if (evalue === 0) return "0";
    if (evalue < 1e-100) return "<1e-100";
    return evalue.toExponential(1);
  };

  const formatScore = (score: number): string => {
    return score.toFixed(1);
  };

  const getSignificanceColor = (evalue: number): string => {
    if (evalue < 1e-50) return "text-green-600 font-semibold";
    if (evalue < 1e-10) return "text-blue-600 font-medium";
    if (evalue < 1e-5) return "text-orange-600";
    return "text-gray-600";
  };
  const handleProteinClick = (proteinId: string) => {
    navigate(`/protein/${proteinId}`);
  };

  const handleCopySequence = (sequence: string) => {
    navigator.clipboard.writeText(sequence);
  };

  const exportResults = (format: "csv" | "tsv" | "json") => {
    if (!results) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case "csv":
        const csvHeaders = [
          "HSN_ID",
          "Gene_Name",
          "Protein_Name",
          "Organism",
          "E_value",
          "Score",
          "Identity_%",
          "Length",
        ];
        const csvData = filteredHits.map((hit) => [
          hit.hsnId,
          hit.geneName,
          hit.proteinName,
          hit.organism,
          hit.evalue,
          hit.score,
          hit.identity,
          hit.length,
        ]);
        content = [csvHeaders, ...csvData]
          .map((row) => row.join(","))
          .join("\n");
        filename = `blast_results_${Date.now()}.csv`;
        mimeType = "text/csv";
        break;

      case "tsv":
        const tsvHeaders = [
          "HSN_ID",
          "Gene_Name",
          "Protein_Name",
          "Organism",
          "E_value",
          "Score",
          "Identity_%",
          "Length",
        ];
        const tsvData = filteredHits.map((hit) => [
          hit.hsnId,
          hit.geneName,
          hit.proteinName,
          hit.organism,
          hit.evalue,
          hit.score,
          hit.identity,
          hit.length,
        ]);
        content = [tsvHeaders, ...tsvData]
          .map((row) => row.join("\t"))
          .join("\n");
        filename = `blast_results_${Date.now()}.tsv`;
        mimeType = "text/tab-separated-values";
        break;

      case "json":
        content = JSON.stringify(
          {
            search_info: {
              job_id: results.jobId,
              query_length: results.queryLength,
              database_size: results.databaseSize,
              total_hits: results.totalHits,
              execution_time: results.executionTime,
              statistics: results.statistics,
            },
            hits: filteredHits,
          },
          null,
          2
        );
        filename = `blast_results_${Date.now()}.json`;
        mimeType = "application/json";
        break;

      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Show progress for running jobs
  if (
    jobStatus &&
    (jobStatus.status === "pending" || jobStatus.status === "running")
  ) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
            BLAST Search in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <Progress value={jobStatus.progress} className="w-full h-3" />
            <div className="text-lg font-medium">
              {jobStatus.progress}% Complete
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Status: {jobStatus.status === "pending" ? "Queued" : "Running"}
            </Badge>
            {jobStatus.estimatedTimeRemaining && (
              <p className="text-sm text-gray-600">
                Estimated time remaining: {jobStatus.estimatedTimeRemaining}{" "}
                seconds
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error for failed jobs
  if (jobStatus?.status === "failed") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">BLAST Search Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {jobStatus.error ||
                "An unknown error occurred during the BLAST search."}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={onClearResults} variant="outline">
              Start New Search
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results
  if (!results) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      {/* Search Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-green-600" />
              BLAST Search Results
            </div>
            <div className="flex gap-2">
              <Button onClick={onClearResults} variant="outline" size="sm">
                New Search
              </Button>
              <Select
                onValueChange={(format: "csv" | "tsv" | "json") =>
                  exportResults(format)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="tsv">TSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.totalHits}
              </div>
              <div className="text-sm text-gray-600">Total Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.queryLength}
              </div>
              <div className="text-sm text-gray-600">Query Length</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat().format(results.databaseSize)}
              </div>
              <div className="text-sm text-gray-600">Database Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {results.executionTime}s
              </div>
              <div className="text-sm text-gray-600">Execution Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="hits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hits" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Hits ({filteredHits.length})
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="alignment" className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4" />
            Alignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hits" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filter & Sort Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-text">Search Text</Label>
                  <Input
                    id="filter-text"
                    placeholder="Gene name, protein name..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-identity">Min Identity (%)</Label>
                  <Input
                    id="min-identity"
                    type="number"
                    min="0"
                    max="100"
                    value={minIdentity}
                    onChange={(e) => setMinIdentity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-evalue">Max E-value</Label>
                  <Select value={maxEvalue} onValueChange={setMaxEvalue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1e-50">1e-50</SelectItem>
                      <SelectItem value="1e-10">1e-10</SelectItem>
                      <SelectItem value="1e-5">1e-5</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setFilterText("");
                        setMinIdentity("0");
                        setMaxEvalue("10");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("hsnId")}
                      >
                        <div className="flex items-center gap-2">
                          HSN ID
                          {getSortIcon("hsnId")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("geneName")}
                      >
                        <div className="flex items-center gap-2">
                          Gene
                          {getSortIcon("geneName")}
                        </div>
                      </TableHead>
                      <TableHead>Protein Name</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("organism")}
                      >
                        <div className="flex items-center gap-2">
                          Organism
                          {getSortIcon("organism")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("evalue")}
                      >
                        <div className="flex items-center gap-2">
                          E-value
                          {getSortIcon("evalue")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("score")}
                      >
                        <div className="flex items-center gap-2">
                          Score
                          {getSortIcon("score")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("identity")}
                      >
                        <div className="flex items-center gap-2">
                          Identity (%)
                          {getSortIcon("identity")}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHits.map((hit, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          {" "}
                          <Button
                            variant="link"
                            onClick={() => handleProteinClick(hit.id)}
                            className="p-0 h-auto font-mono text-blue-600 hover:text-blue-800"
                          >
                            {hit.hsnId}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {hit.geneName}
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={hit.proteinName}
                        >
                          {hit.proteinName}
                        </TableCell>
                        <TableCell className="italic">{hit.organism}</TableCell>
                        <TableCell className={getSignificanceColor(hit.evalue)}>
                          {formatEvalue(hit.evalue)}
                        </TableCell>
                        <TableCell>{formatScore(hit.score)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              hit.identity > 90
                                ? "default"
                                : hit.identity > 70
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {hit.identity.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedHit(hit)}
                              title="View alignment"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>{" "}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProteinClick(hit.id)}
                              title="View protein details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredHits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hits match your current filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Search Statistics
              </CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-6">
              {/* Database Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Database:</span>{" "}
                    {results.statistics.database || "HSNDB"}
                  </div>
                  <div>
                    <span className="font-medium">Total Sequences:</span>{" "}
                    {new Intl.NumberFormat().format(
                      results.statistics.totalSequences || 4533
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Version:</span>{" "}
                    {results.statistics.databaseVersion || "2024.1"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Karlin-Altschul Parameters</h4>
                  <div className="text-sm space-y-1">
                    <div>Kappa: {results.statistics.kappa}</div>
                    <div>Lambda: {results.statistics.lambda}</div>
                    <div>Entropy: {results.statistics.entropy}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Hit Distribution</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      Highly Significant (E &lt; 1e-50):{" "}
                      {filteredHits.filter((hit) => hit.evalue < 1e-50).length}
                    </div>
                    <div>
                      Significant (1e-50 ≤ E &lt; 1e-10):{" "}
                      {
                        filteredHits.filter(
                          (hit) => hit.evalue >= 1e-50 && hit.evalue < 1e-10
                        ).length
                      }
                    </div>
                    <div>
                      Moderate (1e-10 ≤ E &lt; 1e-5):{" "}
                      {
                        filteredHits.filter(
                          (hit) => hit.evalue >= 1e-10 && hit.evalue < 1e-5
                        ).length
                      }
                    </div>
                    <div>
                      Weak (E ≥ 1e-5):{" "}
                      {filteredHits.filter((hit) => hit.evalue >= 1e-5).length}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Identity Distribution</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      High Identity (&gt;90%):{" "}
                      {filteredHits.filter((hit) => hit.identity > 90).length}
                    </div>
                    <div>
                      Medium Identity (70-90%):{" "}
                      {
                        filteredHits.filter(
                          (hit) => hit.identity >= 70 && hit.identity <= 90
                        ).length
                      }
                    </div>
                    <div>
                      Low Identity (&lt;70%):{" "}
                      {filteredHits.filter((hit) => hit.identity < 70).length}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alignment" className="space-y-4">
          {selectedHit ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-6 w-6" />
                    Sequence Alignment: {selectedHit.hsnId}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopySequence(selectedHit.alignment)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Score:</span>{" "}
                      {selectedHit.score}
                    </div>
                    <div>
                      <span className="font-medium">E-value:</span>{" "}
                      {formatEvalue(selectedHit.evalue)}
                    </div>
                    <div>
                      <span className="font-medium">Identity:</span>{" "}
                      {selectedHit.identity.toFixed(1)}%
                    </div>
                    <div>
                      <span className="font-medium">Length:</span>{" "}
                      {selectedHit.length}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="space-y-2">
                      <div>
                        <span className="text-blue-600 font-medium">
                          Query {selectedHit.queryStart.toString().padStart(3)}
                        </span>
                        <span className="ml-2">{selectedHit.querySeq}</span>
                        <span className="ml-2">{selectedHit.queryEnd}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{"".padStart(10)}</span>
                        <span className="ml-2">{selectedHit.alignment}</span>
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">
                          Sbjct{" "}
                          {selectedHit.subjectStart.toString().padStart(3)}
                        </span>
                        <span className="ml-2">{selectedHit.subjectSeq}</span>
                        <span className="ml-2">{selectedHit.subjectEnd}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlignLeft className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Select a hit from the results table to view its alignment.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlastResults;
