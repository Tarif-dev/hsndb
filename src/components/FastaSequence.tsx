import React from "react";
import { Copy, Check, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFasta } from "@/hooks/useFasta";

interface FastaSequenceProps {
  hsnId: string;
}

const FastaSequence = ({ hsnId }: FastaSequenceProps) => {
  const { data: fastaData, isLoading } = useFasta(hsnId);
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (fastaData?.fasta) {
      navigator.clipboard.writeText(fastaData.fasta);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "FASTA sequence copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-3">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Dna className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">FASTA Sequence</span>
          </div>
          <div className="animate-pulse bg-muted h-3 w-full rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!fastaData?.fasta) {
    return null;
  }
  // Extract sequence from FASTA format (remove header line)
  const fastaLines = fastaData.fasta.split("\n");
  const headerLine = fastaLines[0] || "";
  const sequence = fastaLines.slice(1).join("").replace(/\s/g, "");
  const displaySequence = sequence.substring(0, 100);

  // Format sequence in groups of 10 for better readability
  const formatSequence = (seq: string) => {
    return seq.match(/.{1,10}/g)?.join(" ") || seq;
  };
  return (
    <Card className="mt-3 border-l-4 border-l-blue-500">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dna className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Amino acid sequence</span>
            <span className="text-xs text-muted-foreground">
              ({sequence.length} AA)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-600 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border">
          <code className="text-xs font-mono leading-relaxed block break-all">
            {formatSequence(displaySequence)}
            {sequence.length > 100 && (
              <span className="text-muted-foreground ml-1">
                ...+{sequence.length - 100}
              </span>
            )}
          </code>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>First 100 AA • Use Export menu for full FASTA</span>
          <span>HSN ID: {fastaData.hsn_id}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FastaSequence;
