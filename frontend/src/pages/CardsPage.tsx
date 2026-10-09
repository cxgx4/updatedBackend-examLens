import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, RotateCw, CheckCircle2, Circle, 
  ArrowLeft, ArrowRight, Download, Sparkles, HelpCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { Flashcard, Question } from '../types';
import { MOCK_FLASHCARDS, MOCK_QUESTIONS } from '../mocks';

export const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>(MOCK_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCard = cards[currentIndex] || cards[0];
  const linkedQuestion = activeCard?.linked_question_id 
    ? MOCK_QUESTIONS.find(q => q.id === activeCard.linked_question_id)
    : null;

  // Keyboard navigation: Space = flip, Left/Right = nav, G = got it
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key.toLowerCase() === 'g') {
        handleToggleMastery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards, isFlipped]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const handleToggleMastery = async () => {
    const updated = await api.toggleFlashcardMastery(activeCard.id);
    setCards(updated);
    showToast(`Toggled mastery for Card #${currentIndex + 1}`);
  };

  const handleExportAnki = async () => {
    const csv = await api.exportContent('anki');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'examlens_flashcards.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Exported Anki CSV deck successfully!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Metrics
  const masteredCount = cards.filter(c => c.mastered).length;
  const masteryPercentage = Math.round((masteredCount / cards.length) * 100);

  return (
    <div className="space-y-8 pb-16">
      
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
            <span>EXAMLENS</span>
            <span>/</span>
            <span className="text-[#FF3B30]">KNOWLEDGE MEMORY</span>
            <span>/</span>
            <span>MEMBER 4 (ANKI FLASHCARDS)</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            3D SPACED REPETITION FLASHCARDS & ANKI DECK
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAnki}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF3B30] hover:bg-[#E02D23] text-white font-mono text-xs font-bold tracking-wider shadow-laser transition-all"
          >
            <Download size={13} />
            <span>EXPORT ANKI CSV</span>
          </button>
        </div>
      </div>

      {/* ── MASTERY PROGRESS BAR ───────────────────────────────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-5 tactical-panel">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
            <CreditCard size={14} className="text-[#A3E635]" />
            <span>DECK RETENTION PROGRESS</span>
          </div>
          <span className="font-mono text-xs text-emerald-400 font-bold">
            {masteredCount} OF {cards.length} MASTERED ({masteryPercentage}%)
          </span>
        </div>

        <div className="w-full h-2 bg-[#07090D] border border-[#1F2937] overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
          <span>SHORTCUTS: [SPACE] FLIP • [← / →] NAVIGATE • [G] TOGGLE GOT IT</span>
          <span className="text-slate-400">ANKI ALIGNED (FRONT/BACK/TAGS)</span>
        </div>
      </section>

      {/* ── 3D FLIP CARD CONTAINER ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
        
        {/* Card Component with 3D Flip */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-96 [perspective:1200px] cursor-pointer group"
        >
          <motion.div
            className="w-full h-full relative [transform-style:preserve-3d] transition-all duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            {/* FRONT FACE */}
            <div className="absolute inset-0 [backface-visibility:hidden] bg-[#0D1117] border-2 border-[#1F2937] group-hover:border-slate-500 p-8 flex flex-col justify-between tactical-panel shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[#1F2937] pb-3">
                  <span className="font-mono text-xs text-[#FF3B30] font-bold">
                    CARD #{currentIndex + 1} OF {cards.length}
                  </span>
                  
                  {activeCard.repeat_count > 1 && (
                    <span className="px-2 py-0.5 bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/50 font-mono text-[10px] font-bold">
                      ASKED {activeCard.repeat_count}X IN PAST PAPERS
                    </span>
                  )}
                </div>

                <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-2">
                  CONCEPT PROMPT
                </div>
                <h3 className="text-xl sm:text-2xl font-sans text-white font-semibold leading-relaxed">
                  {activeCard.front}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1F2937] text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <RotateCw size={12} />
                  <span>CLICK OR SPACEBAR TO FLIP REVEAL</span>
                </span>
                <span>STATUS: {activeCard.mastered ? 'MASTERED' : 'UNREVIEWED'}</span>
              </div>
            </div>

            {/* BACK FACE (Rotated 180deg) */}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#07090D] border-2 border-[#FF3B30] p-8 flex flex-col justify-between tactical-panel shadow-laser">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#1F2937] pb-2">
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    CANONICAL ANSWER KEY
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    LATEX SYLLABUS ALIGNED
                  </span>
                </div>

                <div className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activeCard.back}
                </div>

                {/* Linked Past Exam Question */}
                {linkedQuestion && (
                  <div className="mt-4 p-3 bg-[#0D1117] border border-[#1F2937] font-mono text-[11px] text-slate-400">
                    <span className="text-[#FF3B30] font-bold block mb-1">
                      LINKED PAST EXAM QUESTION ({linkedQuestion.year} • {linkedQuestion.marks}M):
                    </span>
                    <p className="italic text-slate-300 line-clamp-2">
                      "{linkedQuestion.text}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1F2937] text-xs font-mono text-slate-500">
                <span>PRESS [G] TO MARK MASTERED</span>
                <span className="text-emerald-400">VERIFIED ANSWER</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card Controls & Navigation Buttons */}
        <div className="flex items-center justify-between w-full max-w-lg">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0D1117] hover:bg-[#161B22] border border-[#1F2937] text-slate-300 text-xs font-mono tracking-wider transition-all"
          >
            <ArrowLeft size={13} />
            <span>PREV</span>
          </button>

          <button
            onClick={handleToggleMastery}
            className={`flex items-center gap-2 px-5 py-2 font-mono text-xs font-bold tracking-wider border transition-all ${
              activeCard.mastered
                ? 'border-emerald-600 bg-emerald-950 text-emerald-300 shadow-sm'
                : 'border-[#1F2937] bg-[#0D1117] text-slate-300 hover:text-white'
            }`}
          >
            {activeCard.mastered ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Circle size={14} />}
            <span>{activeCard.mastered ? 'MASTERED (G)' : 'MARK GOT IT (G)'}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0D1117] hover:bg-[#161B22] border border-[#1F2937] text-slate-300 text-xs font-mono tracking-wider transition-all"
          >
            <span>NEXT</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
