import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Question } from '../types';
import { api } from '../services/api';

export const MockPage: React.FC = () => {
  // 90 minutes countdown timer (5400 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<string>('all');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = await api.getQuestions();
        setQuestions(q || []);
      } catch (e) {
        console.warn('Error fetching questions:', e);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const toggleAnswerReveal = (qId: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleTextChange = (qId: number, text: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: text }));
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
    const text =
      `# EXAMLENS PRACTICE QUESTIONS - DATABASE MANAGEMENT SYSTEMS\nDuration: 90 Minutes | Total Marks: 50\n\n` +
      questions
        .slice(0, 5)
        .map(
          (q, i) =>
            `Q${i + 1}. [${q.marks} Marks] (Section ${q.section})\n${q.text}\n\n`
        )
        .join('\n---\n');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'examlens_practice_paper.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportToast('Exported practice paper as Markdown');
    setTimeout(() => setExportToast(null), 3000);
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedSection === 'all') return true;
    return q.section.toLowerCase() === selectedSection.toLowerCase();
  });

  const activeQuestion = filteredQuestions[activeQuestionIndex] || filteredQuestions[0];

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-peach text-primary flex items-center justify-center rounded-full shadow-xs">
          <BookOpen size={26} />
        </div>
        <h2 className="text-2xl font-bold text-ink">No practice questions yet</h2>
        <p className="text-ink-soft text-sm max-w-md">
          Upload past exam papers to extract question items, mark distributions, and sample answer keys.
        </p>
      </div>
    );
  }

  const words = getWordCount(userAnswers[activeQuestion?.id]);
  const target = getRecommendedLength(activeQuestion?.marks || 5);
  const isTargetMet = words >= target.min && words <= target.max;
  const isRevealed = revealedAnswers[activeQuestion?.id];

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── TOP TIMER & EXPORT BAR ────────────────────────────────────────── */}
      <div className="bg-bg rounded-card border border-border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Exam Timer */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-peach text-primary flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-xs font-semibold text-ink-soft block">
              90-Minute Practice Timer
            </span>
            <div className="font-bold text-xl text-ink">
              <span>{String(minutes).padStart(2, '0')}</span>:
              <span className="text-primary">{String(seconds).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="p-2 rounded-pill bg-grey-card hover:bg-border/60 text-ink transition-colors"
              title={timerRunning ? 'Pause' : 'Start'}
              aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
            >
              {timerRunning ? <Pause size={14} /> : <Play size={14} className="fill-primary text-primary" />}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setSecondsRemaining(90 * 60);
              }}
              className="p-2 rounded-pill bg-grey-card hover:bg-border/60 text-ink-soft hover:text-ink transition-colors"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Filter Chip & Export Action */}
        <div className="flex items-center gap-2.5">
          {/* Collapsible Filter Chip */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-grey-card hover:bg-border/60 text-ink font-semibold text-xs rounded-pill border border-border/80 transition-colors"
            >
              <Filter size={13} className="text-primary" />
              <span>Section: {selectedSection === 'all' ? 'All' : selectedSection.toUpperCase()}</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-44 p-2 bg-bg rounded-2xl border border-border shadow-warm-lg z-30 space-y-1 text-xs">
                {['all', 'A', 'B'].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setSelectedSection(sec);
                      setActiveQuestionIndex(0);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors ${
                      selectedSection === sec
                        ? 'bg-primary-tint text-primary-text font-bold'
                        : 'text-ink-soft hover:bg-grey-card'
                    }`}
                  >
                    {sec === 'all' ? 'All Sections' : `Section ${sec}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleExportPaper}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-grey-card hover:bg-border/60 text-ink font-semibold text-xs rounded-pill border border-border/80 transition-colors"
          >
            <Download size={14} className="text-ink-soft" />
            <span>Export paper</span>
          </button>
        </div>

      </div>

      {/* ── QUESTION DISPLAY (ONE AT A TIME) ──────────────────────────────── */}
      {activeQuestion && (
        <div className="bg-bg rounded-card-lg border border-border p-6 sm:p-10 shadow-xs space-y-6 max-w-3xl mx-auto">
          
          {/* Question Nav & Meta */}
          <div className="flex items-center justify-between pb-4 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-peach text-primary font-bold text-sm flex items-center justify-center">
                Q{activeQuestionIndex + 1}
              </span>
              <div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <span>Section {activeQuestion.section}</span>
                  <span className="text-ink-faint">•</span>
                  <span className="text-primary-text">{activeQuestion.marks} Marks</span>
                  {activeQuestion.is_compulsory && (
                    <span className="px-2 py-0.5 bg-status-danger-bg text-status-danger text-[10px] font-bold rounded-pill">
                      Compulsory
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stepper controls */}
            <div className="flex items-center gap-1.5 text-xs text-ink-soft">
              <button
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Previous question"
                className="w-8 h-8 rounded-pill flex items-center justify-center bg-grey-card hover:bg-border/60 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold text-ink px-1">
                {activeQuestionIndex + 1} / {filteredQuestions.length}
              </span>
              <button
                disabled={activeQuestionIndex >= filteredQuestions.length - 1}
                onClick={() =>
                  setActiveQuestionIndex((prev) =>
                    Math.min(filteredQuestions.length - 1, prev + 1)
                  )
                }
                aria-label="Next question"
                className="w-8 h-8 rounded-pill flex items-center justify-center bg-grey-card hover:bg-border/60 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-ink leading-relaxed">
              {activeQuestion.text}
            </h2>
            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <span>Target length: <strong className="text-ink font-semibold">{target.text}</strong></span>
              <span className="text-ink-faint">•</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-pill ${
                  isTargetMet
                    ? 'bg-status-success-bg text-status-success'
                    : words > 0
                    ? 'bg-peach text-primary-text'
                    : 'bg-grey-card text-ink-soft'
                }`}
              >
                {words} words written
              </span>
            </div>
          </div>

          {/* Answer Textarea */}
          <div className="space-y-2">
            <textarea
              rows={6}
              placeholder="Type your practice response here to calibrate your timing and depth..."
              value={userAnswers[activeQuestion.id] || ''}
              onChange={(e) => handleTextChange(activeQuestion.id, e.target.value)}
              className="w-full p-4 bg-grey-card rounded-2xl border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-text transition-all leading-relaxed"
            />
          </div>

          {/* Sample Answer Key Accordion */}
          <div className="pt-2">
            <button
              onClick={() => toggleAnswerReveal(activeQuestion.id)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary-text hover:text-primary transition-colors"
            >
              {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{isRevealed ? 'Hide sample answer criteria' : 'Show sample answer criteria'}</span>
            </button>

            {isRevealed && (
              <div className="mt-4 p-5 bg-bg-cream rounded-2xl border border-border/80 text-xs sm:text-sm text-ink-soft space-y-2.5 leading-relaxed">
                <div className="text-xs font-bold text-primary uppercase tracking-wider">
                  Model Answer Criteria & Points:
                </div>
                <p>1. State definition clearly with proper notations and keywords.</p>
                <p>2. Show boundary cases and comparative examples directly addressing Section {activeQuestion.section} expectations.</p>
                <p>3. Conclude with a real-world schema or counter-example illustrating the concept.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Toast */}
      {exportToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2.5 bg-ink text-white rounded-pill text-xs font-semibold shadow-warm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-status-success" />
          <span>{exportToast}</span>
        </div>
      )}

    </div>
  );
};
