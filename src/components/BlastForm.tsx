import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Zap,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  BlastParameters,
  validateSequence,
  parseSequenceType,
  formatSequence,
} from "@/utils/blastApi";

interface BlastFormProps {
  onSubmit: (params: BlastParameters) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const BlastForm: React.FC<BlastFormProps> = ({
  onSubmit,
  isLoading,
  disabled = false,
}) => {
  const [sequence, setSequence] = useState("");
  const [algorithm, setAlgorithm] =
    useState<BlastParameters["algorithm"]>("blastp");
  const [evalue, setEvalue] = useState("10");
  const [matrix, setMatrix] = useState("BLOSUM62");
  const [wordSize, setWordSize] = useState("");
  const [maxTargetSeqs, setMaxTargetSeqs] = useState("500");
  const [gapOpen, setGapOpen] = useState("");
  const [gapExtend, setGapExtend] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sequence validation state
  const [validation, setValidation] = useState<{
    valid: boolean;
    message?: string;
  }>({ valid: true });
  const [sequenceType, setSequenceType] = useState<
    "protein" | "nucleotide" | "unknown"
  >("unknown");
  const [sequenceLength, setSequenceLength] = useState(0);

  // Example sequences
  const exampleSequences = {
    protein: {
      name: "Human GAPDH (partial)",
      sequence:
        "MVKVGVNGFGRIGRLVTRAAFNSGKVDIVAINDPFIDLNYMVYMFQYDSTHGKFHGTVKAENGKLVINGNPITIFQERDPSKIKWGDAGAEYVVESTGVFTTMEKAGAHLQGGAKRVIISAPSADAPMFVMGVNHEKYDNSLKIISNASCTTNCLAPLAKVIHDHFGIVEGLMTTVHAITATQKTVDGPSGKLWRDGRGALQNIIPASTGAAKAVGKVIPELNGKLTGMAFRVPTANVSVVDLTCRLEKPAKYDDIKKVVKQASEGPLKGILGYTEHQVVSSDFNSDTHSSTFDAGAGIALNDHFVKLISWYDNEFGYSNRVVDLMVHMASKE",
    },
    nucleotide: {
      name: "Human β-globin (partial)",
      sequence:
        "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGATCCTGAGAACTTCAGG",
    },
  };

  // Validate sequence on change
  useEffect(() => {
    if (sequence.trim()) {
      const cleanSeq = formatSequence(sequence);
      const validationResult = validateSequence(cleanSeq);
      const type = parseSequenceType(cleanSeq);

      setValidation(validationResult);
      setSequenceType(type);
      setSequenceLength(cleanSeq.length);

      // Auto-suggest algorithm based on sequence type
      if (type === "protein" && algorithm !== "blastp") {
        setAlgorithm("blastp");
      } else if (type === "nucleotide" && algorithm === "blastp") {
        setAlgorithm("blastn");
      }
    } else {
      setValidation({ valid: true });
      setSequenceType("unknown");
      setSequenceLength(0);
    }
  }, [sequence, algorithm]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSequence(content);
      };
      reader.readAsText(file);
    }
  };

  const handleExampleLoad = (example: typeof exampleSequences.protein) => {
    setSequence(`>${example.name}\n${example.sequence}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.valid) {
      return;
    }

    const params: BlastParameters = {
      sequence: formatSequence(sequence),
      algorithm,
      evalue: parseFloat(evalue),
      matrix,
      maxTargetSeqs: parseInt(maxTargetSeqs),
    };

    // Add optional parameters if provided
    if (wordSize) params.wordSize = parseInt(wordSize);
    if (gapOpen) params.gapOpen = parseInt(gapOpen);
    if (gapExtend) params.gapExtend = parseInt(gapExtend);

    onSubmit(params);
  };

  const handleClear = () => {
    setSequence("");
    setValidation({ valid: true });
    setSequenceType("unknown");
    setSequenceLength(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600" />
          BLAST Search Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sequence Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sequence" className="text-base font-medium">
                Query Sequence
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".fasta,.fa,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={disabled || !sequence}
                >
                  Clear
                </Button>
              </div>
            </div>

            <Textarea
              id="sequence"
              placeholder="Enter your protein or nucleotide sequence in FASTA format or as raw sequence..."
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              rows={8}
              className={`font-mono ${
                validation.valid ? "" : "border-red-500"
              }`}
              disabled={disabled}
            />

            {/* Sequence Info */}
            {sequence && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Badge
                  variant={sequenceType === "unknown" ? "secondary" : "default"}
                >
                  {sequenceType === "protein"
                    ? "Protein"
                    : sequenceType === "nucleotide"
                    ? "Nucleotide"
                    : "Unknown"}
                </Badge>
                <span>Length: {sequenceLength} characters</span>
                {validation.valid ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Valid
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    Invalid
                  </div>
                )}
              </div>
            )}

            {/* Validation Error */}
            {!validation.valid && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validation.message}</AlertDescription>
              </Alert>
            )}

            {/* Example Sequences */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Example Sequences:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleLoad(exampleSequences.protein)}
                  disabled={disabled}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Protein Example
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleLoad(exampleSequences.nucleotide)}
                  disabled={disabled}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Nucleotide Example
                </Button>
              </div>
            </div>
          </div>
          <Separator />
          {/* Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select
                value={algorithm}
                onValueChange={(value: BlastParameters["algorithm"]) =>
                  setAlgorithm(value)
                }
              >
                <SelectTrigger disabled={disabled}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blastp">
                    BLASTP (Protein-Protein)
                  </SelectItem>
                  <SelectItem value="blastn">
                    BLASTN (Nucleotide-Nucleotide)
                  </SelectItem>
                  <SelectItem value="blastx">
                    BLASTX (Translated Nucleotide-Protein)
                  </SelectItem>
                  <SelectItem value="tblastn">
                    TBLASTN (Protein-Translated Nucleotide)
                  </SelectItem>
                  <SelectItem value="tblastx">
                    TBLASTX (Translated Nucleotide-Translated Nucleotide)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evalue">E-value Threshold</Label>
              <Select value={evalue} onValueChange={setEvalue}>
                <SelectTrigger disabled={disabled}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1e-100">1e-100</SelectItem>
                  <SelectItem value="1e-50">1e-50</SelectItem>
                  <SelectItem value="1e-10">1e-10</SelectItem>
                  <SelectItem value="1e-5">1e-5</SelectItem>
                  <SelectItem value="1e-3">1e-3</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-targets">Max Target Sequences</Label>
              <Select value={maxTargetSeqs} onValueChange={setMaxTargetSeqs}>
                <SelectTrigger disabled={disabled}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Advanced Parameters */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
              disabled={disabled}
            >
              <Settings className="h-4 w-4" />
              {showAdvanced ? "Hide" : "Show"} Advanced Parameters
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="matrix">Scoring Matrix</Label>
                  <Select value={matrix} onValueChange={setMatrix}>
                    <SelectTrigger disabled={disabled}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BLOSUM62">BLOSUM62</SelectItem>
                      <SelectItem value="BLOSUM45">BLOSUM45</SelectItem>
                      <SelectItem value="BLOSUM80">BLOSUM80</SelectItem>
                      <SelectItem value="PAM30">PAM30</SelectItem>
                      <SelectItem value="PAM70">PAM70</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="word-size">Word Size</Label>
                  <Input
                    id="word-size"
                    type="number"
                    placeholder="Default"
                    value={wordSize}
                    onChange={(e) => setWordSize(e.target.value)}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gap-open">Gap Open Penalty</Label>
                  <Input
                    id="gap-open"
                    type="number"
                    placeholder="Default"
                    value={gapOpen}
                    onChange={(e) => setGapOpen(e.target.value)}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gap-extend">Gap Extend Penalty</Label>
                  <Input
                    id="gap-extend"
                    type="number"
                    placeholder="Default"
                    value={gapExtend}
                    onChange={(e) => setGapExtend(e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={!sequence || !validation.valid || isLoading || disabled}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running BLAST...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run BLAST Search
                </>
              )}
            </Button>
          </div>{" "}
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your sequence will be searched against the HSNDB database of{" "}
              {new Intl.NumberFormat().format(4533)} S-nitrosylated proteins.
              Search typically takes 5-30 seconds depending on sequence length
              and parameters.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlastForm;
