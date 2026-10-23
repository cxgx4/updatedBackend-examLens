import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowRight, 
  Upload, 
  Compass, 
  Flame,
  Sparkles
} from 'lucide-react';
import { NavTab } from '../components/Navbar';
import { api } from '../services/api';

interface BoardPageProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenExport?: () => void;
  onStartDemo: () => void;
}

export const BoardPage: React.FC<BoardPageProps> = ({
  onSelectTab,
  onOpenUpload,
  onStartDemo,
}) => {
  // Live ticking countdown to exam
  const [secondsRemaining, setSecondsRemaining] = useState(72 * 3600 + 14 * 60 + 22);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const t = await api.getTopics();
        setTopics(t || []);
      } catch (err) {
        console.warn('Could not fetch topics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);

  // Top 3 priority / weak topics to study next
  const studyNext = [...topics]
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
    .slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-card-lg bg-hero-gradient border border-border/70 p-6 sm:p-10 md:p-14 shadow-warm">
        
        {/* Soft Background Accent Blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-5">
          
          {/* Compact Exam Countdown Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-bg/90 backdrop-blur-sm border border-border text-ink rounded-pill text-xs font-semibold shadow-xs">
            <Clock size={14} className="text-primary" />
            <span>
              <strong className="text-primary-text font-bold">{hours}h {minutes}m</strong> until your exam
            </span>
          </div>

          {/* Friendly Bold Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.08]">
            Let’s get you <span className="text-primary">exam-ready.</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Snap your lecture boards or upload past papers. We’ll organize your notes, build flashcards, and make a plan so you know exactly what to study.
          </p>

          {/* ONE Primary Action Pill & Tour link */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[52px] bg-primary hover:bg-primary-hover text-on-primary font-bold text-base rounded-pill shadow-warm transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-primary-text"
            >
              <Upload size={18} strokeWidth={2.5} />
              <span>Add your notes or a past paper</span>
            </button>

            <button
              onClick={onStartDemo}
              className="flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] bg-bg hover:bg-bg-warm text-ink font-semibold text-sm rounded-pill border border-border shadow-xs transition-colors"
            >
              <Compass size={16} className="text-primary" />
              <span>Take a quick tour</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── WHAT TO STUDY NEXT ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                What to study next
              </h2>
            </div>
            <p className="text-sm text-ink-soft mt-0.5">
              High-yield topics based on past exams and your coverage gaps.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('planner')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary-text hover:text-primary transition-colors"
          >
            <span>View full study plan</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {studyNext.length > 0 ? (
            studyNext.map((topic, idx) => (
              <div
                key={topic.id || idx}
                className="bg-bg-cream rounded-card p-6 border border-border/80 flex flex-col justify-between hover:shadow-warm transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-extrabold text-primary">
                      #{idx + 1}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-peach/70 text-primary-text font-bold rounded-pill">
                      {topic.priority_score ? `${topic.priority_score.toFixed(1)} score` : 'High priority'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>

                  <p className="text-xs text-ink-soft mt-1.5">
                    {topic.total_marks_historical ? `${topic.total_marks_historical} marks in past exams` : 'Frequently tested'} 
                    {topic.effort_hours ? ` • ~${topic.effort_hours}h to master` : ''}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-soft">
                    {topic.notes_count ? `${topic.notes_count} note pages` : 'Ready to study'}
                  </span>
                  <button
                    onClick={() => onSelectTab('cards')}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-pill transition-transform active:scale-95"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))
          ) : isLoading ? (
            // Calm placeholder while loading
            [1, 2, 3].map((num) => (
              <div key={num} className="bg-bg-cream rounded-card p-6 border border-border/80 animate-pulse space-y-3">
                <div className="w-8 h-8 bg-peach rounded-full" />
                <div className="h-5 bg-border rounded w-3/4" />
                <div className="h-4 bg-border/60 rounded w-1/2" />
              </div>
            ))
          ) : (
            <div className="col-span-full bg-bg-cream rounded-card p-8 border border-border/80 text-center space-y-3">
              <div className="w-12 h-12 bg-peach/70 rounded-full flex items-center justify-center mx-auto text-primary">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">No high-yield topics analyzed yet</h3>
                <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
                  Upload past question papers or syllabus units. ExamLens will analyze mark weights and show you the top 3 highest-yield topics to focus on here.
                </p>
              </div>
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-pill transition-transform active:scale-95 shadow-xs"
              >
                <Upload size={14} />
                <span>Upload past papers</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── THREE LARGE STUDY TILES (ORIGINAL ILLUSTRATIONS) ────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Study tools
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Everything extracted from your boards and papers in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tile 1: Notes */}
          <div 
            onClick={() => onSelectTab('notes')}
            className="group cursor-pointer bg-bg rounded-card-lg p-6 sm:p-8 border border-border shadow-xs hover:shadow-warm transition-all flex flex-col justify-between"
          >
            <div>
              {/* Original Illustration: Notebook & Knowledge Spark */}
              <div className="w-16 h-16 rounded-2xl bg-peach/70 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform text-primary">
                <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="24" height="28" rx="4" className="fill-bg stroke-primary" strokeWidth="2" />
                  <line x1="11" y1="11" x2="21" y2="11" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
                  <line x1="11" y1="17" x2="25" y2="17" className="stroke-ink-soft" strokeWidth="2" strokeLinecap="round" />
                  <line x1="11" y1="23" x2="19" y2="23" className="stroke-ink-soft" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="27" cy="8" r="3" className="fill-primary" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-ink group-hover:text-primary transition-colors">
                Lecture Notes
              </h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                Clean handwritten notes, straightened board photos, and readable equations.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-primary-text">
              <span>Read notes</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 2: Flashcards */}
          <div 
            onClick={() => onSelectTab('cards')}
            className="group cursor-pointer bg-bg rounded-card-lg p-6 sm:p-8 border border-border shadow-xs hover:shadow-warm transition-all flex flex-col justify-between"
          >
            <div>
              {/* Original Illustration: Layered Flashcards */}
              <div className="w-16 h-16 rounded-2xl bg-accent-tint/60 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="8" width="20" height="24" rx="4" className="fill-accent/20 stroke-accent" strokeWidth="1.5" transform="rotate(8 10 8)" />
                  <rect x="6" y="6" width="22" height="24" rx="4" className="fill-bg stroke-accent" strokeWidth="2" />
                  <circle cx="17" cy="18" r="4" className="fill-accent/20" />
                  <path d="M15 18L16.5 19.5L19.5 16.5" className="stroke-accent" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-ink group-hover:text-primary transition-colors">
                Flashcards
              </h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                Active recall flip cards created from key definitions and board concepts.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-primary-text">
              <span>Study cards</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 3: Practice Questions */}
          <div 
            onClick={() => onSelectTab('mock')}
            className="group cursor-pointer bg-bg rounded-card-lg p-6 sm:p-8 border border-border shadow-xs hover:shadow-warm transition-all flex flex-col justify-between"
          >
            <div>
              {/* Original Illustration: Target Spark & Question */}
              <div className="w-16 h-16 rounded-2xl bg-peach/70 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="14" className="fill-bg stroke-primary" strokeWidth="2" />
                  <circle cx="18" cy="18" r="7" className="stroke-primary" strokeWidth="1.5" strokeDasharray="2 2" />
                  <path d="M16 13C16 11.5 17 11 18 11C19 11 20 11.5 20 12.5C20 13.5 18 14.5 18 16" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="18" cy="20.5" r="1.25" className="fill-ink" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-ink group-hover:text-primary transition-colors">
                Practice Questions
              </h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                Exam questions from past question papers organized by topic and mark weight.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-primary-text">
              <span>Practice questions</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
