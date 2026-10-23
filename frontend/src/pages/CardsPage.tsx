import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  RotateCw, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  FileQuestion,
  FileText,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { Flashcard, Question, DocumentInfo } from '../types';

export const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [c, q, docs] = await Promise.all([
          api.getFlashcards(),
          api.getQuestions(),
          api.getDocuments(),
        ]);
        setCards(c || []);
        setQuestions(q || []);
        setDocuments(docs || []);

        // Default to the first document with cards if available, or 'all'
        const firstDocWithCards = (docs || []).find((d) => d.flashcard_count > 0);
        if (firstDocWithCards) {
          setSelectedDocId(firstDocWithCards.id);
        }
      } catch (e) {
        console.warn('Error fetching cards/questions/docs:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter cards by selected document
  const filteredCards = cards.filter((c) => {
    if (selectedDocId === 'all') return true;
    return c.document_id === selectedDocId;
  });

  const activeCard = filteredCards[currentIndex] || filteredCards[0];
  const linkedQuestion = activeCard?.linked_question_id
    ? questions.find((q) => q.id === activeCard.linked_question_id)
    : null;
  const activeDoc = documents.find((d) => d.id === selectedDocId);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (filteredCards.length > 0 ? (prev + 1) % filteredCards.length : 0));
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (filteredCards.length > 0 ? (prev - 1 + filteredCards.length) % filteredCards.length : 0));
  }, [filteredCards.length]);

  const handleToggleMastery = useCallback(async () => {
    if (!activeCard) return;
    try {
      const willBeMastered = !activeCard.mastered;
      const updated = await api.toggleFlashcardMastery(activeCard.id);
      setCards(updated);

      if (willBeMastered) {
        const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || 'orange';
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'purple';
        const peach = getComputedStyle(document.documentElement).getPropertyValue('--peach').trim() || 'peachpuff';
        confetti({
          particleCount: 32,
          spread: 60,
          origin: { y: 0.7 },
          colors: [primary, accent, peach],
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

  const handleGenerateCardsForDoc = async (docId: number) => {
    setIsGenerating(true);
    showToast('Extracting flashcards from uploaded document...');
    try {
      await api.generateFlashcardsForDoc(docId);
      const [c, docs] = await Promise.all([
        api.getFlashcards(),
        api.getDocuments(),
      ]);
      setCards(c || []);
      setDocuments(docs || []);
      showToast('Flashcards generated successfully! 🗂️');
    } catch (err: any) {
      showToast(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

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

  if (!isLoading && !cards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-peach text-primary flex items-center justify-center rounded-full shadow-xs">
          <Layers size={26} />
        </div>
        <h2 className="text-2xl font-bold text-ink">No flashcards yet</h2>
        <p className="text-ink-soft text-sm max-w-md">
          Upload board photos or question paper PDFs to automatically generate active recall flashcards with answer rubrics.
        </p>
      </div>
    );
  }

  // Mastery statistics for current view
  const masteredCount = filteredCards.filter((c) => c.mastered).length;
  const masteryPercentage = filteredCards.length > 0 ? Math.round((masteredCount / filteredCards.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* ── UPLOADED PDF / DECK SELECTOR BAR ───────────────────────────────── */}
      <div className="bg-bg rounded-card border border-border p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-peach flex items-center justify-center text-primary">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">Select Flashcard Deck / PDF</h2>
              <p className="text-xs text-ink-soft">
                Choose a specific uploaded paper or review all decks combined
              </p>
            </div>
          </div>

          <div className="text-xs text-ink-soft font-medium">
            Active deck: <strong className="text-primary-text">{filteredCards.length}</strong> cards
            {activeDoc && <span> ({activeDoc.file_name})</span>}
          </div>
        </div>

        {/* Horizontal Scrollable Deck Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {/* All Decks Pill */}
          <button
            onClick={() => {
              setSelectedDocId('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 ${
              selectedDocId === 'all'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-grey-card text-ink hover:bg-border/60 border-border/80'
            }`}
          >
            <span>All Uploaded Decks</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedDocId === 'all' ? 'bg-white/20 text-white' : 'bg-bg text-ink-soft'
              }`}
            >
              {cards.length}
            </span>
          </button>

          {/* Individual PDF Decks */}
          {documents.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-ink text-white border-ink shadow-xs font-bold'
                    : 'bg-grey-card text-ink hover:bg-border/60 border-border/80'
                }`}
              >
                <FileText size={13} className={isSelected ? 'text-primary' : 'text-ink-soft'} />
                <span className="truncate max-w-[130px] sm:max-w-[180px]" title={doc.file_name}>
                  {doc.file_name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-primary text-white'
                      : doc.flashcard_count > 0
                      ? 'bg-peach text-primary-text'
                      : 'bg-bg text-ink-faint'
                  }`}
                >
                  {doc.flashcard_count} cards
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOP STATS & ACTIONS BAR ───────────────────────────────────────── */}
      <div className="bg-bg rounded-card border border-border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Progress & Circular Ring */}
        <div className="flex items-center gap-4">
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
              {activeDoc ? activeDoc.file_name : 'Combined Deck'} Mastery
            </div>
            <div className="text-xs text-ink-soft mt-0.5">
              <strong className="text-primary-text">{masteredCount}</strong> of {filteredCards.length} cards mastered
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
            disabled={filteredCards.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-grey-card hover:bg-border/60 disabled:opacity-50 text-ink font-semibold text-xs rounded-pill border border-border/80 transition-colors"
          >
            <Download size={14} className="text-ink-soft" />
            <span>Export Anki deck</span>
          </button>
        </div>

      </div>

      {/* ── 3D FLIP CARD CONTAINER OR EMPTY STATE ─────────────────────────── */}
      {filteredCards.length === 0 ? (
        <div className="bg-bg rounded-card-lg border border-border p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-peach text-primary flex items-center justify-center rounded-full mx-auto">
            <BookOpen size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-ink">No cards in this deck</h3>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              {activeDoc
                ? `"${activeDoc.file_name}" does not have active recall flashcards generated yet.`
                : 'Select an uploaded document above or generate flashcards.'}
            </p>
          </div>

          {activeDoc && (
            <button
              onClick={() => handleGenerateCardsForDoc(activeDoc.id)}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-pill hover:bg-primary-hover disabled:opacity-60 transition-all shadow-xs"
            >
              <Sparkles size={14} />
              <span>{isGenerating ? 'Generating...' : 'Auto-Generate Flashcards for this PDF'}</span>
            </button>
          )}
        </div>
      ) : (
        activeCard && (
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
                        Card {currentIndex + 1} of {filteredCards.length}
                      </span>

                      {activeCard.repeat_count > 1 ? (
                        <span className="px-3 py-1 bg-peach text-primary-text text-xs font-bold rounded-pill">
                          Asked {activeCard.repeat_count}x in past exams
                        </span>
                      ) : (
                        <span className="text-xs text-ink-faint font-medium">Active Recall Prompt</span>
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
                        <span>Answer Key & Explanation</span>
                      </span>
                      <span className="text-xs text-ink-faint">Verified syllabus solution</span>
                    </div>

                    <div className="text-sm sm:text-base text-ink leading-relaxed whitespace-pre-wrap font-medium max-h-[220px] overflow-y-auto pr-2">
                      {activeCard.back}
                    </div>

                    {/* Linked Question Reference */}
                    {linkedQuestion && (
                      <div className="p-3 bg-grey-card rounded-xl border border-border/80 text-xs text-ink-soft">
                        <div className="font-bold text-primary-text mb-1 flex items-center gap-1">
                          <FileQuestion size={13} />
                          <span>Exam Context (Page {linkedQuestion.page} • {linkedQuestion.marks || 5} marks)</span>
                        </div>
                        <p className="italic text-ink line-clamp-2">
                          "{linkedQuestion.text}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-ink-soft">
                    <span>Click to flip back</span>
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
        )
      )}

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
