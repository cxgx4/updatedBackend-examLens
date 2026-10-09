import React, { useState } from 'react';
import { 
  BarChart3, AlertTriangle, TrendingUp, Calendar, 
  HelpCircle, CheckCircle2, ArrowRight, Filter, Info, Plus
} from 'lucide-react';
import { api } from '../services/api';
import { Topic, CoverageGapItem } from '../types';
import { MOCK_TOPICS, MOCK_HEATMAP_DATA, MOCK_COVERAGE_GAPS } from '../mocks';

interface InsightsPageProps {
  onNavigateToPlanner: () => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigateToPlanner }) => {
  const [topics] = useState<Topic[]>(MOCK_TOPICS);
  const [heatmap] = useState(MOCK_HEATMAP_DATA);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGapItem[]>(MOCK_COVERAGE_GAPS);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const years = [2020, 2021, 2022, 2023, 2024];

  const handleCreateStudyTask = async (gap: CoverageGapItem) => {
    await api.addGapToPlanner(gap);
    setToastMsg(`Injected study task for "${gap.topic_name}" into Planner!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredHeatmap = selectedTopicFilter 
    ? heatmap.filter(h => h.topicId === selectedTopicFilter)
    : heatmap;

  // Calculate syllabus coverage percentage
  const totalTopics = topics.length;
  const coveredTopics = topics.filter(t => t.has_lecture_notes).length;
  const coveragePercent = Math.round((coveredTopics / totalTopics) * 100);

  return (
    <div className="space-y-8 pb-16">
      
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
            <span>EXAMLENS</span>
            <span>/</span>
            <span className="text-[#FF3B30]">EXAM ENGINE</span>
            <span>/</span>
            <span>MEMBER 5 (ANALYTICS & COVERAGE)</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            STUDY PRIORITY & QUESTION RECURRENCE PATTERNS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToPlanner}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF3B30] hover:bg-[#E02D23] text-white font-mono text-xs font-bold tracking-wider shadow-laser transition-all"
          >
            <span>OPEN PLANNER</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── SYLLABUS COVERAGE SEGMENTED BAR ─────────────────────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-6 tactical-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#06B6D4]"></span>
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                SYLLABUS COVERAGE RATIO
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-sans mt-0.5">
              {coveredTopics} of {totalTopics} syllabus units have verified lecture notes. Unit 4 has critical missing coverage.
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-white font-bold">{coveragePercent}%</span>
            <span className="text-xs font-mono text-slate-400">COVERAGE</span>
          </div>
        </div>

        {/* Segmented Bar */}
        <div className="w-full h-3 bg-[#07090D] border border-[#1F2937] flex overflow-hidden">
          {topics.map((t) => (
            <div
              key={t.id}
              className={`h-full border-r border-[#07090D] transition-all relative group ${
                t.has_lecture_notes ? '' : 'bg-stripes-amber'
              }`}
              style={{
                width: `${100 / topics.length}%`,
                backgroundColor: t.has_lecture_notes ? t.color : '#F59E0B',
                opacity: t.has_lecture_notes ? 0.9 : 0.35,
              }}
              title={`${t.name}: ${t.has_lecture_notes ? 'Covered' : 'MISSING NOTES'}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 mt-3 pt-2 border-t border-[#1F2937]">
          <span>UNITS 1, 2, 3, 5 VERIFIED WITH MULTI-PAGE NOTES</span>
          <span className="text-amber-400 font-semibold">UNIT 4 (INDEXING & B-TREES) UNCOVERED</span>
        </div>
      </section>

      {/* ── SECTION: STUDY PRIORITY LEADERBOARD ─────────────────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-6 tactical-panel">
        <div className="flex items-center justify-between mb-4 border-b border-[#1F2937] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-[#FF3B30]" />
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                STUDY PRIORITY LEADERBOARD (MARKS PER HOUR OF EFFORT)
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-sans mt-0.5">
              Ranked mathematically by high-yield ROI: <code className="text-[#FF3B30] font-mono text-[11px]">PRIORITY = HISTORICAL_MARKS ÷ REVISION_EFFORT_HOURS</code>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {topics.map((topic, rank) => {
            const barWidthPercent = (topic.priority_score / 10) * 100;
            return (
              <div key={topic.id} className="p-3 bg-[#07090D] border border-[#1F2937] hover:border-slate-600 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 bg-[#161B22] border border-[#1F2937] font-mono text-xs font-bold text-white flex items-center justify-center">
                      0{rank + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {topic.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800">
                      {topic.syllabus_unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">
                      {topic.total_marks_historical} MARKS / {topic.effort_hours}h EFFORT
                    </span>
                    <span className="text-white font-bold text-sm px-2 py-0.5 bg-[#FF3B30]/20 border border-[#FF3B30]/50 text-[#FF3B30]">
                      {topic.priority_score.toFixed(2)} M/HR
                    </span>
                  </div>
                </div>

                {/* Animated Horizontal Bar */}
                <div className="w-full h-2 bg-[#121720] overflow-hidden">
                  <div 
                    className="h-full transition-all duration-700"
                    style={{ 
                      width: `${barWidthPercent}%`,
                      backgroundColor: topic.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── QUESTION RECURRENCE HEATMAP (TOPIC X YEAR) ──────────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-6 tactical-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1F2937] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#A3E635]" />
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                QUESTION RECURRENCE MATRIX (5-YEAR PAST PAPER HEATMAP)
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-sans mt-0.5">
              Frequency of questions asked per exam year. Cell brightness indicates question volume.
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-slate-400" />
            <select
              value={selectedTopicFilter || ''}
              onChange={(e) => setSelectedTopicFilter(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-1 bg-[#090D13] border border-[#1F2937] text-xs font-mono text-slate-300 focus:outline-none focus:border-[#FF3B30]"
            >
              <option value="">SHOW ALL TOPICS</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] text-slate-400 text-[11px]">
                <th className="pb-3 pl-2">TOPIC / SYLLABUS CODE</th>
                {years.map(yr => (
                  <th key={yr} className="pb-3 text-center w-20">{yr}</th>
                ))}
                <th className="pb-3 text-center">STREAK</th>
                <th className="pb-3 text-right pr-2">HISTORICAL MARKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filteredHeatmap.map((row) => (
                <tr key={row.topicId} className="hover:bg-[#121720]/80 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                      <span>{row.topicName}</span>
                      {row.isGap && (
                        <span className="px-1.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 text-[9px]">
                          NO NOTES
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">{row.code}</div>
                  </td>

                  {years.map(yr => {
                    const count = (row.years as any)[yr] || 0;
                    return (
                      <td key={yr} className="py-3 text-center">
                        <div 
                          className={`w-12 h-9 mx-auto flex items-center justify-center font-bold border transition-transform hover:scale-105 ${
                            count >= 2
                              ? 'bg-[#FF3B30] text-black border-[#FF3B30] shadow-laser'
                              : count === 1
                              ? 'bg-[#FF3B30]/30 text-white border-[#FF3B30]/60'
                              : 'bg-[#07090D] text-slate-700 border-[#1F2937]'
                          }`}
                          title={`${row.topicName} in ${yr}: ${count} questions`}
                        >
                          {count > 0 ? `${count}Q` : '—'}
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 bg-[#A3E635]/20 border border-[#A3E635]/40 text-[#A3E635] text-[10px] font-bold">
                      {row.streak} YRS STREAK
                    </span>
                  </td>

                  <td className="py-3 text-right pr-2 font-bold text-white">
                    {row.totalMarks} MARKS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── COVERAGE GAPS & ACTION LIST ─────────────────────────────────────── */}
      <section className="bg-[#0D1117] border border-[#1F2937] p-6 tactical-panel">
        <div className="flex items-center justify-between mb-4 border-b border-[#1F2937] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              COVERAGE GAP AUDIT & REMEDIATION
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            AUTO-DETECTED BY SHARED TOPIC GRAPH
          </span>
        </div>

        <div className="space-y-3">
          {coverageGaps.map((gap) => (
            <div 
              key={gap.topic_id}
              className="p-4 bg-[#07090D] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold border border-amber-500/40">
                    {gap.severity} PRIORITY
                  </span>
                  <span className="font-mono text-sm font-bold text-white">
                    {gap.topic_name} ({gap.unit})
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-sans mt-1">
                  <strong>Issue:</strong> {gap.reason}. Appeared in {gap.frequency} past papers totaling {gap.historical_marks} exam marks.
                </div>
              </div>

              <button
                onClick={() => handleCreateStudyTask(gap)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold tracking-wider shrink-0 transition-all shadow-md"
              >
                <Plus size={13} />
                <span>CREATE STUDY TASK IN PLANNER</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
