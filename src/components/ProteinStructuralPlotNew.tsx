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
  height = 700,
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
  const margin = { top: 60, right: 60, bottom: 160, left: 150 };
  const width = containerWidth;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Track heights - better proportions
  const trackHeight = 50;
  const plotHeight = 100;
  const trackSpacing = 20;
  const legendHeight = 25;

  // Y positions for each track - better spacing with legends
  const tracks = {
    nitrosylation: 0,
    nitrosylationLegend: trackHeight + 5,
    secondary: trackHeight + legendHeight + trackSpacing,
    secondaryLegend: 2 * trackHeight + legendHeight + trackSpacing + 5,
    disorder: 2 * (trackHeight + legendHeight) + 2 * trackSpacing,
    disorderLegend:
      2 * (trackHeight + legendHeight) + 2 * trackSpacing + plotHeight + 5,
    accessibility:
      2 * (trackHeight + legendHeight) +
      2 * trackSpacing +
      plotHeight +
      legendHeight +
      trackSpacing,
  };

  // Color schemes
  const nitrosylationColor = "#9CA3AF"; // Gray for S-nitrosylation
  const cysteineColor = "#F59E0B"; // Orange for cysteine positions

  const structureColors = {
    "alpha-helix": "#EF4444", // Red
    "beta-strand": "#EAB308", // Yellow
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
  const exportPNG = async () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;

      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Get computed styles and inline them
      const allElements = clonedSvg.querySelectorAll("*");
      allElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element as Element);
        const inlineStyle = Array.from(computedStyle).reduce(
          (acc, property) => {
            return (
              acc + `${property}:${computedStyle.getPropertyValue(property)};`
            );
          },
          ""
        );
        (element as HTMLElement).style.cssText = inlineStyle;
      });

      // Add font definitions to ensure text renders correctly
      const fontStyle = document.createElement("style");
      fontStyle.textContent = `
        text { 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; 
          font-size: 11px;
        }
        .domain { stroke: #374151; stroke-width: 1; }
        .tick line { stroke: #374151; stroke-width: 1; }
        .tick text { fill: #374151; font-size: 11px; }
        rect { stroke-width: 1; }
        circle { stroke-width: 1; }
        line { stroke-width: 1; }
        path { stroke-width: 2; }
      `;
      clonedSvg.insertBefore(fontStyle, clonedSvg.firstChild);

      // Convert to string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);

      // Add XML declaration and ensure proper encoding
      svgString = '<?xml version="1.0" encoding="UTF-8"?>' + svgString;

      // Create canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Set canvas size with higher resolution for better quality
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;

      // Scale the context to maintain aspect ratio
      ctx.scale(scale, scale);

      // Set white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      // Create blob from SVG string
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create image and draw to canvas
      const img = new Image();

      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to PNG
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to create PNG blob"));
                  return;
                }

                // Download the image
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement("a");
                downloadLink.download = `${data.uniprot_id}_structural_plot.png`;
                downloadLink.href = url;
                downloadLink.click();

                // Cleanup
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(svgUrl);
                resolve();
              },
              "image/png",
              0.95
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          // Fallback: try simple method if advanced method fails
          console.warn("Advanced PNG export failed, trying fallback method");
          try {
            const simpleCanvas = document.createElement("canvas");
            const simpleCtx = simpleCanvas.getContext("2d");
            if (!simpleCtx) throw new Error("Could not get canvas context");

            simpleCanvas.width = width;
            simpleCanvas.height = height;
            simpleCtx.fillStyle = "white";
            simpleCtx.fillRect(0, 0, width, height);

            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              simpleCtx.drawImage(fallbackImg, 0, 0);
              const dataUrl = simpleCanvas.toDataURL("image/png", 0.95);

              const downloadLink = document.createElement("a");
              downloadLink.download = `${data.uniprot_id}_structural_plot.png`;
              downloadLink.href = dataUrl;
              downloadLink.click();

              URL.revokeObjectURL(svgUrl);
              resolve();
            };
            fallbackImg.onerror = () =>
              reject(new Error("Both PNG export methods failed"));
            fallbackImg.src = svgUrl;
          } catch (fallbackError) {
            reject(fallbackError);
          }
        };

        img.src = svgUrl;
      });
    } catch (error) {
      console.error("PNG export failed:", error);
      alert("PNG export failed. Please try again or use a different browser.");
    }
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

  const exportSVG = () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Add font definitions for better compatibility
      const fontStyle = document.createElement("style");
      fontStyle.textContent = `
        text { 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; 
          font-size: 11px;
        }
        .domain { stroke: #374151; stroke-width: 1; }
        .tick line { stroke: #374151; stroke-width: 1; }
        .tick text { fill: #374151; font-size: 11px; }
        rect { stroke-width: 1; }
        circle { stroke-width: 1; }
        line { stroke-width: 1; }
        path { stroke-width: 2; }
      `;
      clonedSvg.insertBefore(fontStyle, clonedSvg.firstChild);

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);
      svgString = '<?xml version="1.0" encoding="UTF-8"?>' + svgString;

      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `${data.uniprot_id}_structural_plot.svg`;
      downloadLink.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("SVG export failed:", error);
      alert("SVG export failed. Please try again.");
    }
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

    // Nitrosylation track legend
    const nitrosylationLegendGroup = g
      .append("g")
      .attr("transform", `translate(0, ${tracks.nitrosylationLegend})`);

    nitrosylationLegendGroup
      .append("rect")
      .attr("x", 10)
      .attr("y", 2)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", nitrosylationColor)
      .attr("rx", 2);

    nitrosylationLegendGroup
      .append("text")
      .attr("x", 28)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("S-nitrosylation site");

    nitrosylationLegendGroup
      .append("circle")
      .attr("cx", 150)
      .attr("cy", 8)
      .attr("r", 6)
      .attr("fill", cysteineColor);

    nitrosylationLegendGroup
      .append("text")
      .attr("x", 165)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Cysteine position");

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

    // Secondary structure track legend
    const secondaryLegendGroup = g
      .append("g")
      .attr("transform", `translate(0, ${tracks.secondaryLegend})`);

    secondaryLegendGroup
      .append("rect")
      .attr("x", 10)
      .attr("y", 2)
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", structureColors["alpha-helix"])
      .attr("rx", 1);

    secondaryLegendGroup
      .append("text")
      .attr("x", 30)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Helix (H)");

    secondaryLegendGroup
      .append("rect")
      .attr("x", 90)
      .attr("y", 2)
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", structureColors["beta-strand"])
      .attr("rx", 1);

    secondaryLegendGroup
      .append("text")
      .attr("x", 110)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Sheet (E)");

    secondaryLegendGroup
      .append("rect")
      .attr("x", 175)
      .attr("y", 2)
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", structureColors["coil"])
      .attr("rx", 1);

    secondaryLegendGroup
      .append("text")
      .attr("x", 195)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Coil (C)");

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

    // Disorder plot legend
    const disorderLegendGroup = g
      .append("g")
      .attr("transform", `translate(0, ${tracks.disorderLegend})`);

    disorderLegendGroup
      .append("rect")
      .attr("x", 10)
      .attr("y", 2)
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", "#FEE2E2")
      .attr("stroke", "#F97316")
      .attr("stroke-width", 1)
      .attr("rx", 1);

    disorderLegendGroup
      .append("text")
      .attr("x", 30)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Disordered (≥0.5)");

    disorderLegendGroup
      .append("rect")
      .attr("x", 130)
      .attr("y", 2)
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", "#22D3EE")
      .attr("fill-opacity", 0.3)
      .attr("rx", 1);

    disorderLegendGroup
      .append("text")
      .attr("x", 150)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Ordered (<0.5)");

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

    // Accessibility legend (simple line legend)
    const accessibilityLegendGroup = g
      .append("g")
      .attr(
        "transform",
        `translate(0, ${tracks.accessibility + plotHeight + 10})`
      );

    accessibilityLegendGroup
      .append("line")
      .attr("x1", 10)
      .attr("x2", 25)
      .attr("y1", 8)
      .attr("y2", 8)
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2);

    accessibilityLegendGroup
      .append("text")
      .attr("x", 30)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Surface accessibility (SASA)");

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

    // Labels - improved positioning and styling (moved closer to prevent overflow)
    g.append("text")
      .attr("x", -100)
      .attr("y", tracks.nitrosylation + trackHeight / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("Nitrosylation");

    g.append("text")
      .attr("x", -100)
      .attr("y", tracks.secondary + trackHeight / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("Structure");

    g.append("text")
      .attr(
        "transform",
        `translate(-80, ${tracks.disorder + plotHeight / 2}) rotate(-90)`
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("Disorder");

    g.append("text")
      .attr(
        "transform",
        `translate(-80, ${tracks.accessibility + plotHeight / 2}) rotate(-90)`
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
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
                  <DropdownMenuItem onClick={exportSVG}>
                    Export as SVG
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
