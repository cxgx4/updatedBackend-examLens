import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Clock, 
  Calendar, 
  ChevronRight,
  Info,
  CheckCheck
} from 'lucide-react';
import { KatexMath } from '../components/KatexMath';
import { api } from '../services/api';
import { Note, OCRWord } from '../types';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number>(101);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [correctionInput, setCorrectionInput] = useState<string>('');
  const [isCopiedLatex, setIsCopiedLatex] = useState<boolean>(false);
  const [latexMode, setLatexMode] = useState<'rendered' | 'raw'>('rendered');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const n = await api.getNotes();
        setNotes(n || []);
        if (n && n.length > 0) {
          setSelectedNoteId(n[0].id);
        }
      } catch (e) {
        console.warn('Error fetching notes:', e);
      }
    };
    fetchNotes();
  }, []);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  if (!notes.length || !activeNote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-peach text-primary flex items-center justify-center rounded-full shadow-xs">
          <FileText size={26} />
        </div>
        <h2 className="text-2xl font-bold text-ink">No lecture notes yet</h2>
        <p className="text-ink-soft text-sm max-w-md">
          Upload board snapshots or lecture photos using the "Upload notes" button to generate clean transcripts and math equations.
        </p>
      </div>
    );
  }

  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId((prev) => (prev === regionId ? null : regionId));
  };

  const handleOpenWordCorrection = (word: OCRWord) => {
    setEditingWordId(word.word_id);
    if (word.text === 'decompostion') setCorrectionInput('decomposition');
    else if (word.text === 'dependancies') setCorrectionInput('dependencies');
    else if (word.text === 'seralizability') setCorrectionInput('serializability');
    else setCorrectionInput(word.text);
  };

  const handleSaveWordCorrection = async (wordId: string) => {
    if (!activeNote) return;
    try {
      const updated = await api.updateWordCorrection(activeNote.id, wordId, correctionInput);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setEditingWordId(null);
      showToast(`Updated word to "${correctionInput}"`);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAcceptAllFixes = async () => {
    if (!activeNote) return;
    const suggestedWords = activeNote.words
      .filter((w) => w.low_confidence)
      .map((w) => {
        let txt = w.text;
        if (txt === 'decompostion') txt = 'decomposition';
        if (txt === 'dependancies') txt = 'dependencies';
        if (txt === 'seralizability') txt = 'serializability';
        return { wordId: w.word_id, text: txt };
      });

    try {
      const updated = await api.acceptAllCorrections(activeNote.id, suggestedWords);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      showToast('All suggested spelling fixes applied!');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyLatex = () => {
    if (activeNote.latex) {
      navigator.clipboard.writeText(activeNote.latex);
      setIsCopiedLatex(true);
      setTimeout(() => setIsCopiedLatex(false), 2000);
      showToast('LaTeX formula copied to clipboard');
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const lowConfidenceCount = activeNote.words.filter((w) => w.low_confidence).length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── PAGE HEADER ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Lecture Notes
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Clean handwritten notes, KaTeX math equations, and word-by-word accuracy.
          </p>
        </div>

        {lowConfidenceCount > 0 && (
          <button
            onClick={handleAcceptAllFixes}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-pill shadow-warm transition-transform active:scale-95 self-start sm:self-auto"
          >
            <CheckCheck size={16} />
            <span>Accept all {lowConfidenceCount} spelling fixes</span>
          </button>
        )}
      </div>

      {/* ── MAIN CONTENT: TIMELINE + DETAILS ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Lecture List (3 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">
            Lecture Pages ({notes.length})
          </div>

          <div className="space-y-2.5">
            {notes.map((note) => {
              const isSelected = note.id === selectedNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setActiveRegionId(null);
                  }}
                  className={`p-4 rounded-card border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-peach/40 shadow-xs'
                      : 'border-border bg-grey-card/50 hover:bg-grey-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-ink">
                      Lecture {note.lecture_number}
                    </span>
                    <span className="text-xs text-ink-soft flex items-center gap-1">
                      <Calendar size={12} className="text-ink-faint" />
                      {note.lecture_date}
                    </span>
                  </div>

                  <div className="text-xs text-ink-soft mt-1 font-medium truncate">
                    {note.subject}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-ink-faint">Page {note.page}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-pill text-[11px] ${
                        note.confidence > 0.9
                          ? 'bg-status-success-bg text-status-success'
                          : 'bg-peach text-primary-text'
                      }`}
                    >
                      {Math.round(note.confidence * 100)}% accuracy
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Note Reading View (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Note Card Container */}
          <div className="bg-bg rounded-card-lg border border-border p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Note Meta & Accuracy Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
              <div>
                <span className="text-xs font-bold text-primary-text uppercase tracking-wider">
                  Unit 2 • {activeNote.subject}
                </span>
                <h2 className="text-xl font-bold text-ink mt-0.5">
                  Lecture {activeNote.lecture_number} Notes
                </h2>
              </div>

              {/* Accuracy Legend */}
              <div className="flex items-center gap-3 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-peach border border-primary/40" />
                  <span>Low confidence word</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-success-bg border border-status-success/40" />
                  <span>Corrected</span>
                </span>
              </div>
            </div>

            {/* Word-by-word OCR transcript with interactive corrections */}
            <div className="p-5 bg-grey-card rounded-2xl border border-border/70 space-y-3">
              <div className="text-xs font-bold text-ink-soft flex items-center gap-1.5">
                <Info size={14} className="text-primary" />
                <span>Transcript (click any highlighted word to correct it):</span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-sm leading-relaxed">
                {activeNote.words.map((word) => {
                  const isLow = word.low_confidence;
                  const isCorrected = word.corrected;

                  return (
                    <span
                      key={word.word_id}
                      onClick={() => isLow && handleOpenWordCorrection(word)}
                      className={`relative px-2 py-0.5 rounded-lg transition-all ${
                        isCorrected
                          ? 'bg-status-success-bg text-status-success font-medium border border-status-success/40'
                          : isLow
                          ? 'bg-peach text-primary-text font-bold cursor-pointer hover:bg-peach/80 border border-primary/30'
                          : 'text-ink hover:bg-bg/80'
                      }`}
                      title={
                        isLow
                          ? `Accuracy: ${Math.round(word.confidence * 100)}% - Click to correct`
                          : undefined
                      }
                    >
                      {isCorrected && word.original_text ? (
                        <>
                          <span className="line-through text-status-danger opacity-70 mr-1">
                            {word.original_text}
                          </span>
                          <span>{word.text}</span>
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
                <div className="mt-3 p-3 bg-bg rounded-xl border border-primary shadow-warm flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-xs font-bold text-primary shrink-0">
                    Correct word:
                  </span>
                  <input
                    type="text"
                    value={correctionInput}
                    onChange={(e) => setCorrectionInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-grey-card border border-border rounded-lg text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary-text"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleSaveWordCorrection(editingWordId)}
                      className="px-4 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-pill shadow-xs hover:bg-primary-hover"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingWordId(null)}
                      className="px-3 py-1.5 text-xs text-ink-soft hover:text-ink font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* KaTeX Math Equation Section on Cream Background */}
            {activeNote.latex && (
              <div className="p-6 bg-bg-cream rounded-2xl border border-border/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
                  <span className="flex items-center gap-1.5 text-ink font-bold">
                    <Sparkles size={14} className="text-primary" />
                    <span>Mathematical Formula (KaTeX)</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setLatexMode(latexMode === 'rendered' ? 'raw' : 'rendered')
                      }
                      className="px-3 py-1 bg-bg border border-border rounded-pill text-xs font-medium text-ink-soft hover:text-ink"
                    >
                      {latexMode === 'rendered' ? 'Show LaTeX code' : 'Show preview'}
                    </button>

                    <button
                      onClick={handleCopyLatex}
                      className="px-3 py-1 bg-bg border border-border rounded-pill text-xs font-medium text-ink-soft hover:text-primary flex items-center gap-1"
                    >
                      {isCopiedLatex ? (
                        <>
                          <Check size={12} className="text-status-success" />
                          <span className="text-status-success font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {latexMode === 'rendered' ? (
                  <div className="py-3 text-center overflow-x-auto text-ink">
                    <KatexMath math={activeNote.latex} block={true} />
                  </div>
                ) : (
                  <pre className="font-mono text-xs text-ink-soft p-3 bg-bg border border-border rounded-xl overflow-x-auto">
                    {activeNote.latex}
                  </pre>
                )}
              </div>
            )}

            {/* Note Full Explanation Text */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-ink">Summary & Concept Key</h3>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                {activeNote.text}
              </p>
            </div>

            {/* Segmented Board Regions Preview */}
            <div className="space-y-3 pt-4 border-t border-border/70">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" />
                  <span>Detected Board Regions ({activeNote.regions.length})</span>
                </span>
                <span className="text-[11px] text-ink-faint">300 DPI perspective rectified</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {activeNote.regions.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => handleSelectRegion(reg.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      activeRegionId === reg.id
                        ? 'border-primary bg-peach/40 font-bold text-primary-text'
                        : 'border-border bg-grey-card/60 text-ink-soft hover:bg-grey-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="uppercase text-[10px] font-bold tracking-wider">
                        {reg.type}
                      </span>
                      {reg.confidence && (
                        <span className="text-[10px] text-ink-faint">
                          {Math.round(reg.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate font-medium text-ink">
                      {reg.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2.5 bg-ink text-white rounded-pill text-xs font-semibold shadow-warm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-status-success" />
          <span>{feedbackToast}</span>
        </div>
      )}

    </div>
  );
};
