import React, { useState } from 'react';
import { 
  FileText, Copy, Check, CheckCircle2, AlertTriangle, 
  Layers, Code, Eye, RefreshCw, Sparkles, ChevronRight, CornerDownRight 
} from 'lucide-react';
import { KatexMath } from '../components/KatexMath';
import { api } from '../services/api';
import { Note, OCRWord } from '../types';
import { MOCK_NOTES } from '../mocks';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<number>(101);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [correctionInput, setCorrectionInput] = useState<string>('');
  const [isCopiedLatex, setIsCopiedLatex] = useState<boolean>(false);
  const [latexMode, setLatexMode] = useState<'rendered' | 'raw'>('rendered');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId(prev => prev === regionId ? null : regionId);
  };

  const handleOpenWordCorrection = (word: OCRWord) => {
    setEditingWordId(word.word_id);
    // suggest common typo fix
    if (word.text === 'decompostion') setCorrectionInput('decomposition');
    else if (word.text === 'dependancies') setCorrectionInput('dependencies');
    else if (word.text === 'seralizability') setCorrectionInput('serializability');
    else setCorrectionInput(word.text);
  };

  const handleSaveWordCorrection = async (wordId: string) => {
    const updated = await api.updateWordCorrection(activeNote.id, wordId, correctionInput);
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    setEditingWordId(null);
    showToast(`Corrected word to "${correctionInput}"`);
  };

  const handleAcceptAllFixes = async () => {
    const updated = await api.acceptAllCorrections(activeNote.id);
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    showToast('Accepted all OCR fixes! High confidence achieved.');
  };

  const handleCopyLatex = () => {
    if (activeNote.latex) {
      navigator.clipboard.writeText(activeNote.latex);
      setIsCopiedLatex(true);
      setTimeout(() => setIsCopiedLatex(false), 2000);
      showToast('LaTeX copied to clipboard');
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* ── HEADER & BREADCRUMBS ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
            <span>EXAMLENS</span>
            <span>/</span>
            <span className="text-[#FF3B30]">NOTE ENGINE</span>
            <span>/</span>
            <span>MEMBER 2 (OCR & MATH)</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            STRUCTURED LECTURE NOTES & OCR CONFIDENCE
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAcceptAllFixes}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 font-mono text-xs font-semibold tracking-wider transition-all shadow-sm"
          >
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>ACCEPT ALL FIXES</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT LAYOUT: TIMELINE + SPLIT VIEW ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Vertical Lecture Timeline (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0D1117] border border-[#1F2937] p-4">
            <span className="text-xs font-mono font-bold text-white tracking-wider uppercase block mb-3 border-b border-[#1F2937] pb-2">
              LECTURE TIMELINE
            </span>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1F2937]">
              {notes.map((note) => {
                const isSelected = note.id === selectedNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setActiveRegionId(null);
                    }}
                    className={`relative cursor-pointer group transition-all`}
                  >
                    {/* Glowing Red Timeline Node */}
                    <div 
                      className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 transition-all ${
                        isSelected 
                          ? 'border-[#FF3B30] bg-[#FF3B30] shadow-laser scale-125' 
                          : 'border-slate-600 bg-[#07090D] group-hover:border-slate-400'
                      }`}
                    />

                    <div className={`p-2.5 border transition-all ${
                      isSelected 
                        ? 'border-[#FF3B30] bg-[#FF3B30]/10 shadow-laser' 
                        : 'border-[#1F2937] bg-[#090D13] hover:border-slate-700'
                    }`}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-display text-xl text-white tracking-wide">
                          LEC {note.lecture_number}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {note.lecture_date}
                        </span>
                      </div>
                      <div className="text-xs font-sans text-slate-300 truncate">
                        {note.subject}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                        <span>PAGE {note.page}</span>
                        <span className={note.confidence > 0.9 ? 'text-emerald-400' : 'text-amber-400'}>
                          {(note.confidence * 100).toFixed(1)}% CONF
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Cleaned Board Canvas with Region Overlays (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0D1117] border border-[#1F2937] p-4 flex flex-col h-full tactical-panel">
            <div className="flex items-center justify-between mb-3 border-b border-[#1F2937] pb-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                <Layers size={13} className="text-[#06B6D4]" />
                RECTIFIED BOARD IMAGE
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                CLICK REGION TO JUMP
              </span>
            </div>

            {/* Simulated Interactive Page Image Canvas */}
            <div className="relative flex-1 min-h-[380px] bg-[#05080C] border border-[#1F2937] p-4 overflow-hidden group select-none">
              
              {/* Background texture simulation */}
              <div className="absolute inset-0 bg-grid-dots opacity-40 pointer-events-none" />

              {/* Render Bounding Box Regions */}
              {activeNote.regions.map((reg) => {
                const isActive = activeRegionId === reg.id;
                const isEq = reg.type === 'equation';
                const isDiag = reg.type === 'diagram';
                
                return (
                  <div
                    key={reg.id}
                    onClick={() => handleSelectRegion(reg.id)}
                    className={`absolute cursor-pointer border-2 transition-all p-1.5 flex flex-col justify-between ${
                      isActive 
                        ? 'border-[#FF3B30] bg-[#FF3B30]/25 shadow-laser z-20' 
                        : isEq
                        ? 'border-violet-500/60 bg-violet-500/10 hover:border-violet-400'
                        : isDiag
                        ? 'border-lime-500/60 bg-lime-500/10 hover:border-lime-400'
                        : 'border-cyan-500/60 bg-cyan-500/10 hover:border-cyan-400'
                    }`}
                    style={{
                      left: `${reg.x}%`,
                      top: `${reg.y}%`,
                      width: `${reg.width}%`,
                      height: `${reg.height}%`,
                    }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase font-bold">
                      <span className={`px-1 py-0.5 ${
                        isActive ? 'bg-[#FF3B30] text-white' : 'bg-black/80 text-slate-300'
                      }`}>
                        {reg.type}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">
                        {reg.confidence ? `${(reg.confidence * 100).toFixed(0)}%` : ''}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-200 truncate mt-1">
                      {reg.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>{activeNote.regions.length} SEGMENTED REGIONS DETECTED</span>
              <span>300 DPI MATRIX RECTIFIED</span>
            </div>
          </div>
        </div>

        {/* Right Column: OCR Text & KaTeX Math with Inline Corrections (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0D1117] border border-[#1F2937] p-5 flex flex-col h-full tactical-panel">
            
            {/* Header with LaTeX toggle & Copy */}
            <div className="flex items-center justify-between mb-3 border-b border-[#1F2937] pb-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                <FileText size={13} className="text-[#FF3B30]" />
                STRUCTURED NOTE & WORD OCR
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLatexMode(latexMode === 'rendered' ? 'raw' : 'rendered')}
                  className="px-2 py-0.5 text-[10px] font-mono border border-[#1F2937] text-slate-400 hover:text-white"
                >
                  {latexMode === 'rendered' ? 'RAW LATEX' : 'RENDERED'}
                </button>
                <button
                  onClick={handleCopyLatex}
                  className="px-2 py-0.5 text-[10px] font-mono border border-[#1F2937] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {isCopiedLatex ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{isCopiedLatex ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Word-by-Word OCR Rendering Strip */}
            <div className="mb-4 p-3 bg-[#07090D] border border-[#1F2937]">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>WORD-LEVEL CONFIDENCE VERIFICATION</span>
                <span className="text-amber-400 font-semibold">AMBER = LOW CONFIDENCE (&lt;60%)</span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                {activeNote.words.map((word) => {
                  const isLow = word.low_confidence;
                  const isCorrected = word.corrected;
                  
                  return (
                    <span
                      key={word.word_id}
                      onClick={() => isLow && handleOpenWordCorrection(word)}
                      className={`relative px-1 py-0.5 transition-all cursor-pointer rounded-none ${
                        isCorrected
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : isLow
                          ? 'bg-amber-950/40 text-amber-300 border-b-2 border-amber-500 hover:bg-amber-900/60'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                      title={`Word: ${word.text} | Confidence: ${(word.confidence * 100).toFixed(0)}%`}
                    >
                      {/* Diff representation if corrected */}
                      {isCorrected && word.original_text ? (
                        <>
                          <span className="line-through text-red-400 opacity-60 mr-1">{word.original_text}</span>
                          <span className="text-emerald-400 font-bold">{word.text}</span>
                        </>
                      ) : (
                        word.text
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Inline Word Correction Popover */}
              {editingWordId && (
                <div className="mt-3 p-2.5 bg-[#161B22] border border-[#FF3B30] flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#FF3B30]">CORRECT:</span>
                  <input
                    type="text"
                    value={correctionInput}
                    onChange={(e) => setCorrectionInput(e.target.value)}
                    className="flex-1 px-2 py-1 bg-[#090D13] border border-[#1F2937] text-xs font-mono text-white focus:outline-none focus:border-[#FF3B30]"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveWordCorrection(editingWordId)}
                    className="px-3 py-1 bg-[#FF3B30] text-black font-mono text-xs font-bold shadow-sm"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => setEditingWordId(null)}
                    className="px-2 py-1 text-slate-400 hover:text-white font-mono text-xs"
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>

            {/* KaTeX Math Equation Section */}
            {activeNote.latex && (
              <div className="mb-4 p-4 bg-[#05080C] border-l-2 border-[#FF3B30] border-y border-r border-[#1F2937]">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-2">
                  <span>PIX2TEX MATH OCR EXTRACTION</span>
                  <span className="text-emerald-400 font-bold">SYNTAX VALIDATED</span>
                </div>

                {latexMode === 'rendered' ? (
                  <div className="text-center font-mono text-white text-base py-2">
                    <KatexMath math={activeNote.latex} block={true} />
                  </div>
                ) : (
                  <pre className="font-mono text-xs text-amber-300 p-2 bg-black/50 overflow-x-auto">
                    {activeNote.latex}
                  </pre>
                )}
              </div>
            )}

            {/* Note Body Text */}
            <div className="flex-1 bg-[#05080C] border border-[#1F2937] p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto">
              {activeNote.text}
            </div>

          </div>
        </div>

      </div>

      {/* Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

    </div>
  );
};
