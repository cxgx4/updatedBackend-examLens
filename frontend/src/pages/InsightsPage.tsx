import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { Topic, CoverageGapItem } from '../types';

interface InsightsPageProps {
  onNavigateToPlanner?: () => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigateToPlanner: _onNavigateToPlanner }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGapItem[]>([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, h, g] = await Promise.all([
          api.getTopics(),
          api.getHeatmap(),
          api.getCoverageGaps(),
        ]);
        setTopics(t || []);
        setHeatmap(h || []);
        setCoverageGaps(g || []);
      } catch (e) {
        console.warn('Error fetching insights data:', e);
      }
    };
    fetchData();
  }, []);

  const years = [2020, 2021, 2022, 2023, 2024];

  const handleCreateStudyTask = async (gap: CoverageGapItem) => {
    try {
      await api.addGapToPlanner(gap);
      setToastMsg(`Added a study task for "${gap.topic_name}" to your planner!`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e) {
      console.warn(e);
    }
  };

  const filteredHeatmap = selectedTopicFilter
    ? heatmap.filter((h) => h.topicId === selectedTopicFilter)
    : heatmap;

  // Calculate syllabus coverage
  const totalTopics = topics.length;
  const coveredTopics = topics.filter((t) => t.has_lecture_notes).length;
  const coveragePercent =
    totalTopics === 0 ? 0 : Math.round((coveredTopics / totalTopics) * 100);

  const topPriorityTopic = [...topics].sort(
    (a, b) => (b.priority_score || 0) - (a.priority_score || 0)
  )[0];

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── 4 PLAIN-LANGUAGE STAT CARDS ────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Syllabus Coverage */}
        <div className="bg-bg-cream rounded-card p-6 border border-border/80 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
              Syllabus Coverage
            </span>
            <div className="text-4xl font-extrabold text-primary mt-1">
              {coveragePercent}%
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-soft leading-relaxed">
              You’ve covered {coveredTopics} of {totalTopics} syllabus units with verified notes.
            </p>
          </div>
        </div>

        {/* Card 2: Coverage Gaps */}
        <div className="bg-bg-cream rounded-card p-6 border border-border/80 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
              Attention Required
            </span>
            <div className="text-4xl font-extrabold text-primary mt-1">
              {coverageGaps.length} {coverageGaps.length === 1 ? 'topic' : 'topics'}
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Unit 4 Indexing has past exam questions but no lecture notes uploaded yet.
            </p>
          </div>
        </div>

        {/* Card 3: Top Study Priority */}
        <div className="bg-bg-cream rounded-card p-6 border border-border/80 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
              Highest Yield Topic
            </span>
            <div className="text-2xl font-extrabold text-primary mt-2 truncate">
              {topPriorityTopic?.name || 'Normalization'}
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Gives you the highest return in exam marks per hour of revision effort.
            </p>
          </div>
        </div>

        {/* Card 4: Recurrence Streak */}
        <div className="bg-bg-cream rounded-card p-6 border border-border/80 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
              Exam Recurrence
            </span>
            <div className="text-4xl font-extrabold text-primary mt-1">
              5 years
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-soft leading-relaxed">
              SQL and Normalization have appeared consistently every single exam year.
            </p>
          </div>
        </div>

      </section>

      {/* ── HIGH-YIELD PRIORITY LEADERBOARD ─────────────────────────────────── */}
      <section className="bg-bg rounded-card-lg border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/80">
          <div>
            <h2 className="text-xl font-bold text-ink">Topic Priority Leaderboard</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Ranked by exam marks earned per hour of study effort.
            </p>
          </div>
          <span className="text-xs text-primary-text font-bold bg-peach/70 px-3 py-1 rounded-pill self-start sm:self-auto">
            Takeaway: Study #1 and #2 first for the biggest mark boost.
          </span>
        </div>

        <div className="space-y-3.5">
          {topics.map((topic, rank) => {
            const barWidthPercent = ((topic.priority_score || 0) / 10) * 100;
            return (
              <div
                key={topic.id}
                className="p-4 bg-grey-card rounded-2xl border border-border/70 hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-peach text-primary font-bold text-xs flex items-center justify-center">
                      #{rank + 1}
                    </span>
                    <span className="font-bold text-sm text-ink">{topic.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-bg border border-border rounded-pill text-ink-soft font-medium">
                      {topic.syllabus_unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-ink-soft">
                      {topic.total_marks_historical} marks • {topic.effort_hours}h effort
                    </span>
                    <span className="font-extrabold text-primary-text bg-peach/80 px-2.5 py-0.5 rounded-pill">
                      {topic.priority_score.toFixed(1)} pts/hr
                    </span>
                  </div>
                </div>

                {/* Soft Progress Bar */}
                <div className="w-full bg-border/60 rounded-pill h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-pill transition-all duration-500"
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── QUESTION RECURRENCE MATRIX (HEATMAP) ────────────────────────────── */}
      <section className="bg-bg rounded-card-lg border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div>
            <h2 className="text-xl font-bold text-ink">5-Year Past Exam Recurrence</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Frequency of questions tested per year across previous university papers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-primary" />
            <select
              value={selectedTopicFilter || ''}
              onChange={(e) =>
                setSelectedTopicFilter(e.target.value ? Number(e.target.value) : null)
              }
              aria-label="Filter topic recurrence"
              className="px-3 py-1.5 bg-grey-card border border-border rounded-pill text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary-text"
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-ink-soft text-xs">
                <th className="pb-3 pl-2 font-semibold">Topic</th>
                {years.map((yr) => (
                  <th key={yr} className="pb-3 text-center w-16 font-semibold">
                    {yr}
                  </th>
                ))}
                <th className="pb-3 text-center font-semibold">Streak</th>
                <th className="pb-3 text-right pr-2 font-semibold">Historical Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredHeatmap.map((row) => (
                <tr key={row.topicId} className="hover:bg-grey-card/50 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="font-bold text-ink flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <span>{row.topicName}</span>
                      {row.isGap && (
                        <span className="px-2 py-0.5 bg-peach text-primary-text font-bold text-[10px] rounded-pill">
                          No notes
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-faint mt-0.5">{row.code}</div>
                  </td>

                  {years.map((yr) => {
                    const count = (row.years as any)[yr] || 0;
                    return (
                      <td key={yr} className="py-3.5 text-center">
                        <div
                          className={`w-11 h-8 mx-auto flex items-center justify-center font-bold rounded-xl transition-transform ${
                            count >= 2
                              ? 'bg-primary text-on-primary shadow-xs'
                              : count === 1
                              ? 'bg-peach text-primary-text'
                              : 'bg-grey-card text-ink-faint'
                          }`}
                          title={`${row.topicName} in ${yr}: ${count} questions`}
                        >
                          {count > 0 ? `${count}Q` : '—'}
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3.5 text-center">
                    <span className="px-2.5 py-1 bg-peach/70 text-primary-text text-xs font-bold rounded-pill">
                      {row.streak} yrs
                    </span>
                  </td>

                  <td className="py-3.5 text-right pr-2 font-bold text-ink">
                    {row.totalMarks} marks
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── COVERAGE GAP AUDIT & REMEDIATION ─────────────────────────────────── */}
      <section className="bg-bg rounded-card-lg border border-border p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <AlertTriangle size={18} className="text-primary" />
          <h2 className="text-xl font-bold text-ink">Coverage Gap Audit</h2>
        </div>

        <div className="space-y-3">
          {coverageGaps.map((gap) => (
            <div
              key={gap.topic_id}
              className="p-5 bg-grey-card rounded-2xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-peach text-primary-text font-bold text-xs rounded-pill">
                    {gap.severity} priority gap
                  </span>
                  <span className="font-bold text-sm text-ink">
                    {gap.topic_name} ({gap.unit})
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  Appeared in {gap.frequency} past exams ({gap.historical_marks} marks), but has no notes yet.
                </p>
              </div>

              <button
                onClick={() => handleCreateStudyTask(gap)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-pill shadow-warm shrink-0 transition-transform active:scale-95"
              >
                <Plus size={14} />
                <span>Add study task to planner</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2.5 bg-ink text-white rounded-pill text-xs font-semibold shadow-warm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-status-success" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
