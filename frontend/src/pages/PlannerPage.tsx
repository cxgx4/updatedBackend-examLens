import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Flame 
} from 'lucide-react';
import { api } from '../services/api';
import { MOCK_STUDY_TASKS } from '../mocks';
import { StudyTask } from '../types';

export const PlannerPage: React.FC = () => {
  const [daysLeft, setDaysLeft] = useState<number>(3);
  const [hoursPerDay, setHoursPerDay] = useState<number>(4.0);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streakDays] = useState<number>(4);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const t = await api.generatePlan(daysLeft, hoursPerDay);
        setTasks(t || []);
        setErrorMsg(null);
      } catch {
        const fallbackTasks = MOCK_STUDY_TASKS.map((t) => ({
          ...t,
          completed: localStorage.getItem(`task-completed-${t.id}`) === 'true',
        }));
        setTasks(fallbackTasks);
        setErrorMsg(null);
      }
    };
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
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

  const handleBuildPlan = async () => {
    setIsGenerating(true);
    try {
      const generated = await api.generatePlan(daysLeft, hoursPerDay);
      setTasks(generated || []);
      setErrorMsg(null);
    } catch {
      const fallbackTasks = MOCK_STUDY_TASKS.map((t) => ({
        ...t,
        completed: localStorage.getItem(`task-completed-${t.id}`) === 'true',
      })).filter((t) => t.day <= daysLeft);
      setTasks(fallbackTasks);
      setErrorMsg(null);
    } finally {
      setIsGenerating(false);
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
  const maxPossibleMarks = tasks.reduce((acc, t) => acc + t.expected_marks, 0);

  // Group tasks by Day
  const dayGroups: Record<number, StudyTask[]> = {};
  tasks.forEach((task) => {
    if (!dayGroups[task.day]) dayGroups[task.day] = [];
    dayGroups[task.day].push(task);
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── PLANNER CONFIGURATION CARD ───────────────────────────────────────── */}
      <section className="bg-bg rounded-card-lg border border-border p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <h2 className="text-xl font-bold text-ink">Set your revision pace</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Adjust your schedule and we’ll balance high-yield topics across your study days.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-peach/70 text-primary-text rounded-pill text-xs font-bold self-start sm:self-auto">
            <Flame size={14} className="text-primary" />
            <span>{streakDays}-day study streak</span>
          </div>
        </div>

        {/* Short Controls Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
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
              <span>3 days (recommended)</span>
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
              onClick={handleBuildPlan}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-primary hover:bg-primary-hover disabled:opacity-50 text-on-primary font-bold text-xs rounded-pill shadow-warm transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles size={15} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Optimizing plan...' : 'Update study plan'}</span>
            </button>
            {errorMsg && (
              <span className="text-xs text-status-danger font-medium">{errorMsg}</span>
            )}
          </div>

        </div>

      </section>

      {/* ── METRIC STAT TILES ───────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Progress Card */}
        <div className="bg-bg-cream rounded-card p-5 border border-border/80">
          <span className="text-xs font-semibold text-ink-soft block">
            Completed tasks
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-primary">
              {completedTasks}
            </span>
            <span className="text-xs text-ink-soft font-medium">/ {totalTasks} tasks</span>
          </div>
          <div className="mt-3 w-full bg-border/60 rounded-pill h-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-pill transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Expected Marks */}
        <div className="bg-bg-cream rounded-card p-5 border border-border/80">
          <span className="text-xs font-semibold text-ink-soft block">
            Target marks secured
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-primary">
              {totalExpectedMarks}
            </span>
            <span className="text-xs text-ink-soft font-medium">/ {maxPossibleMarks} exam marks</span>
          </div>
          <p className="text-xs text-ink-soft mt-2">
            Based on historical past question weighting
          </p>
        </div>

        {/* Revision Budget */}
        <div className="bg-bg-cream rounded-card p-5 border border-border/80">
          <span className="text-xs font-semibold text-ink-soft block">
            Total study hours
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-primary">
              {(daysLeft * hoursPerDay).toFixed(1)}
            </span>
            <span className="text-xs text-ink-soft font-medium">available hours</span>
          </div>
          <p className="text-xs text-ink-soft mt-2">
            {hoursPerDay}h per day across {daysLeft} days
          </p>
        </div>

      </section>

      {/* ── DAY-BY-DAY TASK SCHEDULE (GREY CARDS WITH CHECKBOXES) ─────────── */}
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
                    ? 'High-Yield Core Topics'
                    : dayNum === '2'
                    ? 'Transactions & Relational Algebra'
                    : 'Mock Practice & Formula Review'}
                </span>
              </div>
              <span className="text-xs text-ink-soft">
                {dayTasks.reduce((acc, t) => acc + t.duration_minutes, 0)} mins
              </span>
            </div>

            {/* Task list for this day */}
            <div className="space-y-2.5">
              {dayTasks.map((task) => {
                const isNow = task.status === 'NOW';

                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-4 rounded-card border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-grey-card/50 border-border/50 opacity-60'
                        : isNow
                        ? 'bg-peach/30 border-primary shadow-xs'
                        : 'bg-grey-card border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-ink-soft hover:text-primary transition-colors"
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-status-success" />
                        ) : (
                          <Circle size={20} className={isNow ? 'text-primary' : 'text-ink-faint'} />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              task.completed
                                ? 'line-through text-ink-soft'
                                : 'text-ink'
                            }`}
                          >
                            {task.title}
                          </span>

                          {task.notes_missing && (
                            <span className="px-2 py-0.5 bg-peach text-primary-text font-bold text-[10px] rounded-pill flex items-center gap-1">
                              <AlertTriangle size={11} />
                              <span>Needs notes</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-ink-soft mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{task.duration_minutes} mins</span>
                          </span>
                          <span className="text-ink-faint">•</span>
                          <span className="text-primary-text font-bold">
                            +{task.expected_marks} marks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 flex items-center self-end sm:self-auto">
                      <span
                        className={`px-3 py-1 rounded-pill text-[11px] font-bold ${
                          task.completed
                            ? 'bg-status-success-bg text-status-success'
                            : isNow
                            ? 'bg-primary text-on-primary'
                            : 'bg-border/60 text-ink-soft'
                        }`}
                      >
                        {task.completed ? 'Done' : isNow ? 'Current' : 'Up next'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
