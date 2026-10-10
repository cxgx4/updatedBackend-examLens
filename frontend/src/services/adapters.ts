import { 
  Topic, Note, Question, Flashcard, StudyTask, 
  CoverageGapItem, GraphNode, GraphLink, OCRWord, RegionBox
} from '../types';

export function adaptTopicStats(data: any[]): Topic[] {
  const colors = ['#38BDF8', '#F59E0B', '#A855F7', '#10B981', '#FF3B30', '#EC4899'];
  return data.map((t: any, index: number) => ({
    id: t.topic_id,
    topic_code: t.topic_code || `DBMS-0${t.topic_id}`,
    name: t.name,
    syllabus_unit: t.syllabus_unit || `Unit ${t.unit || 1}`,
    color: colors[index % colors.length],
    total_marks_historical: t.total_marks || 0,
    frequency: t.n_questions || 0,
    effort_hours: t.effort_hours || 2.5,
    priority_score: t.priority || 0,
    has_lecture_notes: t.has_notes || false,
    is_coverage_gap: (t.year_share >= 0.5 && !t.has_notes) // Approximate gap logic
  }));
}

export function adaptNotes(data: any[]): Note[] {
  return data.map((n: any) => {
    // Map words
    const words: OCRWord[] = (n.words || []).map((w: any) => ({
      word_id: w.word_id,
      text: w.text,
      confidence: w.confidence,
      low_confidence: w.low_confidence,
      corrected: w.corrected,
      original_text: w.original_text
    }));
    
    // Map regions (percentage coordinates)
    const regions: RegionBox[] = [];
    
    return {
      id: n.id,
      document_id: n.document_id,
      page: n.page,
      lecture_date: n.lecture_date || '',
      lecture_number: n.page, // proxy
      subject: n.subject || 'Unknown',
      topic_ids: n.topic_ids || [],
      text: n.text || '',
      latex: n.latex,
      raw_latex: n.latex,
      confidence: n.confidence || 0,
      words: words,
      regions: regions,
      raw_image_url: n.raw_image_url,
      cleaned_image_url: n.cleaned_image_url
    };
  });
}

export function adaptQuestions(data: any[]): Question[] {
  return data.map((q: any) => ({
    id: q.id,
    question_id: q.question_id || `Q-${q.id}`,
    document_id: q.document_id || 1,
    page: q.page || 1,
    year: q.year || 2024,
    exam_type: q.exam_type || 'endsem',
    section: q.section || 'A',
    marks: q.marks || 0,
    text: q.text,
    cleaned_text: q.cleaned_text || q.text,
    topic_id: q.topic_id || 1,
    repeat_group_id: q.repeat_group_id,
    repeat_count: q.repeat_count || 1,
    is_compulsory: Boolean(q.is_compulsory)
  }));
}

export function adaptGraph(data: any): { nodes: GraphNode[]; links: GraphLink[] } {
  return {
    nodes: (data.nodes || []).map((n: any) => ({
      id: n.id,
      name: n.name,
      unit: n.unit,
      weight: n.weight || 10,
      color: n.isGap ? '#F59E0B' : '#38BDF8',
      isGap: n.isGap,
      frequency: n.frequency
    })),
    links: data.links || []
  };
}

export function adaptCoverageGaps(data: any): CoverageGapItem[] {
  const gaps: CoverageGapItem[] = [];
  
  if (data.frequent_without_notes) {
    data.frequent_without_notes.forEach((item: any) => {
      gaps.push({
        topic_id: item.topic_id,
        topic_name: item.name,
        unit: item.syllabus_unit,
        historical_marks: item.expected_marks,
        frequency: item.years_asked,
        reason: 'Frequently asked but NO notes',
        severity: item.expected_marks > 15 ? 'HIGH' : (item.expected_marks > 5 ? 'MEDIUM' : 'LOW')
      });
    });
  }
  
  if (data.never_asked_topics) {
    data.never_asked_topics.forEach((item: any) => {
      gaps.push({
        topic_id: item.topic_id,
        topic_name: item.name,
        unit: item.syllabus_unit,
        historical_marks: 0,
        frequency: 0,
        reason: 'In syllabus but NEVER asked',
        severity: 'LOW'
      });
    });
  }
  
  if (data.out_of_syllabus_questions) {
    data.out_of_syllabus_questions.forEach((item: any) => {
      gaps.push({
        topic_id: 0,
        topic_name: `Question ${item.id}`,
        unit: 'Unknown',
        historical_marks: item.marks || 0,
        frequency: 1,
        reason: 'Outside standard unit',
        severity: 'LOW'
      });
    });
  }
  
  return gaps;
}

export function adaptHeatmap(data: any) {
  if (!data || !data.heatmap || !data.heatmap.topics) return [];
  
  const colors = ['#FF3B30', '#8B5CF6', '#A3E635', '#F59E0B', '#06B6D4', '#F43F5E'];
  return data.heatmap.topics.map((t: any, idx: number) => {
    const yearsObj: any = {};
    data.heatmap.years.forEach((y: number, i: number) => {
      yearsObj[y] = t.marks_by_year[i];
    });
    
    return {
      topicId: t.topic_id,
      topicName: t.name,
      code: `DBMS-0${t.topic_id}`,
      color: colors[idx % colors.length],
      years: yearsObj,
      streak: 0, // Calculate if needed
      totalMarks: t.marks_by_year.reduce((a: number, b: number) => a + b, 0)
    };
  });
}

export function adaptStudyTasks(data: any): StudyTask[] {
  if (!data || !data.days) return [];
  
  const tasks: StudyTask[] = [];
  data.days.forEach((dayInfo: any) => {
    dayInfo.blocks.forEach((block: any, idx: number) => {
      tasks.push({
        id: `task-${dayInfo.day}-${idx}-${block.topic_id}`,
        topic_id: block.topic_id,
        title: block.topic,
        duration_minutes: Math.round(block.hours * 60),
        day: dayInfo.day,
        notes_missing: block.needs_notes,
        expected_marks: block.priority,
        status: dayInfo.day === 1 ? 'NOW' : (dayInfo.day === 2 ? 'NEXT' : 'LATER'),
        completed: false
      });
    });
  });
  return tasks;
}

export function adaptFlashcards(data: any[]): Flashcard[] {
  return data.map((f: any) => {
    const isMastered = localStorage.getItem(`flashcard-mastered-${f.id}`) === 'true';
    return {
      id: f.id,
      note_id: f.note_id,
      topic_id: f.topic_id || 1,
      front: f.front,
      back: f.back,
      linked_question_id: f.linked_question_id,
      mastered: isMastered,
      repeat_count: f.repeat_count || 1
    };
  });
}
