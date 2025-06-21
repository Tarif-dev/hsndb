import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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

interface DisorderData {
  protein_id: string;
  length: number;
  scores: number[];
  summaries: any;
  uniprot_id: string;
  gene_name: string | null;
  protein_name: string | null;
  sequence: string | null;
}

interface ProteinDisorderPlotProps {
  data: DisorderData;
  height?: number;
  className?: string;
}

interface TooltipData {
  position: number;
  score: number;
  residue?: string;
  x: number;
  y: number;
}

const ProteinDisorderPlot: React.FC<ProteinDisorderPlotProps> = ({
  data,
  height = 400,
  className = "",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<[number, number] | null>(
    null
  );

  const margin = { top: 20, right: 30, bottom: 60, left: 50 };
  const width = 800;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Color scale for disorder scores
  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([1, 0]); // Higher disorder = red, lower disorder = blue

  // Threshold for disorder regions
  const disorderThreshold = 0.5;

  const getDisorderRegions = () => {
    const regions: Array<{ start: number; end: number; avgScore: number }> = [];
    let currentRegion: { start: number; end: number; scores: number[] } | null =
      null;

    data.scores.forEach((score, index) => {
      if (score >= disorderThreshold) {
        if (!currentRegion) {
          currentRegion = { start: index + 1, end: index + 1, scores: [score] };
        } else {
          currentRegion.end = index + 1;
          currentRegion.scores.push(score);
        }
      } else {
        if (currentRegion && currentRegion.end - currentRegion.start >= 9) {
          // Min 10 residues
          const avgScore =
            currentRegion.scores.reduce((a, b) => a + b, 0) /
            currentRegion.scores.length;
          regions.push({
            start: currentRegion.start,
            end: currentRegion.end,
            avgScore,
          });
        }
        currentRegion = null;
      }
    });

    // Don't forget the last region
    if (currentRegion && currentRegion.end - currentRegion.start >= 9) {
      const avgScore =
        currentRegion.scores.reduce((a, b) => a + b, 0) /
        currentRegion.scores.length;
      regions.push({
        start: currentRegion.start,
        end: currentRegion.end,
        avgScore,
      });
    }

    return regions;
  };
  const exportPNG = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${
        data.gene_name || data.uniprot_id
      }_disorder_plot.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgString);
  };

  const exportCSV = () => {
    const header = ["position", "residue", "disorder_score"];
    const csvData = data.scores.map((score, i) => {
      const residue = data.sequence ? data.sequence[i] : "";
      return [i + 1, residue, score].join(",");
    });

    const csvContent = [header.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${
      data.gene_name || data.uniprot_id
    }_disorder_scores.csv`;
    downloadLink.click();

    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    // Create a structured JSON object with disorder data
    const jsonData = {
      protein_id: data.protein_id,
      uniprot_id: data.uniprot_id,
      gene_name: data.gene_name,
      protein_name: data.protein_name,
      length: data.length,
      average_disorder: averageDisorder,
      max_disorder: maxDisorder,
      disordered_residues: disorderedResidues,
      disorder_regions: disorderRegions,
      scores: data.scores.map((score, i) => ({
        position: i + 1,
        residue: data.sequence?.[i] || "",
        score: score,
      })),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${
      data.gene_name || data.uniprot_id
    }_disorder_data.json`;
    downloadLink.click();

    URL.revokeObjectURL(url);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setSelectedRegion(null);
  };

  useEffect(() => {
    if (!svgRef.current || !data.scores.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(selectedRegion || [1, data.length])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add background
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "#fafafa")
      .attr("stroke", "#e5e5e5")
      .attr("stroke-width", 1);

    // Add disorder threshold line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", yScale(disorderThreshold))
      .attr("y2", yScale(disorderThreshold))
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7);

    // Add threshold label
    g.append("text")
      .attr("x", innerWidth - 5)
      .attr("y", yScale(disorderThreshold) - 5)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("fill", "#ef4444")
      .text("Disorder Threshold (0.5)");

    // Create line generator
    const line = d3
      .line<number>()
      .x((_, i) => xScale(i + 1))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    // Filter data based on selected region
    const visibleData = selectedRegion
      ? data.scores.slice(selectedRegion[0] - 1, selectedRegion[1])
      : data.scores;

    const visibleIndices = selectedRegion
      ? d3.range(selectedRegion[0], selectedRegion[1] + 1)
      : d3.range(1, data.length + 1);

    // Add disorder regions as background rectangles
    const disorderRegions = getDisorderRegions();
    disorderRegions.forEach((region) => {
      if (
        !selectedRegion ||
        (region.end >= selectedRegion[0] && region.start <= selectedRegion[1])
      ) {
        g.append("rect")
          .attr("x", xScale(Math.max(region.start, selectedRegion?.[0] || 1)))
          .attr("y", 0)
          .attr(
            "width",
            xScale(Math.min(region.end, selectedRegion?.[1] || data.length)) -
              xScale(Math.max(region.start, selectedRegion?.[0] || 1))
          )
          .attr("height", innerHeight)
          .attr("fill", "#fecaca")
          .attr("opacity", 0.3);
      }
    });

    // Add main line
    g.append("path")
      .datum(visibleData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add area under curve
    const area = d3
      .area<number>()
      .x((_, i) => xScale(visibleIndices[i]))
      .y0(innerHeight)
      .y1((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(visibleData)
      .attr("fill", "url(#gradient)")
      .attr("d", area);

    // Create gradient definition
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", yScale(1))
      .attr("x2", 0)
      .attr("y2", yScale(0));

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.6);

    gradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#f59e0b")
      .attr("stop-opacity", 0.4);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.2);

    // Add interactive points
    g.selectAll(".data-point")
      .data(visibleData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (_, i) => xScale(visibleIndices[i]))
      .attr("cy", (d) => yScale(d))
      .attr("r", 3)
      .attr("fill", (d) => colorScale(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const i = visibleData.indexOf(d);
        const position = visibleIndices[i];
        setTooltipData({
          position,
          score: d,
          residue: data.sequence?.[position - 1],
          x: event.pageX,
          y: event.pageY,
        });

        d3.select(event.currentTarget).transition().duration(200).attr("r", 6);
      })
      .on("mouseout", (event) => {
        setTooltipData(null);
        d3.select(event.currentTarget).transition().duration(200).attr("r", 3);
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Residue Position");

    const yAxis = d3.axisLeft(yScale);
    g.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Disorder Score");

    // Add brush for region selection
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
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
  }, [data, selectedRegion, height, innerWidth, innerHeight]);
  const disorderRegions = getDisorderRegions();
  const averageDisorder =
    data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
  const maxDisorder = Math.max(...data.scores);
  const disorderedResidues = data.scores.filter(
    (score) => score >= disorderThreshold
  ).length;

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Protein Disorder Profile
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="text-sm">
                        Intrinsic disorder prediction scores range from 0
                        (ordered) to 1 (disordered). Values above 0.5 indicate
                        likely disordered regions.
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
              </Button>{" "}
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
                  <DropdownMenuItem onClick={exportJSON}>
                    Export as JSON
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
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {disorderedResidues}
              </div>
              <div className="text-sm text-muted-foreground">
                Disordered Residues
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {disorderRegions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Disorder Regions
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(averageDisorder * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Disorder</div>
            </div>
          </div>

          {/* Main Plot */}
          <div ref={containerRef} className="relative">
            <svg
              ref={svgRef}
              width={width}
              height={height}
              className="border rounded-lg bg-white"
            />

            {/* Tooltip */}
            {tooltipData && (
              <div
                className="absolute z-10 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none"
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
                <div>Score: {tooltipData.score.toFixed(3)}</div>
                {tooltipData.residue && (
                  <div>Residue: {tooltipData.residue}</div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Ordered (0.0-0.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Disordered (0.5-1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span>Disorder Region</span>
            </div>
          </div>

          {/* Region Information */}
          {disorderRegions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">
                Predicted Disordered Regions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {disorderRegions.map((region, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        Region {index + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Residues {region.start}-{region.end} (
                        {region.end - region.start + 1} aa)
                      </div>
                    </div>
                    <Badge
                      variant={
                        region.avgScore > 0.7 ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {(region.avgScore * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRegion && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium">Selected Region</div>
              <div className="text-xs text-muted-foreground">
                Residues {selectedRegion[0]}-{selectedRegion[1]}(
                {selectedRegion[1] - selectedRegion[0] + 1} residues)
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProteinDisorderPlot;
