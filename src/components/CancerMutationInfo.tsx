import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useCancerMutations } from "@/hooks/useCancerMutations";

interface CancerMutationInfoProps {
  geneName: string | null;
  uniprotId: string | null;
  nitrosylationPositions?: string;
}

const CancerMutationInfo: React.FC<CancerMutationInfoProps> = ({
  geneName,
  uniprotId,
  nitrosylationPositions,
}) => {
  const {
    data: mutationData,
    isLoading,
    error,
  } = useCancerMutations(geneName || uniprotId);

  // Parse nitrosylation positions for comparison
  const nitrosylationPositionsList = nitrosylationPositions
    ? nitrosylationPositions.split(",").map((pos) => parseInt(pos.trim()))
    : [];

  // Check if a position is a nitrosylation site
  const isNitrosylationSite = (position: number): boolean => {
    return nitrosylationPositionsList.includes(position);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Error loading cancer mutation data</span>
      </div>
    );
  }

  if (!mutationData || mutationData.totalMutations === 0) {
    return (
      <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p className="text-sm">
          No cysteine-to-other amino acid mutations associated with cancer have
          been recorded for this protein in our database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Simple mutation list */}
      <div className="space-y-2">
        {mutationData.mutationsByPosition.map(({ position, mutations }) => (
          <div key={position} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs">
                Position {position}
              </Badge>
              {isNitrosylationSite(position) && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs"
                >
                  S-Nitrosylation Site
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              {mutations.map((mutation) => (
                <div
                  key={mutation.id}
                  className="flex items-center justify-between text-sm"
                >
                  <code className="bg-white px-2 py-1 rounded font-mono">
                    {mutation.reference_aa}
                    {mutation.position} → {mutation.altered_aa}
                  </code>
                  <Badge variant="outline" className="text-xs">
                    {mutation.cancer_type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CancerMutationInfo;
