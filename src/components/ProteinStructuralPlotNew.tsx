import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Info, RotateCcw } from "lucide-react";
import { ProteinVisualizationData } from "@/hooks/useProteinVisualizationDataNew";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NitrosylationSite {
  position: number;
}

interface SecondaryStructure {
  start: number;
  end: number;
  type: "alpha-helix" | "beta-strand" | "coil";
}

interface ProteinStructuralPlotProps {
  data: ProteinVisualizationData;
  height?: number;
  className?: string;
}

interface TooltipData {
  position: number;
  x: number;
  y: number;
  info: {
    residue?: string;
    disorder_score?: number;
    accessibility?: number;
    structure_type?: string;
    modifications?: string[];
    is_nitrosylation?: boolean;
    is_cysteine?: boolean;
  };
}

const ProteinStructuralPlot: React.FC<ProteinStructuralPlotProps> = ({
  data,
  height = 600,
  className = "",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [selectedRegion, setSelectedRegion] = useState<[number, number] | null>(
    null
  );
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  // Layout constants - improved spacing and margins
  const margin = { top: 60, right: 80, bottom: 100, left: 120 };
  const width = containerWidth;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Track heights - better proportions
  const trackHeight = 50;
  const plotHeight = 100;
  const trackSpacing = 20;

  // Y positions for each track - better spacing
  const tracks = {
    nitrosylation: 0,
    secondary: trackHeight + trackSpacing,
    disorder: 2 * (trackHeight + trackSpacing),
    accessibility: 2 * (trackHeight + trackSpacing) + plotHeight + trackSpacing,
  };

  // Color schemes
  const nitrosylationColor = "#9CA3AF"; // Gray for S-nitrosylation
  const cysteineColor = "#F59E0B"; // Orange for cysteine positions

  const structureColors = {
    "alpha-helix": "#EF4444", // Red
    "beta-strand": "#10B981", // Green
    coil: "#9CA3AF", // Gray
  };

  // Helper functions to process data
  const getDisorderArray = (): number[] => {
    const array: number[] = [];
    for (let i = 1; i <= data.length; i++) {
      array.push(data.disorder_scores[i.toString()] || 0);
    }
    return array;
  };

  const getSASAArray = (): number[] => {
    const array: number[] = [];
    for (let i = 1; i <= data.length; i++) {
      array.push(data.sasa_values[i.toString()] || 0);
    }
    return array;
  };

  // Parse secondary structure (handles multiple common formats)
  const parseSecondaryStructure = (): SecondaryStructure[] => {
    if (!data.secondary_structure) return [];

    const ssString = data.secondary_structure.trim();
    const structures: SecondaryStructure[] = [];

    // Method 1: Try to parse as single character per residue (e.g., "CCCCHHHHHHCCCCEEEECCC")
    if (ssString.length === data.length) {
      let currentType: "alpha-helix" | "beta-strand" | "coil" | null = null;
      let currentStart = 1;

      for (let i = 0; i < ssString.length; i++) {
        const char = ssString[i];
        let type: "alpha-helix" | "beta-strand" | "coil";

        // Common secondary structure notation
        if (char === "H" || char === "h") {
          type = "alpha-helix";
        } else if (
          char === "E" ||
          char === "e" ||
          char === "B" ||
          char === "b"
        ) {
          type = "beta-strand";
        } else {
          type = "coil"; // C, c, -, T, S, or any other character
        }

        if (currentType !== type) {
          // End previous segment
          if (currentType !== null && i > 0) {
            structures.push({
              start: currentStart,
              end: i,
              type: currentType,
            });
          }
          // Start new segment
          currentType = type;
          currentStart = i + 1;
        }
      }

      // Add final segment
      if (currentType !== null) {
        structures.push({
          start: currentStart,
          end: ssString.length,
          type: currentType,
        });
      }

      return structures;
    }

    // Method 2: Try to parse as JSON format
    try {
      const parsed = JSON.parse(ssString);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item.start &&
            item.end &&
            item.type &&
            ["alpha-helix", "beta-strand", "coil"].includes(item.type)
        );
      }
    } catch (e) {
      // Not JSON format
    }

    // Method 3: Try to parse as DSSP format or other structured text
    const lines = ssString.split("\n");
    for (const line of lines) {
      // Look for patterns like "H 10-25" or "HELIX 10 25"
      const helixMatch = line.match(/(?:H|HELIX|helix)\s+(\d+)[-\s]+(\d+)/i);
      if (helixMatch) {
        structures.push({
          start: parseInt(helixMatch[1]),
          end: parseInt(helixMatch[2]),
          type: "alpha-helix",
        });
        continue;
      }

      const strandMatch = line.match(
        /(?:E|STRAND|strand|SHEET|sheet)\s+(\d+)[-\s]+(\d+)/i
      );
      if (strandMatch) {
        structures.push({
          start: parseInt(strandMatch[1]),
          end: parseInt(strandMatch[2]),
          type: "beta-strand",
        });
        continue;
      }
    }

    console.log(
      "Secondary structure format not recognized:",
      ssString.substring(0, 100)
    );
    return [];
  };

  // Resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Export functions
  const exportPNG = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${data.uniprot_id}_structural_plot.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgString);
  };

  const exportCSV = () => {
    const disorderArray = getDisorderArray();
    const sasaArray = getSASAArray();

    const header = [
      "position",
      "residue",
      "disorder_score",
      "sasa_value",
      "is_cysteine",
      "is_nitrosylation",
    ];

    const csvData = [];
    for (let i = 1; i <= data.length; i++) {
      const residue = data.sequence ? data.sequence[i - 1] : "";
      const disorderScore = disorderArray[i - 1] || 0;
      const sasaValue = sasaArray[i - 1] || 0;
      const isCysteine = data.cysteine_positions.includes(i);
      const isNitrosylation = data.positions_of_nitrosylation.includes(i);

      csvData.push(
        [
          i,
          residue,
          disorderScore,
          sasaValue,
          isCysteine,
          isNitrosylation,
        ].join(",")
      );
    }

    const csvContent = [header.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${data.uniprot_id}_structural_data.csv`;
    downloadLink.click();

    URL.revokeObjectURL(url);
  };

  const resetZoom = () => {
    setSelectedRegion(null);
  };

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || !data.sequence) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(selectedRegion || [1, data.length])
      .range([0, innerWidth]);

    const disorderArray = getDisorderArray();
    const sasaArray = getSASAArray();

    // Normalize SASA values (divide by max to get 0-1 range)
    const maxSasa = Math.max(...sasaArray.filter((v) => v > 0));
    const normalizedSasa = sasaArray.map((v) => v / maxSasa);

    const disorderScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([plotHeight, 0]);

    const accessibilityScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([plotHeight, 0]);

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Function to get visible data based on selected region
    const getVisibleRange = () => {
      if (!selectedRegion) return { start: 1, end: data.length };
      return { start: selectedRegion[0], end: selectedRegion[1] };
    };

    const visibleRange = getVisibleRange();

    // 1. NITROSYLATION/CYSTEINE TRACK
    const nitrosylationGroup = g
      .append("g")
      .attr("transform", `translate(0, ${tracks.nitrosylation})`);

    // Background for nitrosylation track
    nitrosylationGroup
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", trackHeight)
      .attr("fill", "#F8FAFC")
      .attr("stroke", "#E2E8F0")
      .attr("stroke-width", 1);

    // Draw backbone line
    nitrosylationGroup
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", trackHeight / 2)
      .attr("y2", trackHeight / 2)
      .attr("stroke", "#CBD5E1")
      .attr("stroke-width", 2);

    // Draw cysteine positions
    data.cysteine_positions
      .filter((pos) => pos >= visibleRange.start && pos <= visibleRange.end)
      .forEach((pos) => {
        const x = xScale(pos);

        nitrosylationGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", trackHeight / 2)
          .attr("r", 4)
          .attr("fill", cysteineColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .style("cursor", "pointer")
          .on("mouseover", (event) => {
            const residue = data.sequence ? data.sequence[pos - 1] : "";
            setTooltipData({
              position: pos,
              x: event.pageX,
              y: event.pageY,
              info: {
                residue,
                is_cysteine: true,
              },
            });
          })
          .on("mouseout", () => setTooltipData(null));
      });

    // Draw nitrosylation sites (on top of cysteines)
    data.positions_of_nitrosylation
      .filter((pos) => pos >= visibleRange.start && pos <= visibleRange.end)
      .forEach((pos) => {
        const x = xScale(pos);

        nitrosylationGroup
          .append("rect")
          .attr("x", x - 5)
          .attr("y", 8)
          .attr("width", 10)
          .attr("height", trackHeight - 16)
          .attr("fill", nitrosylationColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .attr("rx", 2)
          .style("cursor", "pointer")
          .on("mouseover", (event) => {
            const residue = data.sequence ? data.sequence[pos - 1] : "";
            setTooltipData({
              position: pos,
              x: event.pageX,
              y: event.pageY,
              info: {
                residue,
                is_nitrosylation: true,
                modifications: ["S-nitrosylation"],
              },
            });
          })
          .on("mouseout", () => setTooltipData(null));
      });

    // 2. SECONDARY STRUCTURE TRACK
    const structureGroup = g
      .append("g")
      .attr("transform", `translate(0, ${tracks.secondary})`);

    // Background
    structureGroup
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", trackHeight)
      .attr("fill", "#F8FAFC")
      .attr("stroke", "#E2E8F0")
      .attr("stroke-width", 1);

    // Parse and draw secondary structure
    const secondaryStructures = parseSecondaryStructure();

    if (secondaryStructures.length > 0) {
      // Draw secondary structure elements
      secondaryStructures
        .filter(
          (struct) =>
            struct.end >= visibleRange.start && struct.start <= visibleRange.end
        )
        .forEach((struct) => {
          const startX = xScale(Math.max(struct.start, visibleRange.start));
          const endX = xScale(Math.min(struct.end, visibleRange.end));
          const width = endX - startX;

          structureGroup
            .append("rect")
            .attr("x", startX)
            .attr("y", 5)
            .attr("width", Math.max(width, 1))
            .attr("height", trackHeight - 10)
            .attr("fill", structureColors[struct.type])
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .style("cursor", "pointer")
            .on("mouseover", (event) => {
              setTooltipData({
                position: struct.start,
                x: event.pageX,
                y: event.pageY,
                info: {
                  structure_type: `${struct.type} (${struct.start}-${struct.end})`,
                },
              });
            })
            .on("mouseout", () => setTooltipData(null));
        });
    } else {
      // Show message if no secondary structure could be parsed
      structureGroup
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", trackHeight / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#9CA3AF")
        .text(
          `Secondary structure format not recognized (${
            data.secondary_structure?.length || 0
          } chars)`
        );
    }

    // 3. DISORDER PLOT
    const disorderGroup = g
      .append("g")
      .attr("transform", `translate(0, ${tracks.disorder})`);

    // Background
    disorderGroup
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", plotHeight)
      .attr("fill", "#F8FAFC")
      .attr("stroke", "#E2E8F0")
      .attr("stroke-width", 1);

    // Filter data for visible range
    const visibleDisorderData = disorderArray
      .slice(visibleRange.start - 1, visibleRange.end)
      .map((score, i) => ({ position: visibleRange.start + i, score }));

    // Disorder threshold line
    disorderGroup
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", disorderScale(0.5))
      .attr("y2", disorderScale(0.5))
      .attr("stroke", "#94A3B8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Disorder regions (above threshold)
    const disorderRegions: Array<{ start: number; end: number }> = [];
    let currentRegion: { start: number; end: number } | null = null;

    visibleDisorderData.forEach(({ position, score }) => {
      if (score >= 0.5) {
        if (!currentRegion) {
          currentRegion = { start: position, end: position };
        } else {
          currentRegion.end = position;
        }
      } else {
        if (currentRegion) {
          disorderRegions.push(currentRegion);
          currentRegion = null;
        }
      }
    });
    if (currentRegion) disorderRegions.push(currentRegion);

    // Draw disorder regions
    disorderRegions.forEach((region) => {
      disorderGroup
        .append("rect")
        .attr("x", xScale(region.start))
        .attr("y", 0)
        .attr("width", xScale(region.end) - xScale(region.start))
        .attr("height", plotHeight)
        .attr("fill", "#FEE2E2")
        .attr("opacity", 0.6);
    });

    // Disorder line plot
    const disorderLine = d3
      .line<{ position: number; score: number }>()
      .x((d) => xScale(d.position))
      .y((d) => disorderScale(d.score))
      .curve(d3.curveMonotoneX);

    disorderGroup
      .append("path")
      .datum(visibleDisorderData)
      .attr("fill", "none")
      .attr("stroke", "#F97316")
      .attr("stroke-width", 2)
      .attr("d", disorderLine);

    // Ordered regions
    disorderGroup
      .append("path")
      .datum(visibleDisorderData)
      .attr("fill", "#22D3EE")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "none")
      .attr(
        "d",
        d3
          .area<{ position: number; score: number }>()
          .x((d) => xScale(d.position))
          .y0(plotHeight)
          .y1((d) => disorderScale(Math.min(d.score, 0.5)))
          .curve(d3.curveMonotoneX)
      );

    // 4. SURFACE ACCESSIBILITY PLOT
    const accessibilityGroup = g
      .append("g")
      .attr("transform", `translate(0, ${tracks.accessibility})`);

    // Background
    accessibilityGroup
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", plotHeight)
      .attr("fill", "#F8FAFC")
      .attr("stroke", "#E2E8F0")
      .attr("stroke-width", 1);

    const visibleAccessibilityData = normalizedSasa
      .slice(visibleRange.start - 1, visibleRange.end)
      .map((score, i) => ({ position: visibleRange.start + i, score }));

    // Accessibility line plot
    const accessibilityLine = d3
      .line<{ position: number; score: number }>()
      .x((d) => xScale(d.position))
      .y((d) => accessibilityScale(d.score))
      .curve(d3.curveMonotoneX);

    accessibilityGroup
      .append("path")
      .datum(visibleAccessibilityData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("d", accessibilityLine);

    // Add interactive points for accessibility
    accessibilityGroup
      .selectAll(".accessibility-point")
      .data(visibleAccessibilityData.filter((_, i) => i % 5 === 0)) // Show every 5th point
      .enter()
      .append("circle")
      .attr("class", "accessibility-point")
      .attr("cx", (d) => xScale(d.position))
      .attr("cy", (d) => accessibilityScale(d.score))
      .attr("r", 2)
      .attr("fill", "#3B82F6")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const residue = data.sequence ? data.sequence[d.position - 1] : "";
        const disorderScore = disorderArray[d.position - 1];
        const originalSasa = sasaArray[d.position - 1];
        setTooltipData({
          position: d.position,
          x: event.pageX,
          y: event.pageY,
          info: {
            residue,
            accessibility: originalSasa,
            disorder_score: disorderScore,
          },
        });
      })
      .on("mouseout", () => setTooltipData(null));

    // X-axis for the bottom plot - improved styling
    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(5)
      .tickFormat((d) => d.toString());

    g.append("g")
      .attr("transform", `translate(0, ${tracks.accessibility + plotHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#374151");

    // Add X-axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", tracks.accessibility + plotHeight + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("fill", "#1F2937")
      .text("Amino Acid Position");

    // Y-axes - improved positioning and styling
    const disorderYAxis = d3
      .axisLeft(disorderScale)
      .tickSize(5)
      .tickFormat((d) => Number(d).toFixed(1));

    g.append("g")
      .attr("transform", `translate(-15, ${tracks.disorder})`)
      .call(disorderYAxis)
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#374151");

    const accessibilityYAxis = d3
      .axisLeft(accessibilityScale)
      .tickSize(5)
      .tickFormat((d) => Number(d).toFixed(1));

    g.append("g")
      .attr("transform", `translate(-15, ${tracks.accessibility})`)
      .call(accessibilityYAxis)
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#374151");

    // Labels - improved positioning and styling
    g.append("text")
      .attr("x", -80)
      .attr("y", tracks.nitrosylation + trackHeight / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("Nitrosylation sites");

    g.append("text")
      .attr("x", -80)
      .attr("y", tracks.secondary + trackHeight / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("Secondary structure");

    g.append("text")
      .attr(
        "transform",
        `translate(-60, ${tracks.disorder + plotHeight / 2}) rotate(-90)`
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("Disorder");

    g.append("text")
      .attr(
        "transform",
        `translate(-60, ${tracks.accessibility + plotHeight / 2}) rotate(-90)`
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("SASA");

    // Position scale at top - improved visibility
    const positionScale = g.append("g");

    // Add position markers - better spacing and labels
    const totalResidues = visibleRange.end - visibleRange.start + 1;
    let step = 10; // Default step

    if (totalResidues > 500) step = 100;
    else if (totalResidues > 200) step = 50;
    else if (totalResidues > 100) step = 25;
    else if (totalResidues > 50) step = 10;
    else step = 5;

    for (let pos = visibleRange.start; pos <= visibleRange.end; pos += step) {
      // Major ticks
      positionScale
        .append("line")
        .attr("x1", xScale(pos))
        .attr("x2", xScale(pos))
        .attr("y1", -15)
        .attr("y2", -5)
        .attr("stroke", "#64748B")
        .attr("stroke-width", 1.5);

      positionScale
        .append("text")
        .attr("x", xScale(pos))
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .attr("fill", "#374151")
        .text(pos.toString());
    }

    // Add brush for region selection
    const brush = d3
      .brushX()
      .extent([
        [0, -20],
        [innerWidth, tracks.accessibility + plotHeight + 20],
      ])
      .on("end", (event) => {
        if (!event.selection) {
          setSelectedRegion(null);
          return;
        }

        const [x0, x1] = event.selection;
        const start = Math.round(xScale.invert(x0));
        const end = Math.round(xScale.invert(x1));
        setSelectedRegion([start, end]);
      });

    g.append("g").attr("class", "brush").call(brush);
  }, [data, selectedRegion, height, innerWidth, innerHeight, containerWidth]);

  // Calculate statistics
  const nitrosylationSites = data.positions_of_nitrosylation.length;
  const disorderArray = getDisorderArray();
  const disorderedResidues = disorderArray.filter(
    (score) => score >= 0.5
  ).length;
  const sasaArray = getSASAArray();
  const highAccessibilityResidues = sasaArray.filter(
    (score) => score >= 100
  ).length; // Assuming 100 is high

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Protein structural visualization with nitrosylation sites
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="text-sm">
                        Comprehensive visualization showing nitrosylation sites,
                        cysteine positions, secondary structure, disorder
                        predictions, and surface accessibility across the
                        protein sequence.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetZoom}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportPNG}>
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Residues
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {nitrosylationSites}
              </div>
              <div className="text-sm text-muted-foreground">
                S-Nitrosylation Sites
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {data.cysteine_positions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Cysteine Residues
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {((disorderedResidues / data.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">% Disordered</div>
            </div>
          </div>

          {/* Main Plot */}
          <div ref={containerRef} className="relative w-full">
            <svg
              ref={svgRef}
              width={width}
              height={height}
              className="border rounded-lg bg-white w-full"
            />

            {/* Tooltip */}
            {tooltipData && (
              <div
                className="absolute z-10 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none max-w-xs"
                style={{
                  left:
                    tooltipData.x -
                    (containerRef.current?.getBoundingClientRect().left || 0) -
                    50,
                  top:
                    tooltipData.y -
                    (containerRef.current?.getBoundingClientRect().top || 0) -
                    40,
                }}
              >
                <div>Position: {tooltipData.position}</div>
                {tooltipData.info.residue && (
                  <div>Residue: {tooltipData.info.residue}</div>
                )}
                {tooltipData.info.disorder_score !== undefined && (
                  <div>
                    Disorder: {tooltipData.info.disorder_score.toFixed(3)}
                  </div>
                )}
                {tooltipData.info.accessibility !== undefined && (
                  <div>SASA: {tooltipData.info.accessibility.toFixed(1)} Ų</div>
                )}
                {tooltipData.info.structure_type && (
                  <div>Structure: {tooltipData.info.structure_type}</div>
                )}
                {tooltipData.info.is_nitrosylation && (
                  <div className="text-yellow-300">S-Nitrosylation Site</div>
                )}
                {tooltipData.info.is_cysteine && (
                  <div className="text-orange-300">Cysteine Residue</div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Nitrosylation & Cysteine Sites
              </h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: nitrosylationColor }}
                  ></div>
                  <span>S-nitrosylation site</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cysteineColor }}
                  ></div>
                  <span>Cysteine position</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">
                Disorder & Accessibility
              </h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Disordered (≥0.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                  <span>Ordered (&lt;0.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Surface accessibility (SASA)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Secondary Structure</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Helix (H)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Sheet (E)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span>Coil (C)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Region Info */}
          {selectedRegion && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium">Selected Region</div>
              <div className="text-xs text-muted-foreground">
                Residues {selectedRegion[0]}-{selectedRegion[1]} (
                {selectedRegion[1] - selectedRegion[0] + 1} residues)
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProteinStructuralPlot;
