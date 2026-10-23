import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Flame,
  FileQuestion,
  CreditCard,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  FileText,
  Calendar
} from 'lucide-react';
import { api, USE_MOCK_FALLBACK } from '../services/api';
import { MOCK_STUDY_TASKS } from '../mocks';
import { StudyTask, DocumentInfo } from '../types';
import { NavTab } from '../components/Navbar';

interface PlannerPageProps {
  onSelectTab?: (tab: NavTab) => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({ onSelectTab }) => {
  const [daysLeft, setDaysLeft] = useState<number>(3);
  const [hoursPerDay, setHoursPerDay] = useState<number>(4.0);
  const [studyMode, setStudyMode] = useState<'cram' | 'balanced' | 'comprehensive'>('balanced');
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streakDays] = useState<number>(4);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [t, docs] = await Promise.all([
          api.generatePlan(daysLeft, hoursPerDay),
          api.getDocuments(),
        ]);
        setTasks(t || []);
        setDocuments(docs || []);
        setErrorMsg(null);
      } catch {
        if (USE_MOCK_FALLBACK) {
          const fallbackTasks = MOCK_STUDY_TASKS.map((t) => ({
            ...t,
            completed: localStorage.getItem(`task-completed-${t.id}`) === 'true',
          }));
          setTasks(fallbackTasks);
        } else {
          setTasks([]);
        }
        setErrorMsg(null);
      }
    };
    fetchInitialData();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const nextVal = !t.completed;
            if (nextVal) {
              const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#FF6B4A';
              const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8B5CF6';
              confetti({
                particleCount: 25,
                spread: 50,
                origin: { y: 0.8 },
                colors: [primary, accent, '#FDE68A'],
                disableForReducedMotion: true,
              });
            }
            return { ...t, completed: nextVal };
          }
          return t;
        })
      );
    } catch {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const nextVal = !t.completed;
            localStorage.setItem(`task-completed-${t.id}`, String(nextVal));
            return { ...t, completed: nextVal };
          }
          return t;
        })
      );
    }
  };

  const handleBuildPlan = async (customDays?: number, customHours?: number) => {
    setIsGenerating(true);
    const d = customDays ?? daysLeft;
    const h = customHours ?? hoursPerDay;
    try {
      const generated = await api.generatePlan(d, h);
      setTasks(generated || []);
      setErrorMsg(null);
    } catch {
      if (USE_MOCK_FALLBACK) {
        const fallbackTasks = MOCK_STUDY_TASKS.map((t) => ({
          ...t,
          completed: localStorage.getItem(`task-completed-${t.id}`) === 'true',
        })).filter((t) => t.day <= d);
        setTasks(fallbackTasks);
        setErrorMsg(null);
      } else {
        setTasks([]);
        setErrorMsg('Upload past exam questions or lecture notes to generate a study plan.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModeChange = (mode: 'cram' | 'balanced' | 'comprehensive') => {
    setStudyMode(mode);
    if (mode === 'cram') {
      setDaysLeft(2);
      setHoursPerDay(5.0);
      handleBuildPlan(2, 5.0);
    } else if (mode === 'balanced') {
      setDaysLeft(3);
      setHoursPerDay(4.0);
      handleBuildPlan(3, 4.0);
    } else if (mode === 'comprehensive') {
      setDaysLeft(7);
      setHoursPerDay(3.5);
      handleBuildPlan(7, 3.5);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalExpectedMarks = tasks.reduce(
    (acc, t) => acc + (t.completed ? t.expected_marks : 0),
    0
  );
  const maxPossibleMarks = tasks.reduce((acc, t) => acc + t.expected_marks, 0) || 50;

  // Documents synthesis metrics
  const totalQuestionsSynthesized = documents.reduce((acc, d) => acc + (d.question_count || 0), 0);
  const questionPapersCount = documents.filter((d) => d.question_count > 0).length;

  // Group tasks by Day
  const dayGroups: Record<number, StudyTask[]> = {};
  tasks.forEach((task) => {
    if (!dayGroups[task.day]) dayGroups[task.day] = [];
    dayGroups[task.day].push(task);
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── POST-UPLOAD EXAM BLUEPRINT SYNTHESIS BANNER ────────────────────── */}
      <section className="bg-gradient-to-r from-peach/80 via-peach/40 to-bg rounded-card-lg border border-border/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-ink">
                  AI Exam Blueprint Synthesized
                </h2>
                <span className="px-2 py-0.5 bg-status-success-bg text-status-success text-[10px] font-bold rounded-pill">
                  Live Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-soft mt-0.5 leading-relaxed">
                Aggregated <strong>{totalQuestionsSynthesized} past questions</strong> across {questionPapersCount} uploaded paper{questionPapersCount !== 1 ? 's' : ''}. 
                Your study hours are weighted directly towards questions that carry the most marks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="px-3 py-1.5 bg-bg rounded-xl border border-border/70 text-center">
              <div className="text-[10px] text-ink-soft font-semibold uppercase tracking-wider">Exam Papers</div>
              <div className="text-sm font-bold text-ink">{questionPapersCount} Analyzed</div>
            </div>
            <div className="px-3 py-1.5 bg-bg rounded-xl border border-border/70 text-center">
              <div className="text-[10px] text-ink-soft font-semibold uppercase tracking-wider">Total Questions</div>
              <div className="text-sm font-bold text-primary-text">{totalQuestionsSynthesized} Synthesized</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANNER CONFIGURATION & STUDY MODES ───────────────────────────── */}
      <section className="bg-bg rounded-card-lg border border-border p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header & Streak */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <h2 className="text-xl font-bold text-ink">Personalize your study schedule</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Choose your strategy and ExamLens will schedule high-yield topics to match your exact timeline.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-peach/70 text-primary-text rounded-pill text-xs font-bold self-start sm:self-auto">
            <Flame size={14} className="text-primary" />
            <span>{streakDays}-day streak</span>
          </div>
        </div>

        {/* Study Mode Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-ink block">Select Study Strategy</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cram Mode */}
            <button
              type="button"
              onClick={() => handleModeChange('cram')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                studyMode === 'cram'
                  ? 'bg-peach/40 border-primary shadow-xs'
                  : 'bg-grey-card hover:bg-border/50 border-border/70'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span>🚨 48h Cram Mode</span>
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5 leading-snug">
                  Focus purely on the top 80/20 highest-mark repeat questions.
                </p>
              </div>
            </button>

            {/* Balanced Mode */}
            <button
              type="button"
              onClick={() => handleModeChange('balanced')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                studyMode === 'balanced'
                  ? 'bg-peach/40 border-primary shadow-xs'
                  : 'bg-grey-card hover:bg-border/50 border-border/70'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                <Target size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span>🎯 High-Yield Balanced</span>
                  <span className="text-[9px] bg-primary text-white px-1.5 py-0.2 rounded-full font-bold">Recommended</span>
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5 leading-snug">
                  Balanced mix of past questions, lecture note formulas, and flashcards.
                </p>
              </div>
            </button>

            {/* Comprehensive Mode */}
            <button
              type="button"
              onClick={() => handleModeChange('comprehensive')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                studyMode === 'comprehensive'
                  ? 'bg-peach/40 border-primary shadow-xs'
                  : 'bg-grey-card hover:bg-border/50 border-border/70'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span>🏆 Full Mastery</span>
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5 leading-snug">
                  Covers all 5 syllabus units, derivations, and long-tail questions.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Short Controls Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          
          {/* Days Left */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-ink">Days until exam</span>
              <span className="font-bold text-base text-primary-text">{daysLeft} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={daysLeft}
              onChange={(e) => setDaysLeft(Number(e.target.value))}
              className="w-full accent-primary bg-border rounded-pill cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-faint">
              <span>1 day</span>
              <span>3 days (standard)</span>
              <span>14 days</span>
            </div>
          </div>

          {/* Hours Per Day */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-ink">Hours per day</span>
              <span className="font-bold text-base text-primary-text">{hoursPerDay.toFixed(1)} hrs</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-primary bg-border rounded-pill cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-faint">
              <span>1.0h</span>
              <span>4.0h standard</span>
              <span>8.0h sprint</span>
            </div>
          </div>

          {/* Re-generate Button */}
          <div className="md:col-span-4 flex flex-col items-end gap-2">
            <button
              onClick={() => handleBuildPlan()}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-primary hover:bg-primary-hover disabled:opacity-50 text-on-primary font-bold text-xs rounded-pill shadow-warm transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles size={15} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Optimizing roadmap...' : 'Recalibrate study plan'}</span>
            </button>
            {errorMsg && (
              <span className="text-xs text-status-danger font-medium">{errorMsg}</span>
            )}
          </div>

        </div>

      </section>

      {/* ── METRIC TILES & READINESS GAUGE ─────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Progress Card */}
        <div className="bg-bg-cream rounded-card p-5 border border-border/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-ink-soft block">
              Completed study blocks
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-primary">
                {completedTasks}
              </span>
              <span className="text-xs text-ink-soft font-medium">/ {totalTasks} blocks done</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-border/60 rounded-pill h-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-pill transition-all duration-500 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-ink-faint mt-1.5 block">
              {completionPercent}% of your study roadmap finished
            </span>
          </div>
        </div>

        {/* Target Marks Secured */}
        <div className="bg-bg-cream rounded-card p-5 border border-border/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-ink-soft block">
              Projected marks secured
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-primary">
                {totalExpectedMarks}
              </span>
              <span className="text-xs text-ink-soft font-medium">/ {maxPossibleMarks} exam marks</span>
            </div>
          </div>
          <p className="text-xs text-ink-soft mt-2 leading-relaxed">
            {completedTasks === 0
              ? 'Complete Day 1 blocks to lock in your first guaranteed marks.'
              : `Great job! You've locked in ~${totalExpectedMarks} marks from high-yield questions.`}
          </p>
        </div>

        {/* Revision Budget */}
        <div className="bg-bg-cream rounded-card p-5 border border-border/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-ink-soft block">
              Total revision budget
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-primary">
                {(daysLeft * hoursPerDay).toFixed(1)}
              </span>
              <span className="text-xs text-ink-soft font-medium">hours allocated</span>
            </div>
          </div>
          <p className="text-xs text-ink-soft mt-2">
            Paced across {daysLeft} study days ({hoursPerDay.toFixed(1)} hrs/day)
          </p>
        </div>

      </section>

      {/* ── DAY-BY-DAY TASK SCHEDULE WITH 1-CLICK LAUNCHPADS ────────────────── */}
      {tasks.length === 0 ? (
        <div className="bg-bg-cream rounded-card p-10 sm:p-14 border border-border/80 text-center space-y-4">
          <div className="w-14 h-14 bg-peach/70 rounded-full flex items-center justify-center mx-auto text-primary">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-ink">No study plan generated yet</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Upload past question papers or lecture notes. ExamLens will automatically analyze exam weighting and create a personalized day-by-day revision schedule for you.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(dayGroups).map(([dayNum, dayTasks]) => (
            <div key={dayNum} className="space-y-3">
              
              {/* Day Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-primary text-on-primary font-bold text-xs rounded-pill shadow-xs">
                    Day {dayNum}
                  </span>
                  <span className="text-sm font-bold text-ink">
                    {dayNum === '1'
                      ? 'High-Yield Core Foundations'
                      : dayNum === '2'
                      ? 'Architectures, Formulas & Proofs'
                      : 'Mock Practice & Weakness Drill'}
                  </span>
                </div>
                <div className="text-xs text-ink-soft flex items-center gap-3">
                  <span>{dayTasks.reduce((acc, t) => acc + t.duration_minutes, 0)} mins study</span>
                  <span className="text-ink-faint">•</span>
                  <span className="text-primary-text font-bold">
                    Target: ~{dayTasks.reduce((acc, t) => acc + t.expected_marks, 0)} marks
                  </span>
                </div>
              </div>

              {/* Task list for this day */}
              <div className="space-y-3">
                {dayTasks.map((task) => {
                  const isNow = task.status === 'NOW';

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-4 sm:p-5 rounded-card-lg border transition-all cursor-pointer flex flex-col gap-3.5 ${
                        task.completed
                          ? 'bg-grey-card/50 border-border/50 opacity-70'
                          : isNow
                          ? 'bg-peach/25 border-primary shadow-xs'
                          : 'bg-bg rounded-card border-border hover:border-primary/40'
                      }`}
                    >
                      {/* Top Row: Checkbox, Title, Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Checkbox button */}
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 text-ink-soft hover:text-primary transition-colors"
                            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {task.completed ? (
                              <CheckCircle2 size={22} className="text-status-success" />
                            ) : (
                              <Circle size={22} className={isNow ? 'text-primary' : 'text-ink-faint'} />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm sm:text-base font-bold ${
                                  task.completed
                                    ? 'line-through text-ink-soft'
                                    : 'text-ink'
                                }`}
                              >
                                {task.title}
                              </span>

                              {task.syllabus_unit && (
                                <span className="px-2.5 py-0.5 bg-grey-card text-ink-soft text-[11px] font-semibold rounded-pill border border-border/70">
                                  {task.syllabus_unit}
                                </span>
                              )}

                              {task.notes_missing && (
                                <span className="px-2 py-0.5 bg-peach text-primary-text font-bold text-[10px] rounded-pill flex items-center gap-1">
                                  <AlertTriangle size={11} />
                                  <span>No class notes — practice past questions</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-ink-soft mt-1.5">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock size={13} className="text-primary" />
                                <span>{task.duration_minutes} mins</span>
                              </span>
                              <span className="text-ink-faint">•</span>
                              <span className="text-primary-text font-bold">
                                +{task.expected_marks} projected marks
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 flex items-center">
                          <span
                            className={`px-3 py-1 rounded-pill text-[11px] font-bold ${
                              task.completed
                                ? 'bg-status-success-bg text-status-success'
                                : isNow
                                ? 'bg-primary text-on-primary'
                                : 'bg-border/60 text-ink-soft'
                            }`}
                          >
                            {task.completed ? 'Completed' : isNow ? 'Study Now' : 'Up next'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: 1-Click Launchpad Actions */}
                      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-ink-faint text-[11px]">
                          Quick revision tools for this topic:
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Practice Questions Deep Link */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTab?.('mock');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-grey-card hover:bg-peach/50 text-ink font-semibold rounded-pill border border-border/80 transition-colors"
                          >
                            <FileQuestion size={13} className="text-primary" />
                            <span>Practice Questions</span>
                          </button>

                          {/* Flashcards Deep Link */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTab?.('cards');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-grey-card hover:bg-peach/50 text-ink font-semibold rounded-pill border border-border/80 transition-colors"
                          >
                            <CreditCard size={13} className="text-primary" />
                            <span>Flashcards</span>
                          </button>

                          {/* Notes Deep Link */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTab?.('notes');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-grey-card hover:bg-peach/50 text-ink font-semibold rounded-pill border border-border/80 transition-colors"
                          >
                            <BookOpen size={13} className="text-primary" />
                            <span>Class Notes</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
