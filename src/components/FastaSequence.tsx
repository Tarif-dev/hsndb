
import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="mt-2">
        <div className="animate-pulse bg-muted h-6 w-48 rounded"></div>
      </div>
    );
  }

  if (!fastaData?.fasta) {
    return null;
  }

  // Extract sequence from FASTA format (remove header line)
  const fastaLines = fastaData.fasta.split('\n');
  const sequence = fastaLines.slice(1).join('').replace(/\s/g, '');
  const displaySequence = sequence.substring(0, 25);

  return (
    <div className="mt-2">
      <label className="text-sm font-medium text-muted-foreground">
        FASTA Sequence (first 25 AA)
      </label>
      <div className="flex items-center gap-2 mt-1">
        <code 
          className="text-sm font-mono bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 transition-colors flex-1"
          onClick={handleCopy}
          title="Click to copy full FASTA sequence"
        >
          {displaySequence}
          {sequence.length > 25 && "..."}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Click to copy full sequence ({sequence.length} amino acids)
      </p>
    </div>
  );
};

export default FastaSequence;
