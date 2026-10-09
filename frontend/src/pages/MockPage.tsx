import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, RotateCcw, Download, Sparkles, 
  HelpCircle, Eye, EyeOff, CheckCircle2, ChevronRight, BarChart2 
} from 'lucide-react';
import { Question } from '../types';
import { MOCK_QUESTIONS } from '../mocks';

export const MockPage: React.FC = () => {
  // 90 minutes countdown timer (90 * 60 = 5400 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [exportToast, setExportToast] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const toggleAnswerReveal = (qId: number) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleTextChange = (qId: number, text: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const getWordCount = (text?: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const getRecommendedLength = (marks: number) => {
    if (marks <= 2) return { min: 40, max: 80, text: '40–80 words' };
    if (marks <= 5) return { min: 150, max: 220, text: '150–220 words' };
    return { min: 350, max: 500, text: '350–500 words' };
  };

  const handleExportPaper = () => {
    const text = `# EXAMLENS MOCK EXAM PAPER - DATABASE MANAGEMENT SYSTEMS\nDuration: 90 Minutes | Total Marks: 50\n\n` +
      MOCK_QUESTIONS.slice(0, 5).map((q, i) => `Q${i + 1}. [${q.marks} Marks] (Section ${q.section})\n${q.text}\n\n`).join('\n---\n');
    
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'examlens_mock_paper_90min.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportToast('Exported Mock Paper (.md) successfully!');
    setTimeout(() => setExportToast(null), 3000);
  };

  const mockQuestions = MOCK_QUESTIONS.slice(0, 5);

  return (
    <div className="space-y-8 pb-16">
      
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
            <span>EXAMLENS</span>
            <span>/</span>
            <span className="text-[#FF3B30]">EXAM ENGINE</span>
            <span>/</span>
            <span>TIMED MOCK PRACTICE</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            SIMULATED PRACTICE PAPER WITH LENGTH HINTS
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPaper}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0D1117] hover:bg-[#161B22] border border-[#1F2937] text-slate-200 font-mono text-xs tracking-wider transition-all"
          >
            <Download size={13} />
            <span>EXPORT PAPER</span>
          </button>
        </div>
      </div>

      {/* ── TIMER & MARKS DISTRIBUTION COCKPIT ─────────────────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-6 tactical-panel">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Big Countdown Clock */}
          <div className="md:col-span-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[#1F2937] pb-4 md:pb-0 md:pr-6">
            <div className="w-14 h-14 bg-black border border-[#FF3B30] flex items-center justify-center font-display text-2xl text-[#FF3B30] shadow-laser">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                90-MINUTE EXAM TIMER
              </span>
              <div className="font-display text-4xl text-white tracking-widest">
                <span>{String(minutes).padStart(2, '0')}</span>:
                <span className="text-[#FF3B30]">{String(seconds).padStart(2, '0')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`p-2 border transition-all ${
                  timerRunning 
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300' 
                    : 'border-[#FF3B30] bg-[#FF3B30]/20 text-[#FF3B30]'
                }`}
                title={timerRunning ? 'Pause Timer' : 'Start Timer'}
              >
                {timerRunning ? <Pause size={14} /> : <Play size={14} className="fill-[#FF3B30]" />}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsRemaining(90 * 60);
                }}
                className="p-2 border border-[#1F2937] bg-[#07090D] text-slate-400 hover:text-white"
                title="Reset Timer"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Marks Distribution Mini-Chart */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 size={13} className="text-[#FF3B30]" />
                HISTORICAL MARKS WEIGHT DISTRIBUTION
              </span>
              <span className="text-white font-bold">TOTAL: 35 MARKS</span>
            </div>

            <div className="grid grid-cols-5 gap-2 font-mono text-xs">
              {mockQuestions.map((q, idx) => (
                <div key={q.id} className="p-2 bg-[#07090D] border border-[#1F2937] text-center">
                  <div className="text-[10px] text-slate-500">Q{idx + 1} ({q.section})</div>
                  <div className="text-sm font-bold text-[#FF3B30]">{q.marks}M</div>
                  <div className="text-[9px] text-emerald-400">{getRecommendedLength(q.marks).min}w</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── QUESTION LIST WITH LIVE WORD COUNTER ────────────────────────────── */}
      <div className="space-y-6">
        {mockQuestions.map((q, idx) => {
          const words = getWordCount(userAnswers[q.id]);
          const target = getRecommendedLength(q.marks);
          const isTargetMet = words >= target.min && words <= target.max;
          const isUnder = words > 0 && words < target.min;
          const isRevealed = revealedAnswers[q.id];

          return (
            <div key={q.id} className="bg-[#0D1117] border border-[#1F2937] p-6 tactical-panel space-y-4">
              
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2937] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#FF3B30] text-black font-display text-lg flex items-center justify-center font-bold">
                    Q{idx + 1}
                  </span>
                  <div>
                    <div className="font-mono text-xs text-white font-bold flex items-center gap-2">
                      <span>SECTION {q.section}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[#FF3B30]">{q.marks} MARKS</span>
                      {q.is_compulsory && (
                        <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 text-[9px] uppercase">
                          COMPULSORY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Length Recommendation Badge */}
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400">
                    RECOMMENDED: <strong className="text-white">{target.text}</strong>
                  </span>
                  <div className={`px-2 py-0.5 text-[10px] font-bold border ${
                    isTargetMet 
                      ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' 
                      : isUnder 
                      ? 'border-amber-500 bg-amber-950/60 text-amber-300'
                      : 'border-slate-800 bg-[#07090D] text-slate-500'
                  }`}>
                    {words} WORDS
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-sans text-white leading-relaxed font-medium">
                {q.text}
              </p>

              {/* User Answer Textarea */}
              <div className="space-y-1">
                <textarea
                  rows={4}
                  placeholder="Type your practice response here to calibrate answer length..."
                  value={userAnswers[q.id] || ''}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  className="w-full p-3 bg-[#07090D] border border-[#1F2937] font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#FF3B30]"
                />
              </div>

              {/* Reveal Sample Answer */}
              <div className="pt-2 border-t border-[#1F2937]">
                <button
                  onClick={() => toggleAnswerReveal(q.id)}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  {isRevealed ? <EyeOff size={13} /> : <Eye size={13} className="text-[#FF3B30]" />}
                  <span>{isRevealed ? 'HIDE SAMPLE ANSWER' : 'SHOW SAMPLE ANSWER KEY'}</span>
                </button>

                {isRevealed && (
                  <div className="mt-3 p-4 bg-[#05080C] border-l-2 border-[#FF3B30] border-y border-r border-[#1F2937] font-mono text-xs text-slate-300 space-y-2 leading-relaxed">
                    <div className="text-[10px] text-[#FF3B30] font-bold uppercase tracking-wider">
                      SAMPLE ANSWER CRITERIA:
                    </div>
                    <p>
                      1. State precise definition with formal notation.
                    </p>
                    <p>
                      2. Highlight the boundary condition where 3NF allows prime attribute on RHS, but BCNF strictly requires LHS to be superkey.
                    </p>
                    <p>
                      3. Conclude with a concrete counter-example schema: R(A, B, C) with F = &#123;AB → C, C → B&#125;.
                    </p>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Toast */}
      {exportToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{exportToast}</span>
        </div>
      )}

    </div>
  );
};
