import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Download, Search, Filter } from 'lucide-react';

const KnowledgeGraphVisualization = () => {
  const svgRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNodeTypes, setFilteredNodeTypes] = useState(new Set());
  const [simulation, setSimulation] = useState(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Color scheme for different node types
  const colorScheme = {
    'Technology': '#3B82F6',
    'Data Structure': '#10B981',
    'Concept': '#F59E0B',
    'Person': '#EF4444',
    'Organization': '#8B5CF6',
    'Document': '#06B6D4',
    'Unknown': '#6B7280'
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0) {
      initializeVisualization();
    }
  }, [graphData]);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge-graph');
      const data = await response.json();
      
      if (response.ok) {
        setGraphData(data);
      } else {
        setError('Failed to load knowledge graph');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const initializeVisualization = () => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        setTransform(event.transform);
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create main group for zoomable content
    const g = svg.append("g");

    // Create simulation
    const newSimulation = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink(graphData.edges).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    setSimulation(newSimulation);

    // Create links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphData.edges)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create link labels
    const linkLabel = g.append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(graphData.edges)
      .enter().append("text")
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .attr("text-anchor", "middle")
      .text(d => d.relationship || d.type);

    // Create nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graphData.nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(drag(newSimulation));

    // Add circles to nodes
    node.append("circle")
      .attr("r", 20)
      .attr("fill", d => colorScheme[d.type] || colorScheme['Unknown'])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add labels to nodes
    node.append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .text(d => d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name);

    // Add hover effects
    node.on("mouseover", handleNodeMouseOver)
        .on("mouseout", handleNodeMouseOut)
        .on("click", handleNodeClick);

    // Update positions on simulation tick
    newSimulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      linkLabel
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Apply initial transform
    svg.call(zoom.transform, transform);
  };

  const drag = (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  const handleNodeMouseOver = (event, d) => {
    // Highlight connected nodes and links
    const svg = d3.select(svgRef.current);
    
    // Fade out non-connected elements
    svg.selectAll(".node circle")
      .style("opacity", n => (n === d || isConnected(n, d)) ? 1 : 0.3);
    
    svg.selectAll(".links line")
      .style("opacity", l => (l.source === d || l.target === d) ? 1 : 0.1);
  };

  const handleNodeMouseOut = (event, d) => {
    // Reset opacity
    const svg = d3.select(svgRef.current);
    svg.selectAll(".node circle").style("opacity", 1);
    svg.selectAll(".links line").style("opacity", 0.6);
  };

  const handleNodeClick = (event, d) => {
    setSelectedNode(d);
  };

  const isConnected = (node1, node2) => {
    return graphData.edges.some(edge => 
      (edge.source === node1 && edge.target === node2) ||
      (edge.source === node2 && edge.target === node1)
    );
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      svg.select(".zoom").transform,
      transform.scale(1.5)
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      svg.select(".zoom").transform,
      transform.scale(0.7)
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      svg.select(".zoom").transform,
      d3.zoomIdentity
    );
    if (simulation) {
      simulation.alpha(1).restart();
    }
  };

  const handleDownload = () => {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-graph.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getNodeTypes = () => {
    const types = new Set(graphData.nodes.map(node => node.type));
    return Array.from(types);
  };

  const filteredData = {
    nodes: graphData.nodes.filter(node => {
      const matchesSearch = !searchTerm || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filteredNodeTypes.size === 0 || filteredNodeTypes.has(node.type);
      return matchesSearch && matchesFilter;
    }),
    edges: graphData.edges.filter(edge => {
      const sourceVisible = graphData.nodes.some(node => 
        node.id === edge.source.id || node.id === edge.source
      );
      const targetVisible = graphData.nodes.some(node => 
        node.id === edge.target.id || node.id === edge.target
      );
      return sourceVisible && targetVisible;
    })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchGraphData}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Graph</h2>
        <p className="text-gray-600">Interactive visualization of knowledge relationships</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            multiple
            value={Array.from(filteredNodeTypes)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFilteredNodeTypes(new Set(selected));
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getNodeTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
            title="Download SVG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Node Types</h3>
        <div className="flex flex-wrap gap-2">
          {getNodeTypes().map(type => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: colorScheme[type] || colorScheme['Unknown'] }}
              ></div>
              <span className="text-sm text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visualization */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="600"
          className="bg-gray-50"
        />
      </div>

      {/* Node Details */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedNode.name}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-gray-700">Type:</strong>
              <span className="ml-2 text-gray-600">{selectedNode.type}</span>
            </div>
            <div>
              <strong className="text-gray-700">ID:</strong>
              <span className="ml-2 text-gray-600">{selectedNode.id}</span>
            </div>
          </div>
          {selectedNode.description && (
            <div className="mt-2">
              <strong className="text-gray-700">Description:</strong>
              <p className="text-gray-600 mt-1">{selectedNode.description}</p>
            </div>
          )}
          {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
            <div className="mt-2">
              <strong className="text-gray-700">Properties:</strong>
              <div className="mt-1 text-gray-600">
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <div key={key} className="ml-2">
                    <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Graph Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-gray-100 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{graphData.nodes.length}</div>
          <div className="text-sm text-gray-600">Nodes</div>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{graphData.edges.length}</div>
          <div className="text-sm text-gray-600">Edges</div>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{getNodeTypes().length}</div>
          <div className="text-sm text-gray-600">Node Types</div>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {graphData.edges.length > 0 ? Math.round(graphData.edges.length / graphData.nodes.length * 10) / 10 : 0}
          </div>
          <div className="text-sm text-gray-600">Avg Connections</div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphVisualization;
