export type DocType = 'lecture_board' | 'question_paper';

export interface SharedPageContract {
  document_id: number;
  page_number: number;
  doc_type: DocType;
  image: string;
  embedded_text?: string;
  timestamp?: string;
}

export interface OCRWord {
  word_id: string;
  text: string;
  confidence: number; // 0 to 1
  low_confidence: boolean;
  corrected?: boolean;
  original_text?: string;
}

export interface RegionBox {
  id: string;
  type: 'text' | 'diagram' | 'equation';
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  confidence?: number;
  label: string;
}

export interface Note {
  id: number;
  document_id: number;
  page: number;
  lecture_date: string;
  lecture_number: number;
  subject: string;
  topic_ids: number[];
  text: string;
  latex?: string;
  raw_latex?: string;
  confidence: number;
  words: OCRWord[];
  regions: RegionBox[];
  raw_image_url: string;
  cleaned_image_url: string;
}

export interface Question {
  id: number;
  question_id: string;
  document_id: number;
  page: number;
  year: number;
  exam_type: string;
  section: string;
  marks: number;
  text: string;
  cleaned_text?: string;
  topic_id: number;
  repeat_group_id?: number;
  repeat_count: number;
  is_compulsory?: boolean;
}

export interface Topic {
  id: number;
  topic_code: string;
  name: string;
  syllabus_unit: string;
  color: string; // semantic color e.g. #F59E0B
  total_marks_historical: number;
  frequency: number;
  effort_hours: number;
  priority_score: number; // marks / effort
  has_lecture_notes: boolean;
  is_coverage_gap: boolean;
}

export interface Flashcard {
  id: number;
  note_id: number;
  topic_id: number;
  front: string;
  back: string;
  linked_question_id?: number;
  mastered: boolean;
  repeat_count: number;
}

export interface StudyTask {
  id: string;
  topic_id: number;
  title: string;
  duration_minutes: number;
  day: number;
  status: 'NOW' | 'NEXT' | 'LATER';
  completed: boolean;
  notes_missing: boolean;
  expected_marks: number;
}

export interface CoverageGapItem {
  topic_id: number;
  topic_name: string;
  unit: string;
  historical_marks: number;
  frequency: number;
  reason: 'Frequently asked but NO notes' | 'In syllabus but NEVER asked' | 'Outside standard unit';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GraphNode {
  id: number;
  name: string;
  unit: string;
  weight: number; // node radius based on marks
  color: string;
  isGap: boolean;
  frequency: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: number | GraphNode;
  target: number | GraphNode;
  strength: number;
}
