import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "./ui/button";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  score?: number;
  isCenter?: boolean;
  group?: number;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: NetworkNode | string;
  target: NetworkNode | string;
  score: number;
  confidence: "high" | "medium" | "low";
}

interface NetworkVisualizationProps {
  centerProtein: string;
  interactions: Array<{
    preferredName_B: string;
    score: number;
  }>;
  isLoading?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onExport?: () => void;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  centerProtein,
  interactions,
  isLoading = false,
  onNodeClick,
  onExport,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(
    null
  );

  // Process data into nodes and links
  const processData = () => {
    const nodes: NetworkNode[] = [
      {
        id: centerProtein,
        name: centerProtein,
        isCenter: true,
        group: 0,
      },
    ];

    const links: NetworkLink[] = [];

    interactions.forEach((interaction, index) => {
      const targetNode: NetworkNode = {
        id: interaction.preferredName_B,
        name: interaction.preferredName_B,
        score: interaction.score,
        group: Math.floor(index / 3) + 1,
      };

      nodes.push(targetNode);

      const confidence =
        interaction.score > 0.7
          ? "high"
          : interaction.score > 0.4
          ? "medium"
          : "low";

      links.push({
        source: centerProtein,
        target: interaction.preferredName_B,
        score: interaction.score,
        confidence,
      });
    });

    return { nodes, links };
  };

  const initializeVisualization = () => {
    if (!svgRef.current || isLoading) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select(".network-container");

    // Clear previous content
    container.selectAll("*").remove();

    const { nodes, links } = processData();

    if (nodes.length === 0) return;

    const width = 800;
    const height = 400;

    // Create force simulation
    const simulation = d3
      .forceSimulation<NetworkNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<NetworkNode, NetworkLink>(links)
          .id((d) => d.id)
          .distance((d) => 100 - d.score * 50)
          .strength((d) => d.score)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    // Create links
    const link = container
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => {
        switch (d.confidence) {
          case "high":
            return "#059669";
          case "medium":
            return "#0891b2";
          case "low":
            return "#6b7280";
          default:
            return "#6b7280";
        }
      })
      .attr("stroke-width", (d) => Math.max(1, d.score * 4))
      .attr("opacity", 0.7);

    // Create node groups
    const node = container
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, NetworkNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => (d.isCenter ? 20 : 15))
      .attr("fill", (d) => {
        if (d.isCenter) return "#3b82f6";
        return d3.schemeCategory10[d.group % 10];
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add labels to nodes
    node
      .append("text")
      .text((d) => d.name)
      .attr("x", 0)
      .attr("y", (d) => (d.isCenter ? -25 : -20))
      .attr("text-anchor", "middle")
      .style("fill", "#374151")
      .style("font-size", (d) => (d.isCenter ? "12px" : "10px"))
      .style("font-weight", (d) => (d.isCenter ? "bold" : "normal"))
      .style("pointer-events", "none");

    // Add score labels for non-center nodes
    node
      .filter((d) => !d.isCenter)
      .append("text")
      .text((d) => (d.score ? (d.score * 1000).toFixed(0) : ""))
      .attr("x", 0)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("fill", "#6b7280")
      .style("font-size", "8px")
      .style("pointer-events", "none");

    // Add click handlers
    node.on("click", (event, d) => {
      if (onNodeClick) {
        onNodeClick(d.id);
      }
    }); // Add hover effects
    node
      .on("mouseover", function (event, d: NetworkNode) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d.isCenter ? 20 : 15) * 1.2);
      })
      .on("mouseout", function (event, d: NetworkNode) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", d.isCenter ? 20 : 15);
      }); // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => {
          const source = d.source as NetworkNode;
          return source.x || 0;
        })
        .attr("y1", (d) => {
          const source = d.source as NetworkNode;
          return source.y || 0;
        })
        .attr("x2", (d) => {
          const target = d.target as NetworkNode;
          return target.x || 0;
        })
        .attr("y2", (d) => {
          const target = d.target as NetworkNode;
          return target.y || 0;
        });

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Drag functions
    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>,
      d: NetworkNode
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(
      event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>,
      d: NetworkNode
    ) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>,
      d: NetworkNode
    ) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const container = svg.select(".network-container");
    const newZoom = Math.min(zoomLevel * 1.2, 3);
    setZoomLevel(newZoom);
    container.transition().duration(300).attr("transform", `scale(${newZoom})`);
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const container = svg.select(".network-container");
    const newZoom = Math.max(zoomLevel / 1.2, 0.3);
    setZoomLevel(newZoom);
    container.transition().duration(300).attr("transform", `scale(${newZoom})`);
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    const container = svg.select(".network-container");
    setZoomLevel(1);
    container.transition().duration(300).attr("transform", "scale(1)");

    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  };

  useEffect(() => {
    if (!isLoading && interactions.length > 0) {
      initializeVisualization();
    }

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [centerProtein, interactions, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Loading interaction network...
          </p>
        </div>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            No interaction data available
          </p>
          <p className="text-xs text-muted-foreground">
            Try checking external databases
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Control buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Network visualization */}
      <svg
        ref={svgRef}
        width="100%"
        height="400"
        className="border rounded-lg bg-white"
        style={{ minHeight: "400px" }}
      >
        <g className="network-container"></g>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          <span>High confidence (score &gt; 0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
          <span>Medium confidence (0.4-0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <span>Low confidence (&lt; 0.4)</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;
