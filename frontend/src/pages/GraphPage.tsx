import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Share2, RotateCcw, AlertTriangle, FileText, 
  HelpCircle, CheckCircle2, X, ExternalLink, ZoomIn, ZoomOut 
} from 'lucide-react';
import { GraphNode, GraphLink, Topic, Question, Note } from '../types';
import { 
  MOCK_GRAPH_NODES, MOCK_GRAPH_LINKS, MOCK_TOPICS, 
  MOCK_QUESTIONS, MOCK_NOTES 
} from '../mocks';

export const GraphPage: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  const nodesData: GraphNode[] = React.useMemo(() => 
    MOCK_GRAPH_NODES.map(d => ({ ...d })), []
  );
  
  const linksData: GraphLink[] = React.useMemo(() => 
    MOCK_GRAPH_LINKS.map(d => ({ ...d })), []
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 540;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    // Zoom behavior
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Simulation
    const simulation = d3.forceSimulation<GraphNode>(nodesData)
      .force('link', d3.forceLink<GraphNode, GraphLink>(linksData).id((d: any) => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt(d.weight) * 4 + 15));

    // Links
    const link = g.append('g')
      .attr('stroke', '#30363D')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(linksData)
      .join('line')
      .attr('stroke-width', (d) => d.strength * 3);

    // Nodes container
    const node = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodesData)
      .join('g')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (_, d) => {
        setSelectedNode(d);
      })
      .on('mouseenter', (_, d) => {
        setHoveredNodeId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    // Outer glow ring
    node.append('circle')
      .attr('r', (d) => Math.sqrt(d.weight) * 3 + 12)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => d.isGap ? '#FF3B30' : d.color)
      .attr('stroke-width', (d) => d.isGap ? 2.5 : 1.5)
      .attr('stroke-dasharray', (d) => d.isGap ? '4 3' : 'none')
      .attr('opacity', 0.85);

    // Inner filled circle
    node.append('circle')
      .attr('r', (d) => Math.sqrt(d.weight) * 3 + 6)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.25)
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1);

    // Text labels
    node.append('text')
      .text((d) => d.name)
      .attr('x', 0)
      .attr('y', (d) => Math.sqrt(d.weight) * 3 + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600');

    // Weight subtitle
    node.append('text')
      .text((d) => `${d.weight}M`)
      .attr('x', 0)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', 'bold');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodesData, linksData]);

  const handleReset = () => {
    setSelectedNode(null);
    setHoveredNodeId(null);
  };

  // Connected questions & notes for selected node drawer
  const relatedQuestions = selectedNode 
    ? MOCK_QUESTIONS.filter(q => q.topic_id === selectedNode.id)
    : [];

  const relatedNotes = selectedNode
    ? MOCK_NOTES.filter(n => n.topic_ids.includes(selectedNode.id))
    : [];

  const topicMeta = selectedNode
    ? MOCK_TOPICS.find(t => t.id === selectedNode.id)
    : null;

  return (
    <div className="space-y-6 pb-16 relative">
      
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
            <span>EXAMLENS</span>
            <span>/</span>
            <span className="text-[#FF3B30]">KNOWLEDGE TOPOLOGY</span>
            <span>/</span>
            <span>SHARED TOPIC GRAPH</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            FORCE-DIRECTED SYLLABUS KNOWLEDGE GRAPH
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1117] hover:bg-[#161B22] border border-[#1F2937] text-slate-300 font-mono text-xs tracking-wider transition-all"
          >
            <RotateCcw size={13} />
            <span>RESET LAYOUT</span>
          </button>
        </div>
      </div>

      {/* ── GRAPH CONTAINER & CANVAS ────────────────────────────────────────── */}
      <div 
        ref={containerRef} 
        className="relative w-full h-[540px] bg-[#07090D] border border-[#1F2937] overflow-hidden select-none tactical-panel"
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none" />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-[#0D1117]/90 border border-[#1F2937] p-3 text-[11px] font-mono space-y-1.5 backdrop-blur-sm">
          <div className="text-white font-bold mb-1 uppercase tracking-wider text-[10px]">
            GRAPH TOPOLOGY LEGEND
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]"></span>
            <span>Node Size = Historical Marks Weight</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#FF3B30]"></span>
            <span className="text-[#FF3B30]">Dashed Red Ring = Coverage Gap (0 Notes)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-4 h-0.5 bg-slate-600"></span>
            <span>Link = Curriculum Pre-requisite Dependency</span>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-4 z-10 text-[10px] font-mono text-slate-500 bg-black/60 px-2 py-1 border border-slate-900">
          DRAG NODES • SCROLL TO ZOOM • CLICK NODE TO INSPECT DETAILS
        </div>

        {/* D3 SVG Canvas */}
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* ── RIGHT SLIDE-OUT INSPECTOR DRAWER ─────────────────────────────────── */}
        {selectedNode && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[#0D1117] border-l border-[#1F2937] shadow-2xl p-6 overflow-y-auto z-20 flex flex-col justify-between">
            <div>
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#1F2937] mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedNode.color }} 
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {selectedNode.unit}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-white tracking-wide mt-1">
                    {selectedNode.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status / Coverage Gap Alert */}
              {selectedNode.isGap && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/50 mb-4 flex items-start gap-2 text-xs font-mono text-amber-300">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-200">CRITICAL COVERAGE GAP</strong>
                    Asked in {selectedNode.frequency} past papers, but no verified lecture notes found.
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-xs">
                <div className="p-2.5 bg-[#07090D] border border-[#1F2937]">
                  <span className="text-slate-500 text-[10px] block">TOTAL MARKS</span>
                  <span className="text-white font-bold text-base">{selectedNode.weight}M</span>
                </div>
                <div className="p-2.5 bg-[#07090D] border border-[#1F2937]">
                  <span className="text-slate-500 text-[10px] block">STUDY PRIORITY</span>
                  <span className="text-[#FF3B30] font-bold text-base">
                    {topicMeta?.priority_score.toFixed(2) || '8.00'} M/HR
                  </span>
                </div>
              </div>

              {/* Linked Past Exam Questions */}
              <div className="space-y-3 mb-4">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>EXTRACTED PAST QUESTIONS ({relatedQuestions.length})</span>
                </div>
                {relatedQuestions.length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 italic p-2 bg-[#07090D]">
                    No direct question links.
                  </div>
                ) : (
                  relatedQuestions.map(q => (
                    <div key={q.id} className="p-2.5 bg-[#07090D] border border-[#1F2937] text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#FF3B30] font-bold">{q.year} END SEM ({q.marks}M)</span>
                        {q.repeat_count > 1 && (
                          <span className="px-1.5 py-0.2 bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/50 font-bold">
                            ASKED {q.repeat_count}X
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 line-clamp-3 text-[11px]">
                        {q.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Linked Lecture Notes */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  LINKED LECTURE NOTES ({relatedNotes.length})
                </div>
                {relatedNotes.length === 0 ? (
                  <div className="text-xs font-mono text-amber-400 p-2 bg-[#07090D] border border-amber-900/40">
                    No lecture notes recorded for this topic.
                  </div>
                ) : (
                  relatedNotes.map(n => (
                    <div key={n.id} className="p-2 bg-[#07090D] border border-[#1F2937] text-xs font-mono flex items-center justify-between">
                      <span className="text-white">LECTURE {n.lecture_number} (PAGE {n.page})</span>
                      <span className="text-emerald-400">{(n.confidence * 100).toFixed(0)}% OCR</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1F2937] mt-4">
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2 bg-[#161B22] hover:bg-[#1E2530] text-slate-300 font-mono text-xs uppercase"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
