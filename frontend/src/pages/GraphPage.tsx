import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  RotateCcw, 
  AlertTriangle, 
  FileText, 
  X, 
  ExternalLink, 
  Network, 
  List, 
  HelpCircle,
  FileQuestion,
  ChevronRight
} from 'lucide-react';
import { GraphNode, GraphLink, Topic, Question, Note } from '../types';
import { api } from '../services/api';

export const GraphPage: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const [nodesData, setNodesData] = useState<GraphNode[]>([]);
  const [linksData, setLinksData] = useState<GraphLink[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const graph = await api.getGraph();
        setNodesData(graph.nodes || []);
        setLinksData(graph.links || []);
        const [t, q, n] = await Promise.all([
          api.getTopics(),
          api.getQuestions(),
          api.getNotes(),
        ]);
        setTopics(t || []);
        setQuestions(q || []);
        setNotes(n || []);
      } catch (e) {
        console.warn('Error fetching graph data:', e);
      }
    };
    fetchData();
  }, []);

  // Responsive switch: default to list view on small screens (< 640px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setViewMode('list');
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'graph' || !svgRef.current || !containerRef.current || !nodesData.length) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 520;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Deep copy nodes and links for simulation
    const simNodes: GraphNode[] = nodesData.map((d) => ({ ...d }));
    const simLinks: GraphLink[] = linksData.map((d) => ({ ...d }));

    const simulation = d3.forceSimulation<GraphNode>(simNodes)
      .force(
        'link',
        d3.forceLink<GraphNode, GraphLink>(simLinks)
          .id((d: any) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide().radius((d: any) => Math.sqrt(d.weight || 10) * 4 + 20)
      );

    // Read brand tokens
    const borderCol = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'currentColor';
    const primaryCol = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || 'currentColor';
    const peachCol = getComputedStyle(document.documentElement).getPropertyValue('--peach').trim() || 'currentColor';
    const creamCol = getComputedStyle(document.documentElement).getPropertyValue('--bg-cream').trim() || 'currentColor';
    const inkCol = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || 'currentColor';

    // Connecting Links
    const link = g.append('g')
      .attr('stroke', borderCol)
      .attr('stroke-opacity', 0.8)
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke-width', (d) => Math.max(1.5, (d.strength || 1) * 2.5));

    // Nodes group
    const node = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'pointer')
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
      });

    // Outer circle
    node.append('circle')
      .attr('r', (d) => Math.sqrt(d.weight || 10) * 3 + 14)
      .attr('fill', (d) => (d.isGap ? peachCol : creamCol))
      .attr('stroke', (d) => (d.isGap ? primaryCol : d.color || primaryCol))
      .attr('stroke-width', (d) => (d.isGap ? 2.5 : 2))
      .attr('stroke-dasharray', (d) => (d.isGap ? '5 3' : 'none'));

    // Inner badge
    node.append('circle')
      .attr('r', (d) => Math.sqrt(d.weight || 10) * 2 + 6)
      .attr('fill', (d) => d.color || primaryCol)
      .attr('fill-opacity', 0.2);

    // Marks label
    node.append('text')
      .text((d) => `${d.weight}M`)
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('fill', inkCol)
      .attr('font-size', '11px')
      .attr('font-family', 'Figtree, sans-serif')
      .attr('font-weight', 'bold');

    // Title label underneath
    node.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('y', (d) => Math.sqrt(d.weight || 10) * 3 + 30)
      .attr('fill', inkCol)
      .attr('font-size', '12px')
      .attr('font-family', 'Figtree, sans-serif')
      .attr('font-weight', '600');

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
  }, [viewMode, nodesData, linksData]);

  const handleReset = () => {
    setSelectedNode(null);
  };

  const relatedQuestions = selectedNode
    ? questions.filter((q) => q.topic_id === selectedNode.id)
    : [];

  const relatedNotes = selectedNode
    ? notes.filter((n) => n.topic_ids.includes(selectedNode.id))
    : [];

  const topicMeta = selectedNode
    ? topics.find((t) => t.id === selectedNode.id)
    : null;

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* ── TOP HEADER & CONTROLS ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Topic Map
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Connected syllabus topics, exam mark weightings, and prerequisite paths.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle (Map vs List) */}
          <div className="inline-flex p-1 bg-grey-card rounded-pill border border-border">
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                viewMode === 'graph'
                  ? 'bg-bg text-ink shadow-xs'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Network size={14} className="text-primary" />
              <span>Map view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-bg text-ink shadow-xs'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <List size={14} className="text-primary" />
              <span>List view</span>
            </button>
          </div>

          {viewMode === 'graph' && (
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-grey-card hover:bg-border/60 text-ink text-xs font-semibold rounded-pill border border-border flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset view</span>
            </button>
          )}
        </div>
      </div>

      {/* ── GRAPH / LIST VIEW AREA ────────────────────────────────────────── */}
      {viewMode === 'graph' ? (
        <div
          ref={containerRef}
          className="relative w-full h-[520px] bg-bg-cream/40 rounded-card-lg border border-border overflow-hidden select-none shadow-xs"
        >
          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-bg/95 border border-border/80 p-3.5 rounded-2xl text-xs space-y-2 shadow-xs backdrop-blur-sm max-w-xs">
            <span className="font-bold text-ink block text-[11px] uppercase tracking-wider">
              Topic Legend
            </span>
            <div className="flex items-center gap-2 text-ink-soft">
              <span className="w-3 h-3 rounded-full bg-peach border border-primary" />
              <span>Bubble size = Exam mark weight</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft">
              <span className="w-3 h-3 rounded-full border-2 border-dashed border-primary" />
              <span className="text-primary-text font-medium">Dashed ring = Needs notes</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft">
              <span className="w-5 h-0.5 bg-border" />
              <span>Connecting line = Topic prerequisite</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-10 text-xs text-ink-soft bg-bg/90 px-3 py-1.5 rounded-pill border border-border shadow-xs">
            Drag to pan • Scroll to zoom • Click bubble for details
          </div>

          {/* D3 Canvas */}
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        </div>
      ) : (
        /* ── RESPONSIVE LIST VIEW (IDEAL FOR MOBILE) ───────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nodesData.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="p-5 bg-bg rounded-card border border-border shadow-xs hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-ink"
                  style={{ backgroundColor: `${node.color}25`, border: `2px solid ${node.color}` }}
                >
                  {node.weight}M
                </div>
                <div>
                  <div className="font-bold text-ink text-base group-hover:text-primary transition-colors">
                    {node.name}
                  </div>
                  <div className="text-xs text-ink-soft mt-0.5">
                    {node.unit} • {node.isGap ? '⚠️ Missing lecture notes' : 'Notes & questions ready'}
                  </div>
                </div>
              </div>

              <ChevronRight size={18} className="text-ink-faint group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      )}

      {/* ── TOPIC DETAILS DRAWER / BOTTOM SHEET ─────────────────────────────── */}
      {selectedNode && (
        <div className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:bottom-0 sm:w-[420px] z-50 bg-ink/30 sm:bg-transparent backdrop-blur-xs flex items-end sm:items-stretch">
          <div className="w-full bg-bg rounded-t-[32px] sm:rounded-none sm:border-l border-border shadow-warm-lg p-6 sm:p-8 overflow-y-auto flex flex-col justify-between max-h-[85vh] sm:max-h-full">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-border/80">
                <div>
                  <span className="text-xs font-bold text-primary-text uppercase tracking-wider">
                    {selectedNode.unit}
                  </span>
                  <h2 className="text-2xl font-bold text-ink mt-0.5">
                    {selectedNode.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-pill bg-grey-card hover:bg-border/60 text-ink-soft transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Coverage Gap Warning */}
              {selectedNode.isGap && (
                <div className="p-4 bg-peach/40 border border-primary/30 rounded-2xl flex items-start gap-3 text-xs text-primary-text">
                  <AlertTriangle size={18} className="shrink-0 text-primary mt-0.5" />
                  <div>
                    <strong className="block font-bold">Coverage gap detected</strong>
                    Tested in {selectedNode.frequency} past papers, but no notes uploaded yet.
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-grey-card rounded-2xl border border-border/70">
                  <span className="text-xs text-ink-soft block font-medium">Exam Marks Weight</span>
                  <span className="text-2xl font-bold text-ink mt-1 block">{selectedNode.weight} marks</span>
                </div>
                <div className="p-4 bg-grey-card rounded-2xl border border-border/70">
                  <span className="text-xs text-ink-soft block font-medium">Study Priority</span>
                  <span className="text-2xl font-bold text-primary mt-1 block">
                    {topicMeta?.priority_score ? `${topicMeta.priority_score.toFixed(1)} score` : 'High'}
                  </span>
                </div>
              </div>

              {/* Linked Past Exam Questions */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Past Exam Questions ({relatedQuestions.length})
                </span>
                {relatedQuestions.length === 0 ? (
                  <p className="text-xs text-ink-soft italic">No direct questions linked.</p>
                ) : (
                  relatedQuestions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-grey-card rounded-xl border border-border text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-primary-text">
                        <span>{q.year} End Semester ({q.marks} Marks)</span>
                        {q.repeat_count > 1 && (
                          <span className="px-2 py-0.5 bg-peach text-primary-text rounded-pill text-[10px]">
                            Asked {q.repeat_count}x
                          </span>
                        )}
                      </div>
                      <p className="text-ink line-clamp-2 mt-1 leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Linked Lecture Notes */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Linked Notes ({relatedNotes.length})
                </span>
                {relatedNotes.length === 0 ? (
                  <p className="text-xs text-status-warning bg-status-warning-bg/40 p-3 rounded-xl border border-status-warning/30">
                    No lecture notes recorded for this topic yet.
                  </p>
                ) : (
                  relatedNotes.map((n) => (
                    <div key={n.id} className="p-3 bg-grey-card rounded-xl border border-border text-xs flex items-center justify-between">
                      <span className="font-semibold text-ink">
                        Lecture {n.lecture_number} (Page {n.page})
                      </span>
                      <span className="text-status-success font-bold">
                        {Math.round(n.confidence * 100)}% accuracy
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-6">
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-3 bg-grey-card hover:bg-border/60 text-ink font-semibold text-xs rounded-pill transition-colors"
              >
                Close details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
