import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Circle, AlertTriangle, 
  Clock, Zap, Sparkles, TrendingUp, RefreshCw, Check 
} from 'lucide-react';
import { api } from '../services/api';
import { StudyTask } from '../types';
import { MOCK_STUDY_TASKS } from '../mocks';

export const PlannerPage: React.FC = () => {
  const [daysLeft, setDaysLeft] = useState<number>(3);
  const [hoursPerDay, setHoursPerDay] = useState<number>(4.0);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(4);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const t = await api.generatePlan(daysLeft, hoursPerDay);
        setTasks(t);
        setErrorMsg(null);
      } catch (e: any) {
        setErrorMsg(e.message || 'Failed to generate plan');
      }
    };
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    await api.toggleTask(taskId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleBuildPlan = async () => {
    setIsGenerating(true);
    try {
      const generated = await api.generatePlan(daysLeft, hoursPerDay);
      setTasks(generated);
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalExpectedMarks = tasks.reduce((acc, t) => acc + (t.completed ? t.expected_marks : 0), 0);
  const maxPossibleMarks = tasks.reduce((acc, t) => acc + t.expected_marks, 0);

  // Group tasks by Day
  const dayGroups: Record<number, StudyTask[]> = {};
  tasks.forEach(task => {
    if (!dayGroups[task.day]) dayGroups[task.day] = [];
    dayGroups[task.day].push(task);
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
            <span>EXAMLENS</span>
            <span>/</span>
            <span className="text-[#FF3B30]">ANALYTICS ENGINE</span>
            <span>/</span>
            <span>DAY-WISE REVISION PLANNER</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            PRIORITIZED STUDY PLAN & TARGET REVISION
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#121720] border border-[#1F2937] font-mono text-xs text-amber-400 flex items-center gap-2">
            <Zap size={13} className="text-amber-400 fill-amber-400" />
            <span>{streakDays} DAY REVISION STREAK</span>
          </div>
        </div>
      </div>

      {/* ── INPUT CONTROL STRIP (DAYS + HOURS + GENERATOR) ──────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-6 tactical-panel">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Days Left Stepper */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                DAYS REMAINING UNTIL EXAM
              </label>
              <span className="font-display text-2xl text-white font-bold">{daysLeft} DAYS</span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={daysLeft}
              onChange={(e) => setDaysLeft(Number(e.target.value))}
              className="w-full accent-[#FF3B30] bg-[#1F2937] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>24H CRUNCH</span>
              <span>72H (STANDARD)</span>
              <span>14 DAYS</span>
            </div>
          </div>

          {/* Hours Per Day Stepper */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                COMMITTED REVISION HOURS / DAY
              </label>
              <span className="font-display text-2xl text-[#FF3B30] font-bold">{hoursPerDay.toFixed(1)} HRS</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-[#FF3B30] bg-[#1F2937] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1.0 HR (LIGHT)</span>
              <span>4.0 HRS (RECOMMENDED)</span>
              <span>8.0 HRS (INTENSIVE)</span>
            </div>
          </div>

          {/* Generate Button */}
          <div className="md:col-span-4 flex flex-col items-end gap-2">
            <button
              onClick={handleBuildPlan}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#FF3B30] hover:bg-[#E02D23] disabled:opacity-50 text-white font-mono text-xs font-bold tracking-wider transition-all shadow-laser flex items-center justify-center gap-2"
            >
              <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'OPTIMIZING SCHEDULE...' : 'RE-BUILD STUDY PLAN'}</span>
            </button>
            {errorMsg && (
              <span className="text-[10px] text-amber-400 font-mono font-bold animate-pulse">{errorMsg}</span>
            )}
          </div>

        </div>
      </section>

      {/* ── METRICS TILES ───────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Progress Ring Card */}
        <div className="bg-[#0D1117] border border-[#1F2937] p-4 flex items-center justify-between tactical-panel">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              SCHEDULE COMPLETION
            </span>
            <span className="font-display text-3xl text-white">
              {completedTasks} / {totalTasks} TASKS
            </span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-emerald-400">
              {completionPercent}%
            </span>
          </div>
        </div>

        {/* Expected Marks Harvested */}
        <div className="bg-[#0D1117] border border-[#1F2937] p-4 tactical-panel">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            EXPECTED EXAM MARKS HARVESTED
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl text-[#FF3B30]">{totalExpectedMarks}</span>
            <span className="text-xs font-mono text-slate-500">/ {maxPossibleMarks} TARGET MARKS</span>
          </div>
        </div>

        {/* Total Revision Hours */}
        <div className="bg-[#0D1117] border border-[#1F2937] p-4 tactical-panel">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            TOTAL REVISION BUDGET
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl text-cyan-400">{(daysLeft * hoursPerDay).toFixed(1)}</span>
            <span className="text-xs font-mono text-slate-500">AVAILABLE HOURS</span>
          </div>
        </div>

      </section>

      {/* ── DAY-BY-DAY TASK SCHEDULE ────────────────────────────────────────── */}
      <div className="space-y-6">
        {Object.entries(dayGroups).map(([dayNum, dayTasks]) => (
          <div key={dayNum} className="bg-[#0D1117] border border-[#1F2937] p-5 tactical-panel">
            
            {/* Day Header */}
            <div className="flex items-center justify-between mb-4 border-b border-[#1F2937] pb-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 bg-[#FF3B30] text-black font-mono text-xs font-bold shadow-sm">
                  DAY {dayNum}
                </span>
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                  {dayNum === '1' ? 'HIGH PRIORITY CRITICAL TOPICS' : dayNum === '2' ? 'ALGEBRA & TRANSACTIONS' : 'TIMED PRACTICE & SCHEMA'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {dayTasks.reduce((acc, t) => acc + t.duration_minutes, 0)} MINS TOTAL
              </span>
            </div>

            {/* Tasks in this day */}
            <div className="space-y-2.5">
              {dayTasks.map((task) => {
                const isNow = task.status === 'NOW';
                const isNext = task.status === 'NEXT';

                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3.5 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      task.completed
                        ? 'border-emerald-900/60 bg-emerald-950/20 opacity-60'
                        : isNow
                        ? 'border-[#FF3B30]/60 bg-[#FF3B30]/5 hover:border-[#FF3B30]'
                        : 'border-[#1F2937] bg-[#07090D] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button className="mt-0.5 shrink-0 text-slate-400 hover:text-white">
                        {task.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <Circle size={16} className={isNow ? 'text-[#FF3B30]' : 'text-slate-600'} />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono font-medium ${
                            task.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}>
                            {task.title}
                          </span>

                          {/* Notes Missing Flag */}
                          {task.notes_missing && (
                            <span className="px-1.5 py-0.2 bg-amber-950 text-amber-400 border border-amber-800 text-[9px] font-mono font-bold flex items-center gap-1">
                              <AlertTriangle size={10} />
                              NOTES MISSING
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {task.duration_minutes} MINS
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            +{task.expected_marks} EXPECTED MARKS
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase border ${
                        task.completed 
                          ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' 
                          : isNow 
                          ? 'border-[#FF3B30] text-[#FF3B30] bg-[#FF3B30]/20' 
                          : isNext
                          ? 'border-cyan-800 text-cyan-400 bg-cyan-950/40'
                          : 'border-slate-800 text-slate-500 bg-slate-900'
                      }`}>
                        {task.completed ? 'DONE' : task.status}
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
