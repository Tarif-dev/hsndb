import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Database } from "lucide-react";
import { useScopData, useCathData } from "@/hooks/useStructuralClassification";

interface StructuralClassificationProps {
  uniprotId: string;
}

const ScopCard: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Database className="h-16 w-16 mx-auto mb-4 opacity-40" />
        <p className="text-sm font-medium">
          No SCOP classification data available
        </p>
        <p className="text-xs mt-2 text-muted-foreground/80">
          This protein may not be classified in the SCOP database
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((entry, index) => (
        <div
          key={index}
          className="p-6 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Database className="h-3 w-3 mr-1" />
                SCOP Entry {index + 1}
              </Badge>
            </div>
          </div>

          {/* Main Classification Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Structural Class
              </label>
              <p className="text-sm font-medium leading-relaxed">
                {entry.class_name || "Not classified"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Protein Type
              </label>
              <p className="text-sm leading-relaxed">
                {entry.protein_type_name || "Not specified"}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2 xl:col-span-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fold
              </label>
              <p className="text-sm font-medium leading-relaxed">
                {entry.fold_name || "Not specified"}
              </p>
            </div>
          </div>

          {/* Hierarchical Classification */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Superfamily */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Superfamily
                </label>
              </div>
              <p className="text-sm font-medium">
                {entry.superfamily_name || "Not classified"}
              </p>
              {entry.superfamily_pdb && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    PDB: {entry.superfamily_pdb}
                  </Badge>
                  {entry.superfamily_pdb_region && (
                    <Badge variant="outline" className="text-xs">
                      Region: {entry.superfamily_pdb_region}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Family */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-700 rounded-full"></div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Family
                </label>
              </div>
              <p className="text-sm font-medium">
                {entry.family_name || "Not classified"}
              </p>
              {entry.family_pdb && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    PDB: {entry.family_pdb}
                  </Badge>
                  {entry.family_pdb_region && (
                    <Badge variant="outline" className="text-xs">
                      Region: {entry.family_pdb_region}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {index < data.length - 1 && <Separator className="mt-6" />}
        </div>
      ))}
    </div>
  );
};

const CathCard: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Database className="h-16 w-16 mx-auto mb-4 opacity-40" />
        <p className="text-sm font-medium">
          No CATH classification data available
        </p>
        <p className="text-xs mt-2 text-muted-foreground/80">
          This protein may not be classified in the CATH database
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((entry, index) => (
        <div
          key={index}
          className="p-6 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Database className="h-3 w-3 mr-1" />
                CATH Entry {index + 1}
              </Badge>
              {entry.source && (
                <Badge variant="outline" className="text-xs">
                  {entry.source}
                </Badge>
              )}
            </div>
          </div>

          {/* Basic Domain Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Domain Region
              </label>
              <p className="text-sm font-mono font-medium">
                {entry.region || "Not specified"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Length
              </label>
              <p className="text-sm">
                {entry.length ? `${entry.length} amino acids` : "Not specified"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                CATH Code
              </label>
              <p className="text-sm font-mono font-bold">
                {entry.CATH_Code || "Not assigned"}
              </p>
            </div>
          </div>

          {/* Classification and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Assignment Method
              </label>
              <Badge variant="secondary" className="text-xs">
                {entry.assignment || "Not specified"}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Organism
              </label>
              <p className="text-sm italic">
                {entry.organism || "Not specified"}
              </p>
            </div>
          </div>

          {/* CATH Hierarchy */}
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              CATH Hierarchical Classification
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Class
                  </label>
                </div>
                <p className="text-sm font-medium">
                  {entry.CATH_Class || "Not classified"}
                </p>
              </div>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Architecture
                  </label>
                </div>
                <p className="text-sm font-medium">
                  {entry.CATH_Architecture || "Not classified"}
                </p>
              </div>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-700 rounded-full"></div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Topology
                  </label>
                </div>
                <p className="text-sm font-medium">
                  {entry.CATH_Topology || "Not classified"}
                </p>
              </div>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-800 rounded-full"></div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Superfamily
                  </label>
                </div>
                <p className="text-sm font-medium">
                  {entry.CATH_Superfamily || "Not classified"}
                </p>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          {(entry.pLDDT || entry.SSEs || entry.perc_not_in_SS) && (
            <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-semibold text-foreground">
                Structural Quality Metrics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {entry.pLDDT && (
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      pLDDT Confidence Score
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          parseFloat(entry.pLDDT) > 80
                            ? "default"
                            : parseFloat(entry.pLDDT) > 60
                            ? "secondary"
                            : "destructive"
                        }
                        className={`text-xs font-medium ${
                          parseFloat(entry.pLDDT) > 80
                            ? "bg-green-600 hover:bg-green-700"
                            : parseFloat(entry.pLDDT) > 60
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {entry.pLDDT}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {parseFloat(entry.pLDDT) > 80
                          ? "High"
                          : parseFloat(entry.pLDDT) > 60
                          ? "Medium"
                          : "Low"}
                      </span>
                    </div>
                  </div>
                )}
                {entry.SSEs && (
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Secondary Structure Elements
                    </label>
                    <p className="text-sm font-medium">{entry.SSEs}</p>
                  </div>
                )}
                {entry.perc_not_in_SS && (
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Disorder Percentage
                    </label>
                    <p className="text-sm font-medium">
                      {entry.perc_not_in_SS.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Properties */}
          {(entry.LUR || entry.packing) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {entry.LUR && (
                <Badge
                  variant="outline"
                  className="text-xs border-emerald-300 text-emerald-700"
                >
                  Low-Uncertainty Region
                </Badge>
              )}
              {entry.packing && (
                <Badge variant="outline" className="text-xs">
                  Packing: {entry.packing}
                </Badge>
              )}
            </div>
          )}

          {index < data.length - 1 && <Separator className="mt-6" />}
        </div>
      ))}
    </div>
  );
};

const StructuralClassification: React.FC<StructuralClassificationProps> = ({
  uniprotId,
}) => {
  const { data: scopData, isLoading: scopLoading } = useScopData(uniprotId);
  const { data: cathData, isLoading: cathLoading } = useCathData(uniprotId);

  const isLoading = scopLoading || cathLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              SCOP Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">
                Loading SCOP classification data...
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              CATH Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">
                Loading CATH classification data...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SCOP Classification */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            SCOP Classification
            <a
              href="https://scop.mrc-lmb.cam.ac.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
              title="Visit SCOP database"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Structural Classification of Proteins - hierarchical classification
            based on protein fold
          </p>
        </CardHeader>
        <CardContent>
          <ScopCard data={scopData || []} />
        </CardContent>
      </Card>

      {/* CATH Classification */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            CATH Classification
            <a
              href="https://www.cathdb.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
              title="Visit CATH database"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Class, Architecture, Topology, Homology - domain-based structural
            classification
          </p>
        </CardHeader>
        <CardContent>
          <CathCard data={cathData || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default StructuralClassification;
