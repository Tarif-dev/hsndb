import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Database,
  Clock,
} from "lucide-react";

interface SequenceAnalysis {
  length: number;
  type: "protein" | "nucleotide" | "unknown";
  composition: {
    [key: string]: number;
  };
  complexity: number;
  hasGaps: boolean;
  hasStops: boolean;
  gcContent?: number; // for nucleotides
}

interface SequenceValidatorProps {
  sequence: string;
  isValid: boolean;
  errorMessage?: string;
}

const SequenceValidator: React.FC<SequenceValidatorProps> = ({
  sequence,
  isValid,
  errorMessage,
}) => {
  const analyzeSequence = (seq: string): SequenceAnalysis => {
    const cleanSeq = seq.replace(/\s/g, "").replace(/>/g, "").toUpperCase();
    const composition: { [key: string]: number } = {};

    // Count amino acids/nucleotides
    for (const char of cleanSeq) {
      composition[char] = (composition[char] || 0) + 1;
    }

    // Determine sequence type
    const proteinChars = cleanSeq.match(/[DEFHIKLMPQRSVWY]/g);
    const nucleotideChars = cleanSeq.match(/[ACGTU]/g);

    let type: "protein" | "nucleotide" | "unknown" = "unknown";
    if (!proteinChars && nucleotideChars) {
      type = "nucleotide";
    } else if (proteinChars && proteinChars.length > cleanSeq.length * 0.1) {
      type = "protein";
    } else if (
      nucleotideChars &&
      nucleotideChars.length > cleanSeq.length * 0.8
    ) {
      type = "nucleotide";
    }

    // Calculate complexity (Shannon entropy)
    const totalChars = cleanSeq.length;
    let entropy = 0;
    for (const count of Object.values(composition)) {
      if (count > 0) {
        const p = count / totalChars;
        entropy -= p * Math.log2(p);
      }
    }

    // GC content for nucleotides
    let gcContent: number | undefined;
    if (type === "nucleotide") {
      const gcCount = (composition["G"] || 0) + (composition["C"] || 0);
      gcContent = (gcCount / totalChars) * 100;
    }

    return {
      length: cleanSeq.length,
      type,
      composition,
      complexity: entropy,
      hasGaps: cleanSeq.includes("-"),
      hasStops: cleanSeq.includes("*"),
      gcContent,
    };
  };

  if (!sequence.trim()) {
    return null;
  }

  const analysis = analyzeSequence(sequence);

  const getComplexityColor = (complexity: number): string => {
    if (complexity < 1.5) return "text-red-600";
    if (complexity < 2.5) return "text-orange-600";
    if (complexity < 3.5) return "text-yellow-600";
    return "text-green-600";
  };

  const getComplexityLabel = (complexity: number): string => {
    if (complexity < 1.5) return "Very Low";
    if (complexity < 2.5) return "Low";
    if (complexity < 3.5) return "Medium";
    return "High";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Sequence Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Status */}
        <div className="flex items-center gap-2">
          {isValid ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">Valid Sequence</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-600 font-medium">Invalid Sequence</span>
            </>
          )}
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analysis.length}
            </div>
            <div className="text-sm text-gray-600">Length</div>
          </div>

          <div className="text-center">
            <Badge
              variant={analysis.type === "unknown" ? "secondary" : "default"}
              className="text-sm"
            >
              {analysis.type === "protein"
                ? "Protein"
                : analysis.type === "nucleotide"
                ? "Nucleotide"
                : "Unknown"}
            </Badge>
            <div className="text-sm text-gray-600 mt-1">Type</div>
          </div>

          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getComplexityColor(
                analysis.complexity
              )}`}
            >
              {analysis.complexity.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              {getComplexityLabel(analysis.complexity)} Complexity
            </div>
          </div>

          {analysis.gcContent !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analysis.gcContent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">GC Content</div>
            </div>
          )}
        </div>

        {/* Composition */}
        <div>
          <h4 className="font-medium mb-2">Composition</h4>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 text-sm">
            {Object.entries(analysis.composition)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 12)
              .map(([char, count]) => (
                <div key={char} className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-mono font-bold">{char}</div>
                  <div className="text-xs text-gray-600">
                    {((count / analysis.length) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quality Indicators */}
        <div className="space-y-2">
          <h4 className="font-medium">Quality Indicators</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sequence Complexity</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={Math.min((analysis.complexity / 4) * 100, 100)}
                  className="w-20"
                />
                <span
                  className={`text-sm ${getComplexityColor(
                    analysis.complexity
                  )}`}
                >
                  {getComplexityLabel(analysis.complexity)}
                </span>
              </div>
            </div>

            {analysis.type === "protein" && (
              <div className="flex items-center justify-between">
                <span className="text-sm">BLAST Suitability</span>
                <Badge
                  variant={analysis.length >= 30 ? "default" : "secondary"}
                >
                  {analysis.length >= 30
                    ? "Excellent"
                    : analysis.length >= 20
                    ? "Good"
                    : "Poor"}
                </Badge>
              </div>
            )}

            {analysis.hasGaps && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Sequence contains gaps (-). These will be handled
                  appropriately by BLAST.
                </AlertDescription>
              </Alert>
            )}

            {analysis.hasStops && analysis.type === "protein" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Sequence contains stop codons (*). Make sure this is
                  intentional.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Search Recommendations */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Search Recommendations
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            {analysis.type === "protein" && (
              <div>• Use BLASTP for protein-protein comparison</div>
            )}
            {analysis.type === "nucleotide" && (
              <div>• Use BLASTN for nucleotide-nucleotide comparison</div>
            )}
            {analysis.length < 30 && (
              <div>• Consider using a lower word size for short sequences</div>
            )}
            {analysis.complexity < 2.0 && (
              <div>
                • Low complexity sequence may produce many non-specific hits
              </div>
            )}
            <div className="flex items-center gap-1 mt-2">
              <Clock className="h-3 w-3" />
              <span>
                Estimated search time:{" "}
                {analysis.length < 100
                  ? "5-10"
                  : analysis.length < 500
                  ? "10-20"
                  : "20-30"}{" "}
                seconds
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenceValidator;
