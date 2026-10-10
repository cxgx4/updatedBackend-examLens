import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Zap, CheckCircle2, AlertTriangle, ArrowRight, 
  Layers, FileText, BarChart3, Share2, Calendar, HelpCircle, 
  CreditCard, Download, Sparkles, ExternalLink
} from 'lucide-react';
import { NavTab } from '../components/Navbar';
import { MOCK_TOPICS, MOCK_QUESTIONS, MOCK_COVERAGE_GAPS } from '../mocks';

interface BoardPageProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onStartDemo: () => void;
}

export const BoardPage: React.FC<BoardPageProps> = ({
  onSelectTab,
  onOpenUpload,
  onOpenExport,
  onStartDemo,
}) => {
  // Live ticking countdown
  const [secondsRemaining, setSecondsRemaining] = useState(72 * 3600 + 14 * 60 + 22);
  const [topics, setTopics] = useState<any[]>([]);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      const t = await import('../services/api').then(m => m.api.getTopics());
      setTopics(t);
      const mockState = await import('../services/api').then(m => m.api.getIsMock());
      setIsMock(mockState);
    };
    fetchTopics();
    
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pipeline = [
    { name: 'UPLOAD', desc: 'PDF / Multi-Image', status: 'COMPLETE' },
    { name: 'MERGE', desc: 'img2pdf + EXIF', status: 'COMPLETE' },
    { name: 'WARP', desc: 'Homography Rectify', status: 'COMPLETE' },
    { name: 'CLEAN', desc: 'CLAHE De-glare', status: 'ACTIVE' },
    { name: 'SEGMENT', desc: 'Text / Math / Fig', status: 'READY' },
    { name: 'OCR', desc: 'Word Conf + KaTeX', status: 'READY' },
    { name: 'TOPICS', desc: 'NLP Embeddings', status: 'READY' },
    { name: 'PLAN', desc: 'Marks/Effort Graph', status: 'READY' },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border border-[#1F2937] bg-gradient-to-b from-[#0D1117] to-[#07090D] p-6 sm:p-10">
        
        {/* Subtle radial red glow */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF3B30]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Giant Faded Countdown Background */}
        <div className="absolute -right-6 -bottom-10 font-display text-[160px] sm:text-[220px] font-bold text-white/[0.03] select-none pointer-events-none tracking-tight leading-none">
          {hours}H
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          
          {/* Micro Status Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40 font-mono text-[10px] uppercase tracking-widest font-bold">
              SYSTEM ONLINE
            </span>
            <span className="px-2 py-0.5 bg-[#0D1117] text-slate-400 border border-[#1F2937] font-mono text-[10px] uppercase tracking-widest">
              EXAMLENS AI PIPELINE V1.0
            </span>
            <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SHARED GRAPH READY
            </span>
          </div>

          {/* Punchy Animated Display Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-wide text-white uppercase leading-[0.95]">
            TURN YOUR CHAOS INTO A <span className="text-[#FF3B30] underline decoration-[#FF3B30]/40 decoration-4 underline-offset-8">STUDY PLAN.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-sans leading-relaxed">
            ExamLens stitches lecture-board photos and past question papers into one connected study engine. 
            Homography warping, word-level OCR confidence, KaTeX equations, repeat detection, and prioritized revision.
          </p>

          {/* Countdown & Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            
            {/* Live Ticking Box */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#040608] border border-[#1F2937]">
              <Clock size={16} className="text-[#FF3B30] animate-pulse" />
              <div className="font-mono text-sm tracking-widest text-white font-bold">
                <span>{String(hours).padStart(2, '0')}</span>H :{' '}
                <span>{String(minutes).padStart(2, '0')}</span>M :{' '}
                <span className="text-[#FF3B30]">{String(seconds).padStart(2, '0')}</span>S
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase ml-1">TO EXAM</span>
            </div>

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-5 py-2 bg-[#FF3B30] hover:bg-[#E02D23] text-white font-mono text-xs font-bold tracking-wider transition-all shadow-laser"
            >
              <Zap size={14} className="fill-white" />
              <span>INGEST NEW PDF / PHOTOS</span>
            </button>

            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0D1117] hover:bg-[#161B22] border border-[#1F2937] text-slate-300 hover:text-white font-mono text-xs tracking-wider transition-all"
            >
              <Sparkles size={13} className="text-[#FF3B30]" />
              <span>RUN 5-MIN DEMO</span>
            </button>
          </div>
        </div>

      </section>

      {/* ── 8-STAGE PIPELINE STRIP ───────────────────────────────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF3B30]"></span>
            <h2 className="font-mono text-xs font-bold tracking-widest text-slate-300 uppercase">
              END-TO-END PIPELINE ARCHITECTURE
            </h2>
          </div>
          <span className="font-mono text-[10px] text-slate-500 uppercase">
            MEMBER 1 → 6 MODULAR HANDOFFS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {pipeline.map((step, idx) => {
            const isActive = step.status === 'ACTIVE';
            const isComplete = step.status === 'COMPLETE';
            return (
              <div
                key={idx}
                className={`p-2.5 border text-left font-mono transition-all relative overflow-hidden ${
                  isActive 
                    ? 'border-[#FF3B30] bg-[#FF3B30]/15 shadow-laser' 
                    : isComplete 
                    ? 'border-emerald-900 bg-emerald-950/20 text-emerald-300' 
                    : 'border-[#1F2937] bg-[#07090D] text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="opacity-60">0{idx + 1}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-ping" />}
                </div>
                <div className={`text-xs font-bold ${isActive ? 'text-white' : isComplete ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {step.name}
                </div>
                <div className="text-[10px] opacity-75 truncate mt-0.5">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STATS COUNTER TILES ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'SYLLABUS TOPICS', val: '6', sub: 'Indexed & Weighted', color: '#06B6D4' },
          { label: 'PAST QUESTIONS', val: '8', sub: 'Extracted (2020–2024)', color: '#FF3B30' },
          { label: 'AVG OCR CONFIDENCE', val: '94.2%', sub: 'Word-level verified', color: '#A3E635' },
          { label: 'CRITICAL GAPS', val: '1', sub: 'Topic 4 has 0 notes', color: '#F59E0B' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D1117] border border-[#1F2937] p-4 relative tactical-panel">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              {stat.label}
            </div>
            <div className="font-display text-3xl sm:text-4xl text-white tracking-wide" style={{ color: stat.color }}>
              {stat.val}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              {stat.sub}
            </div>
          </div>
        ))}
      </section>

      {/* ── BENTO-STYLE DASHBOARD GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Panel 1: Lecture Board Ingestion status (6 cols) */}
        <div className="md:col-span-6 bg-[#0D1117] border border-[#1F2937] p-5 flex flex-col justify-between tactical-panel">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#1F2937] pb-2">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[#06B6D4]" />
                <h3 className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                  RECENT BOARD CAPTURE: LECTURE 14
                </h3>
              </div>
              <button 
                onClick={() => onSelectTab('notes')}
                className="text-[11px] font-mono text-[#06B6D4] hover:underline flex items-center gap-1"
              >
                <span>OPEN NOTES</span>
                <ExternalLink size={10} />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans mb-3">
              Normalized board photo from 2024-11-04. Perspective rectified to 300 DPI, glare removed, segmented into 3 text regions and 1 KaTeX equation block.
            </p>

            {/* Simulated Cleaned Board Preview */}
            <div className="p-3 bg-[#040608] border border-[#1F2937] font-mono text-xs space-y-2">
              <div className="text-slate-400 text-[11px]">
                <span className="text-[#FF3B30] font-bold">TOPIC:</span> Normalization & 3NF/BCNF (Unit 2)
              </div>
              <div className="p-2 bg-[#090D13] border-l-2 border-[#FF3B30] text-emerald-400 text-xs font-mono">
                $$ X \rightarrow Y \iff \forall t_1, t_2 \in r(R), [t_1[X] = t_2[X] \implies t_1[Y] = t_2[Y]] $$
              </div>
              <div className="text-[10px] text-amber-400 flex items-center gap-1">
                <AlertTriangle size={11} />
                <span>2 low-confidence OCR words detected (decompostion, dependancies)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">WORD CONFIDENCE: 88.4%</span>
            <button
              onClick={() => onSelectTab('notes')}
              className="text-[#FF3B30] hover:underline flex items-center gap-1 font-bold"
            >
              <span>REVIEW OCR CORRECTIONS</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Panel 2: Study Priority Leaderboard (6 cols) */}
        <div className="md:col-span-6 bg-[#0D1117] border border-[#1F2937] p-5 flex flex-col justify-between tactical-panel">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#1F2937] pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-[#FF3B30]" />
                <h3 className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                  HIGH-YIELD STUDY PRIORITY (MARKS / EFFORT)
                </h3>
              </div>
              <button 
                onClick={() => onSelectTab('insights')}
                className="text-[11px] font-mono text-[#FF3B30] hover:underline flex items-center gap-1"
              >
                <span>VIEW INSIGHTS</span>
                <ExternalLink size={10} />
              </button>
            </div>

            <div className="space-y-3">
              {topics.slice(0, 4).map((t, i) => (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-medium">
                      #{i + 1} {t.name}
                    </span>
                    <span className="font-bold text-[#FF3B30]">
                      {t.priority_score?.toFixed(2) || '0.00'} M/HR
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#1F2937] overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${((t.priority_score || 0) / 10) * 100}%`,
                        backgroundColor: t.color 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{t.total_marks_historical || 0} total marks historical</span>
                    <span>{t.effort_hours || 0}h estimated effort</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">FORMULA: TOTAL_MARKS / EFFORT_HOURS</span>
            <button
              onClick={() => onSelectTab('planner')}
              className="text-[#FF3B30] hover:underline flex items-center gap-1 font-bold"
            >
              <span>INJECT INTO PLANNER</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Panel 3: Critical Coverage Gap Alert (12 cols) */}
        <div className="md:col-span-12 bg-amber-950/20 border border-amber-500/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
                SYLLABUS COVERAGE GAP DETECTED: UNIT 4 INDEXING & B+ TREES
              </div>
              <div className="text-xs text-slate-300 font-sans mt-0.5">
                Asked in past papers 4 times (28 historical marks), but <strong className="text-white">NO lecture notes exist</strong> in the database.
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('insights')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold tracking-wider shrink-0 transition-all shadow-md"
          >
            RESOLVE GAP IN PLANNER
          </button>
        </div>

      </div>

    </div>
  );
};
