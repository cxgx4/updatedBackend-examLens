import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  RotateCw, 
  CheckCircle2, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Sparkles, 
  HelpCircle,
  FileQuestion,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Flashcard, Question } from '../types';

export const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, q] = await Promise.all([
          api.getFlashcards(),
          api.getQuestions(),
        ]);
        setCards(c || []);
        setQuestions(q || []);
      } catch (e) {
        console.warn('Error fetching cards/questions:', e);
      }
    };
    fetchData();
  }, []);

  const activeCard = cards[currentIndex] || cards[0];
  const linkedQuestion = activeCard?.linked_question_id
    ? questions.find((q) => q.id === activeCard.linked_question_id)
    : null;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (cards.length > 0 ? (prev + 1) % cards.length : 0));
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (cards.length > 0 ? (prev - 1 + cards.length) % cards.length : 0));
  }, [cards.length]);

  const handleToggleMastery = useCallback(async () => {
    if (!activeCard) return;
    try {
      const willBeMastered = !activeCard.mastered;
      const updated = await api.toggleFlashcardMastery(activeCard.id);
      setCards(updated);

      if (willBeMastered) {
        confetti({
          particleCount: 32,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF8233', '#B54DFF', '#FFE9D9'],
          disableForReducedMotion: true,
        });
        showToast('Card marked as mastered! Keep going 🎉');
      } else {
        showToast('Moved card back to study queue');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [activeCard, showToast]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
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
  }, [handleNext, handlePrev, handleToggleMastery]);

  const handleExportAnki = async () => {
    try {
      await api.exportContent('anki');
      showToast('Exported Anki CSV deck successfully!');
    } catch (e: any) {
      showToast(e.message || 'Export failed');
    }
  };

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-peach text-primary flex items-center justify-center rounded-full shadow-xs">
          <Layers size={26} />
        </div>
        <h2 className="text-2xl font-bold text-ink">No flashcards yet</h2>
        <p className="text-ink-soft text-sm max-w-md">
          Upload board photos or question papers to automatically generate active recall flashcards.
        </p>
      </div>
    );
  }

  // Mastery statistics
  const masteredCount = cards.filter((c) => c.mastered).length;
  const masteryPercentage = Math.round((masteredCount / cards.length) * 100);

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── TOP STATS & ACTIONS BAR ───────────────────────────────────────── */}
      <div className="bg-bg rounded-card border border-border p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Progress & Circular Ring */}
        <div className="flex items-center gap-4">
          {/* Circular progress SVG */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-grey-card stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary stroke-current transition-all duration-500 ease-out"
                strokeDasharray={`${masteryPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-ink">
              {masteryPercentage}%
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-ink">
              Deck Mastery Progress
            </div>
            <div className="text-xs text-ink-soft mt-0.5">
              <strong className="text-primary-text">{masteredCount}</strong> of {cards.length} cards mastered
            </div>
          </div>
        </div>

        {/* Shortcuts & Anki Export */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden md:inline-flex text-xs text-ink-faint font-medium">
            Shortcuts: [Space] Flip • [←/→] Next • [G] Got it
          </span>

          <button
            onClick={handleExportAnki}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-grey-card hover:bg-border/60 text-ink font-semibold text-xs rounded-pill border border-border/80 transition-colors"
          >
            <Download size={14} className="text-ink-soft" />
            <span>Export Anki deck</span>
          </button>
        </div>

      </div>

      {/* ── 3D FLIP CARD CONTAINER ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
        
        {/* Flip Card with Smooth 3D Motion */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full min-h-[340px] [perspective:1200px] cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Flashcard. Press space or click to flip."
        >
          <motion.div
            className="w-full min-h-[340px] relative [transform-style:preserve-3d] transition-transform duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            
            {/* FRONT FACE */}
            <div className="absolute inset-0 [backface-visibility:hidden] bg-bg-cream rounded-card-lg border-2 border-border group-hover:border-primary/50 p-6 sm:p-10 flex flex-col justify-between shadow-warm transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/70">
                  <span className="text-xs font-bold text-primary-text">
                    Card {currentIndex + 1} of {cards.length}
                  </span>

                  {activeCard.repeat_count > 1 ? (
                    <span className="px-3 py-1 bg-peach text-primary-text text-xs font-bold rounded-pill">
                      Asked {activeCard.repeat_count}x in past exams
                    </span>
                  ) : (
                    <span className="text-xs text-ink-faint font-medium">Concept Key</span>
                  )}
                </div>

                <div className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-2">
                  Question / Concept
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink leading-relaxed">
                  {activeCard.front}
                </h2>
              </div>

              <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs text-ink-soft">
                <span className="flex items-center gap-1.5 font-medium">
                  <RotateCw size={13} className="text-primary" />
                  <span>Click or press [Space] to flip</span>
                </span>
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-pill ${
                    activeCard.mastered
                      ? 'bg-status-success-bg text-status-success'
                      : 'bg-border/60 text-ink-soft'
                  }`}
                >
                  {activeCard.mastered ? 'Mastered' : 'Learning'}
                </span>
              </div>
            </div>

            {/* BACK FACE (180deg) */}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-bg rounded-card-lg border-2 border-primary p-6 sm:p-10 flex flex-col justify-between shadow-warm">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <span className="text-xs font-bold text-status-success flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Answer Key</span>
                  </span>
                  <span className="text-xs text-ink-faint">Verified syllabus solution</span>
                </div>

                <div className="text-sm sm:text-base text-ink leading-relaxed whitespace-pre-wrap font-medium">
                  {activeCard.back}
                </div>

                {/* Linked Question Reference */}
                {linkedQuestion && (
                  <div className="p-3.5 bg-grey-card rounded-xl border border-border/80 text-xs text-ink-soft">
                    <div className="font-bold text-primary-text mb-1 flex items-center gap-1">
                      <FileQuestion size={13} />
                      <span>Past Exam Reference ({linkedQuestion.year} • {linkedQuestion.marks} marks)</span>
                    </div>
                    <p className="italic text-ink line-clamp-2">
                      "{linkedQuestion.text}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-ink-soft">
                <span>Click to flip back to question</span>
                <span className="text-primary-text font-bold">Press [G] to mark mastered</span>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Card Controls: Got it / Still learning / Prev / Next */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={handlePrev}
            aria-label="Previous flashcard"
            className="flex items-center justify-center w-12 h-12 bg-grey-card hover:bg-border/60 text-ink rounded-pill border border-border transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Still learning pill */}
          <button
            onClick={handleToggleMastery}
            className={`px-6 py-3 min-h-[48px] rounded-pill text-sm font-bold border transition-all ${
              !activeCard.mastered
                ? 'bg-ink text-white border-ink shadow-xs'
                : 'bg-grey-card text-ink-soft border-border hover:text-ink'
            }`}
          >
            Still learning
          </button>

          {/* Got it pill */}
          <button
            onClick={handleToggleMastery}
            className={`px-7 py-3 min-h-[48px] rounded-pill text-sm font-bold transition-all shadow-warm ${
              activeCard.mastered
                ? 'bg-status-success text-white'
                : 'bg-primary hover:bg-primary-hover text-on-primary active:scale-95'
            }`}
          >
            {activeCard.mastered ? '✓ Mastered' : 'Got it! (G)'}
          </button>

          <button
            onClick={handleNext}
            aria-label="Next flashcard"
            className="flex items-center justify-center w-12 h-12 bg-grey-card hover:bg-border/60 text-ink rounded-pill border border-border transition-colors"
          >
            <ArrowRight size={18} />
          </button>
        </div>

      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2.5 bg-ink text-white rounded-pill text-xs font-semibold shadow-warm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-status-success" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
