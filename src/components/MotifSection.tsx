import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BetweenHorizontalStart } from "lucide-react";

const MotifSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="px-3 py-1 text-blue-700 border-blue-200 bg-blue-50"
            >
              NEW ADDITION
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Motif-Based Proteins Collection
              <Badge variant="outline" className="ml-3 font-normal text-sm">
                3,002 proteins
              </Badge>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Discover proteins containing the conserved{" "}
              <span className="font-mono bg-gray-100 text-gray-800 px-1 rounded">
                [I/L]-X-C-X₂-[D/E]
              </span>{" "}
              motif that are predicted to be S-nitrosylation targets.
            </p>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 mt-0.5">
                  <BetweenHorizontalStart className="h-4 w-4 text-green-600" />
                </div>
                <p>
                  <span className="font-medium text-gray-900">
                    Predictive Discovery:
                  </span>{" "}
                  Expand beyond experimentally validated proteins with 3,002
                  proteins computationally predicted to contain S-nitrosylation
                  sites.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 mt-0.5">
                  <BetweenHorizontalStart className="h-4 w-4 text-green-600" />
                </div>
                <p>
                  <span className="font-medium text-gray-900">
                    Conserved Sequence Patterns:
                  </span>{" "}
                  Proteins containing the characteristic{" "}
                  <span className="font-mono bg-gray-100 text-gray-800 px-1 rounded">
                    [I/L]-X-C-X₂-[D/E]
                  </span>{" "}
                  motif pattern associated with S-nitrosylation.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 mt-0.5">
                  <BetweenHorizontalStart className="h-4 w-4 text-green-600" />
                </div>
                <p>
                  <span className="font-medium text-gray-900">
                    Research Targets:
                  </span>{" "}
                  Identify new proteins for experimental validation and expand
                  understanding of S-nitrosylation networks.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={() => navigate("/browse?type=motif")} size="lg">
                Explore Motif Proteins
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">
              About the [I/L]-X-C-X₂-[D/E] Motif
            </h3>
            <div className="space-y-4">
              <p>
                This motif represents a specific pattern in protein sequences
                that's associated with potential S-nitrosylation sites:
              </p>
              <div className="grid grid-cols-5 gap-4 text-center my-8">
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
                  <div className="bg-amber-100 rounded-t-lg p-2 font-medium">
                    Position 3
                  </div>
                  <div className="bg-amber-50 p-4 rounded-b-lg font-mono">
                    C
                  </div>
                  <div className="text-sm mt-1 text-gray-600">Cysteine</div>
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
              <p>
                The cysteine (C) at position 3 is the potential S-nitrosylation
                site, while the surrounding amino acids create a
                microenvironment that may facilitate the reaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MotifSection;
