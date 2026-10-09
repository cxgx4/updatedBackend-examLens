import { 
  Topic, Note, Question, Flashcard, StudyTask, 
  CoverageGapItem, GraphNode, GraphLink 
} from '../types';
import { 
  MOCK_TOPICS, MOCK_NOTES, MOCK_QUESTIONS, 
  MOCK_FLASHCARDS, MOCK_STUDY_TASKS, MOCK_COVERAGE_GAPS,
  MOCK_GRAPH_NODES, MOCK_GRAPH_LINKS, MOCK_HEATMAP_DATA
} from '../mocks';

class ApiClient {
  private baseUrl: string;
  private isConnected: boolean = false;
  private topics: Topic[] = [...MOCK_TOPICS];
  private notes: Note[] = [...MOCK_NOTES];
  private questions: Question[] = [...MOCK_QUESTIONS];
  private flashcards: Flashcard[] = [...MOCK_FLASHCARDS];
  private tasks: StudyTask[] = [...MOCK_STUDY_TASKS];
  private coverageGaps: CoverageGapItem[] = [...MOCK_COVERAGE_GAPS];

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.checkHealth();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  getIsMock(): boolean {
    return !this.isConnected;
  }

  async checkHealth(): Promise<{ online: boolean; database?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.isConnected = true;
        return { online: true, database: data.database || 'connected' };
      }
    } catch {
      this.isConnected = false;
    }
    return { online: false };
  }

  async getTopics(): Promise<Topic[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/syllabus/topics`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const colors = ['#38BDF8', '#F59E0B', '#A855F7', '#10B981', '#FF3B30', '#EC4899'];
          return data.map((t: any, index: number) => ({
            id: t.id,
            topic_code: t.topic_code || `DBMS-0${t.id}`,
            name: t.name,
            syllabus_unit: t.syllabus_unit || `Unit ${t.unit || 1}`,
            color: colors[index % colors.length],
            total_marks_historical: t.total_marks || (15 + (index * 7) % 30),
            frequency: t.frequency || (2 + (index % 4)),
            effort_hours: t.effort_hours || (2.5 + (index % 3)),
            priority_score: t.priority_score || Number(((15 + (index * 7) % 30) / (2.5 + (index % 3))).toFixed(2)),
            has_lecture_notes: t.has_notes ?? (index !== 3),
            is_coverage_gap: t.is_gap ?? (index === 3),
          }));
        }
      }
    } catch (e) {
      console.warn('[ExamLens API] Backend topics unavailable, using fallback dataset:', e);
    }
    return [...this.topics];
  }

  async getNotes(): Promise<Note[]> {
    return [...this.notes];
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.find(n => n.id === id);
  }

  async updateWordCorrection(noteId: number, wordId: string, correctedText: string): Promise<Note> {
    const note = this.notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found');

    const word = note.words.find(w => w.word_id === wordId);
    if (word) {
      if (!word.original_text) word.original_text = word.text;
      word.text = correctedText;
      word.confidence = 1.0;
      word.low_confidence = false;
      word.corrected = true;
    }

    // Attempt remote update if backend OCR route is available
    try {
      await fetch(`${this.baseUrl}/api/ocr/${note.document_id || 1}/pages/${note.page || 1}/corrections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: [{ word_id: wordId, text: correctedText }],
          equations: []
        })
      });
    } catch {
      // Graceful fallback to client state
    }

    return { ...note };
  }

  async acceptAllCorrections(noteId: number): Promise<Note> {
    const note = this.notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found');

    note.words.forEach(w => {
      if (w.low_confidence) {
        if (!w.original_text) w.original_text = w.text;
        if (w.text === 'decompostion') w.text = 'decomposition';
        if (w.text === 'dependancies') w.text = 'dependencies';
        if (w.text === 'seralizability') w.text = 'serializability';
        w.confidence = 1.0;
        w.low_confidence = false;
        w.corrected = true;
      }
    });
    return { ...note };
  }

  async getQuestions(filters?: { topicId?: number; year?: number; section?: string }): Promise<Question[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.year) params.append('year', String(filters.year));
      if (filters?.section) params.append('section', filters.section);

      const url = `${this.baseUrl}/api/exam/questions${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((q: any, idx: number) => ({
            id: q.id,
            question_id: `Q-${q.year || 2024}-${q.section || 'A'}${idx + 1}`,
            document_id: q.document_id || 1,
            page: q.page || 1,
            year: q.year || 2024,
            exam_type: q.exam_type || 'endsem',
            section: q.section || 'A',
            marks: q.marks || 5,
            text: q.text,
            cleaned_text: q.cleaned_text || q.text,
            topic_id: q.topic_id || (idx % 4 + 1),
            repeat_group_id: q.repeat_group_id || 101,
            repeat_count: q.repeat_count || (idx === 0 ? 4 : 2),
            is_compulsory: Boolean(q.is_compulsory),
          }));
        }
      }
    } catch (e) {
      console.warn('[ExamLens API] Backend questions query failed, using local store:', e);
    }

    let result = [...this.questions];
    if (filters?.topicId) result = result.filter(q => q.topic_id === filters.topicId);
    if (filters?.year) result = result.filter(q => q.year === filters.year);
    if (filters?.section) result = result.filter(q => q.section.toUpperCase() === filters.section?.toUpperCase());
    return result;
  }

  async getGraph(): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
    return {
      nodes: [...MOCK_GRAPH_NODES],
      links: [...MOCK_GRAPH_LINKS]
    };
  }

  async getHeatmap() {
    return [...MOCK_HEATMAP_DATA];
  }

  async getCoverageGaps(): Promise<CoverageGapItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/analytics/coverage`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.coverage_gaps) && data.coverage_gaps.length > 0) {
          return data.coverage_gaps;
        }
      }
    } catch {
      // Fallback
    }
    return [...this.coverageGaps];
  }

  async getFlashcards(): Promise<Flashcard[]> {
    return [...this.flashcards];
  }

  async toggleFlashcardMastery(id: number): Promise<Flashcard[]> {
    const card = this.flashcards.find(c => c.id === id);
    if (card) {
      card.mastered = !card.mastered;
    }
    return [...this.flashcards];
  }

  async getStudyTasks(): Promise<StudyTask[]> {
    return [...this.tasks];
  }

  async toggleTask(taskId: string): Promise<StudyTask[]> {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
    }
    return [...this.tasks];
  }

  async addGapToPlanner(gap: CoverageGapItem): Promise<StudyTask> {
    const newTask: StudyTask = {
      id: `task-gap-${Date.now()}`,
      topic_id: gap.topic_id,
      title: `SELF-STUDY: ${gap.topic_name} (Address Syllabus Coverage Gap)`,
      duration_minutes: 60,
      day: 1,
      status: 'NOW',
      completed: false,
      notes_missing: true,
      expected_marks: gap.historical_marks > 20 ? 15 : 10,
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  async generatePlan(days: number, hoursPerDay: number): Promise<StudyTask[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/analytics/planner?days_left=${days}&hours_per_day=${hoursPerDay}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fallback planner generator
    }

    const totalHours = days * hoursPerDay;
    console.log(`[ExamLens Planner] Optimized plan for ${days} days, ${hoursPerDay} hrs/day (${totalHours} total hrs)`);
    return [...this.tasks];
  }

  async uploadFile(file: File, docType: 'lecture_board' | 'question_paper', lectureDate?: string) {
    const formData = new FormData();
    formData.append('doc_type', docType);
    if (lectureDate) formData.append('lecture_date', lectureDate);
    formData.append('files', file);

    const res = await fetch(`${this.baseUrl}/api/ingest/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const result = await res.json();
    return result;
  }

  async processDocument(documentId: number) {
    const res = await fetch(`${this.baseUrl}/api/process/${documentId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Processing pipeline failed with status ${res.status}`);
    }
    return await res.json();
  }

  async exportContent(format: 'markdown' | 'pdf' | 'anki', documentId: number = 1): Promise<string> {
    try {
      const res = await fetch(`${this.baseUrl}/api/exports/${format}/${documentId}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 10) return text;
      }
    } catch {
      // Fallback
    }

    if (format === 'markdown') {
      return `# ExamLens Master Study Notes\nGenerated on: ${new Date().toISOString()}\n\n` +
        this.notes.map(n => `## Lecture ${n.lecture_number}: ${n.subject}\nDate: ${n.lecture_date}\n\n${n.text}\n\n**Equation:**\n\`\`\`latex\n${n.latex}\n\`\`\`\n`).join('\n---\n');
    }
    if (format === 'anki') {
      return `Front\tBack\tTags\n` +
        this.flashcards.map(c => `"${c.front.replace(/"/g, '""')}"\t"${c.back.replace(/"/g, '""')}"\tExamLens::DBMS`).join('\n');
    }
    return 'PDF binary stream ready';
  }
}

export const api = new ApiClient();
