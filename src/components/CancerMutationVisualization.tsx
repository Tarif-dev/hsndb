import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CancerMutationSummary } from "@/hooks/useCancerMutations";

interface CancerMutationVisualizationProps {
  mutationData: CancerMutationSummary;
  proteinLength?: number | null;
}

const CancerMutationVisualization: React.FC<
  CancerMutationVisualizationProps
> = ({ mutationData, proteinLength }) => {
  // Calculate mutation density
  const mutationDensity = proteinLength
    ? (mutationData.totalMutations / proteinLength) * 100
    : 0;

  // Get the most frequent cancer type
  const topCancerType = mutationData.mutationsByCancerType[0];

  // Calculate position distribution
  const positionRanges = proteinLength
    ? [
        {
          range: "1-25%",
          positions: mutationData.mutationsByPosition.filter(
            (m) => m.position <= proteinLength * 0.25
          ),
        },
        {
          range: "26-50%",
          positions: mutationData.mutationsByPosition.filter(
            (m) =>
              m.position > proteinLength * 0.25 &&
              m.position <= proteinLength * 0.5
          ),
        },
        {
          range: "51-75%",
          positions: mutationData.mutationsByPosition.filter(
            (m) =>
              m.position > proteinLength * 0.5 &&
              m.position <= proteinLength * 0.75
          ),
        },
        {
          range: "76-100%",
          positions: mutationData.mutationsByPosition.filter(
            (m) => m.position > proteinLength * 0.75
          ),
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      {/* Quick Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-600">
            Mutation Density
          </div>
          <div className="text-lg font-bold text-blue-900">
            {mutationDensity.toFixed(2)}%
          </div>
          <div className="text-xs text-blue-600">per protein length</div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="text-xs font-medium text-purple-600">
            Most Affected
          </div>
          <div className="text-sm font-bold text-purple-900">
            {topCancerType?.cancerType || "N/A"}
          </div>
          <div className="text-xs text-purple-600">
            {topCancerType?.count || 0} mutations
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="text-xs font-medium text-green-600">
            Unique Positions
          </div>
          <div className="text-lg font-bold text-green-900">
            {mutationData.mutationsByPosition.length}
          </div>
          <div className="text-xs text-green-600">cysteine sites</div>
        </div>

        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <div className="text-xs font-medium text-orange-600">
            Cancer Diversity
          </div>
          <div className="text-lg font-bold text-orange-900">
            {mutationData.uniqueCancerTypes.length}
          </div>
          <div className="text-xs text-orange-600">cancer types</div>
        </div>
      </div>

      {/* Cancer Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cancer Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mutationData.mutationsByCancerType
              .slice(0, 5)
              .map(({ cancerType, count }) => {
                const percentage = (count / mutationData.totalMutations) * 100;
                return (
                  <div key={cancerType} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{cancerType}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count} ({percentage.toFixed(1)}%)
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            {mutationData.mutationsByCancerType.length > 5 && (
              <div className="text-xs text-gray-500 pt-2">
                ... and {mutationData.mutationsByCancerType.length - 5} more
                cancer types
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Position Distribution (if protein length is available) */}
      {proteinLength && positionRanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Mutation Position Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positionRanges.map(({ range, positions }) => {
                const percentage =
                  positions.length > 0
                    ? (positions.length /
                        mutationData.mutationsByPosition.length) *
                      100
                    : 0;
                return (
                  <div key={range} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Protein Region {range}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {positions.length} positions
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <strong>Note:</strong> Distribution shows where cysteine mutations
              cluster within the protein sequence. Higher concentrations may
              indicate functionally important regions.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mutation Hotspots */}
      {mutationData.mutationsByPosition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Mutation Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mutationData.mutationsByPosition
                .sort((a, b) => b.mutations.length - a.mutations.length)
                .slice(0, 5)
                .map(({ position, mutations }) => (
                  <div
                    key={position}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        C{position}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {mutations.length} mutation
                        {mutations.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[...new Set(mutations.map((m) => m.cancer_type))]
                        .slice(0, 3)
                        .map((cancerType, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {cancerType}
                          </Badge>
                        ))}
                      {[...new Set(mutations.map((m) => m.cancer_type))]
                        .length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +
                          {[...new Set(mutations.map((m) => m.cancer_type))]
                            .length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CancerMutationVisualization;
