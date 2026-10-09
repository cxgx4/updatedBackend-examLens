import { Topic, Note, Question, Flashcard, StudyTask, CoverageGapItem, GraphNode, GraphLink } from '../types';

export const MOCK_TOPICS: Topic[] = [
  {
    id: 1,
    topic_code: 'DBMS-01',
    name: 'Normalization & Dependencies',
    syllabus_unit: 'Unit 2',
    color: '#FF3B30', // Hot red
    total_marks_historical: 42,
    frequency: 9,
    effort_hours: 4.5,
    priority_score: 9.33,
    has_lecture_notes: true,
    is_coverage_gap: false,
  },
  {
    id: 2,
    topic_code: 'DBMS-02',
    name: 'ER Modeling & Relational Schema',
    syllabus_unit: 'Unit 1',
    color: '#06B6D4', // Cyan
    total_marks_historical: 24,
    frequency: 5,
    effort_hours: 3.0,
    priority_score: 8.00,
    has_lecture_notes: true,
    is_coverage_gap: false,
  },
  {
    id: 3,
    topic_code: 'DBMS-03',
    name: 'Relational Algebra & SQL',
    syllabus_unit: 'Unit 3',
    color: '#A3E635', // Acid Lime
    total_marks_historical: 36,
    frequency: 7,
    effort_hours: 4.0,
    priority_score: 9.00,
    has_lecture_notes: true,
    is_coverage_gap: false,
  },
  {
    id: 4,
    topic_code: 'DBMS-04',
    name: 'Indexing, B+ Trees & Hashing',
    syllabus_unit: 'Unit 4',
    color: '#F59E0B', // Amber
    total_marks_historical: 28,
    frequency: 6,
    effort_hours: 3.5,
    priority_score: 8.00,
    has_lecture_notes: false, // Critical coverage gap!
    is_coverage_gap: true,
  },
  {
    id: 5,
    topic_code: 'DBMS-05',
    name: 'Transactions, ACID & Concurrency',
    syllabus_unit: 'Unit 5',
    color: '#8B5CF6', // Violet
    total_marks_historical: 38,
    frequency: 8,
    effort_hours: 4.0,
    priority_score: 9.50,
    has_lecture_notes: true,
    is_coverage_gap: false,
  },
  {
    id: 6,
    topic_code: 'DBMS-06',
    name: 'Query Processing & Optimization',
    syllabus_unit: 'Unit 4',
    color: '#F43F5E', // Rose
    total_marks_historical: 12,
    frequency: 2,
    effort_hours: 3.0,
    priority_score: 4.00,
    has_lecture_notes: true,
    is_coverage_gap: false,
  },
];

export const MOCK_NOTES: Note[] = [
  {
    id: 101,
    document_id: 1,
    page: 1,
    lecture_number: 14,
    subject: 'Database Systems',
    lecture_date: '2024-11-04',
    topic_ids: [1],
    text: `NORMALIZATION THEORY & ANOMALIES

A relation R is in First Normal Form (1NF) if and only if all underlying domains contain only atomic (indivisible) values.
Second Normal Form (2NF) enforces that no non-prime attribute is partially dependent on any candidate key:
∀ non-prime A, A is fully functionally dependent on K.

Third Normal Form (3NF) eliminates transitive functional dependencies:
For any non-trivial FD X → Y in F+:
  1. X is a superkey of R, OR
  2. Y is a prime attribute (member of some candidate key).

Boyce-Codd Normal Form (BCNF) strictly requires condition 1 for EVERY functional dependency without exception.`,
    latex: `X \\rightarrow Y \\iff \\forall t_1, t_2 \\in r(R), [t_1[X] = t_2[X] \\implies t_1[Y] = t_2[Y]]`,
    raw_latex: `X \rightarrow Y \iff \forall t_1, t_2 \in r(R), [t_1[X] = t_2[X] \implies t_1[Y] = t_2[Y]]`,
    confidence: 0.88,
    words: [
      { word_id: 'w1', text: 'NORMALIZATION', confidence: 0.99, low_confidence: false },
      { word_id: 'w2', text: 'THEORY', confidence: 0.96, low_confidence: false },
      { word_id: 'w3', text: '&', confidence: 0.95, low_confidence: false },
      { word_id: 'w4', text: 'ANOMALIES', confidence: 0.98, low_confidence: false },
      { word_id: 'w5', text: 'A', confidence: 0.99, low_confidence: false },
      { word_id: 'w6', text: 'relation', confidence: 0.98, low_confidence: false },
      { word_id: 'w7', text: 'R', confidence: 0.99, low_confidence: false },
      { word_id: 'w8', text: 'is', confidence: 0.99, low_confidence: false },
      { word_id: 'w9', text: 'in', confidence: 0.99, low_confidence: false },
      { word_id: 'w10', text: '1NF', confidence: 0.94, low_confidence: false },
      { word_id: 'w11', text: 'atomic', confidence: 0.91, low_confidence: false },
      { word_id: 'w12', text: 'decompostion', confidence: 0.48, low_confidence: true, original_text: 'decompostion' }, // flagged!
      { word_id: 'w13', text: 'preserves', confidence: 0.93, low_confidence: false },
      { word_id: 'w14', text: 'dependancies', confidence: 0.52, low_confidence: true, original_text: 'dependancies' }, // flagged!
      { word_id: 'w15', text: 'BCNF', confidence: 0.97, low_confidence: false },
      { word_id: 'w16', text: 'strictly', confidence: 0.95, low_confidence: false },
      { word_id: 'w17', text: 'enforces', confidence: 0.98, low_confidence: false },
      { word_id: 'w18', text: 'superkey', confidence: 0.92, low_confidence: false },
    ],
    regions: [
      { id: 'reg-1', type: 'text', x: 8, y: 10, width: 84, height: 26, confidence: 0.95, label: 'Title & 1NF/2NF Definitions' },
      { id: 'reg-2', type: 'equation', x: 8, y: 38, width: 84, height: 18, confidence: 0.91, label: 'FD Formal Definition (KaTeX)' },
      { id: 'reg-3', type: 'diagram', x: 12, y: 58, width: 76, height: 32, confidence: 0.89, label: 'Normal Form Hierarchy Diagram' },
    ],
    raw_image_url: '/mock/board_raw_1.jpg',
    cleaned_image_url: '/mock/board_clean_1.png',
  },
  {
    id: 102,
    document_id: 1,
    page: 2,
    lecture_number: 16,
    subject: 'Database Systems',
    lecture_date: '2024-11-08',
    topic_ids: [5],
    text: `TRANSACTION CONCURRENCY & STRICT 2PL

A transaction T is an atomic unit of execution consisting of read and write operations.
The ACID guarantee states:
- Atomicity: All or nothing execution
- Consistency: State invariant preservation
- Isolation: Concurrent schedules behave like serial execution
- Durability: Committed updates survive system crashes.

Strict Two-Phase Locking (Strict 2PL) Protocol:
1. Growing Phase: Transaction acquires shared (S) or exclusive (X) locks. No locks released.
2. Shrinking Phase: All exclusive locks held by T are released SIMULTANEOUSLY at COMMIT or ABORT time.
This guarantees conflict serializability and prevents cascading aborts.`,
    latex: `S = \\langle r_1(A), w_1(A), r_2(A), w_2(A), c_1, c_2 \\rangle \\implies \\text{Conflict Serializable}`,
    raw_latex: `S = \langle r_1(A), w_1(A), r_2(A), w_2(A), c_1, c_2 \rangle \implies \text{Conflict Serializable}`,
    confidence: 0.92,
    words: [
      { word_id: 'w21', text: 'TRANSACTION', confidence: 0.99, low_confidence: false },
      { word_id: 'w22', text: 'CONCURRENCY', confidence: 0.97, low_confidence: false },
      { word_id: 'w23', text: 'ACID', confidence: 0.99, low_confidence: false },
      { word_id: 'w24', text: 'guarantees', confidence: 0.95, low_confidence: false },
      { word_id: 'w25', text: 'seralizability', confidence: 0.44, low_confidence: true, original_text: 'seralizability' }, // flagged!
      { word_id: 'w26', text: 'Strict', confidence: 0.99, low_confidence: false },
      { word_id: 'w27', text: '2PL', confidence: 0.98, low_confidence: false },
    ],
    regions: [
      { id: 'reg-4', type: 'text', x: 6, y: 8, width: 88, height: 35, confidence: 0.96, label: 'ACID Properties' },
      { id: 'reg-5', type: 'equation', x: 6, y: 45, width: 88, height: 20, confidence: 0.93, label: 'Schedule Notation' },
      { id: 'reg-6', type: 'diagram', x: 10, y: 68, width: 80, height: 26, confidence: 0.88, label: '2PL Lock Acquisition Graph' },
    ],
    raw_image_url: '/mock/board_raw_2.jpg',
    cleaned_image_url: '/mock/board_clean_2.png',
  },
  {
    id: 103,
    document_id: 1,
    page: 3,
    lecture_number: 11,
    subject: 'Database Systems',
    lecture_date: '2024-10-24',
    topic_ids: [3],
    text: `RELATIONAL ALGEBRA OPERATORS & QUERY TREES

Fundamental Operators:
1. Selection (σ_condition): Filters rows matching predicate.
2. Projection (π_attributes): Extracts specified columns.
3. Cartesian Product (R × S): Pairs every tuple in R with S.
4. Set Difference (R - S) and Union (R ∪ S).
5. Natural Join (⋈): Combines relations on common attributes.`,
    latex: `\\Pi_{name, dept} (\\sigma_{salary > 50000}(Employee) \\bowtie Department)`,
    raw_latex: `\Pi_{name, dept} (\sigma_{salary > 50000}(Employee) \bowtie Department)`,
    confidence: 0.95,
    words: [
      { word_id: 'w31', text: 'RELATIONAL', confidence: 0.99, low_confidence: false },
      { word_id: 'w32', text: 'ALGEBRA', confidence: 0.99, low_confidence: false },
      { word_id: 'w33', text: 'Selection', confidence: 0.98, low_confidence: false },
      { word_id: 'w34', text: 'Projection', confidence: 0.97, low_confidence: false },
      { word_id: 'w35', text: 'Natural', confidence: 0.99, low_confidence: false },
      { word_id: 'w36', text: 'Join', confidence: 0.99, low_confidence: false },
    ],
    regions: [
      { id: 'reg-7', type: 'text', x: 10, y: 10, width: 80, height: 40, confidence: 0.97, label: 'Relational Operators' },
      { id: 'reg-8', type: 'equation', x: 10, y: 55, width: 80, height: 35, confidence: 0.94, label: 'Complex Query Expression' },
    ],
    raw_image_url: '/mock/board_raw_3.jpg',
    cleaned_image_url: '/mock/board_clean_3.png',
  }
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 201,
    question_id: 'q-2024-1a',
    document_id: 2,
    page: 1,
    year: 2024,
    exam_type: 'End Semester',
    section: 'A',
    marks: 5,
    text: 'Differentiate between 3NF and BCNF with a suitable example relation. Explain why every relation in BCNF is also in 3NF.',
    topic_id: 1,
    repeat_group_id: 101,
    repeat_count: 4, // Asked 4x!
    is_compulsory: true,
  },
  {
    id: 202,
    question_id: 'q-2024-2b',
    document_id: 2,
    page: 2,
    year: 2024,
    exam_type: 'End Semester',
    section: 'B',
    marks: 10,
    text: 'Explain the Two-Phase Locking (2PL) protocol. How does Strict 2PL prevent cascading rollbacks in transaction management?',
    topic_id: 5,
    repeat_group_id: 102,
    repeat_count: 3,
    is_compulsory: false,
  },
  {
    id: 203,
    question_id: 'q-2023-1c',
    document_id: 3,
    page: 1,
    year: 2023,
    exam_type: 'End Semester',
    section: 'A',
    marks: 5,
    text: 'What are B+ trees? How do they differ from B-trees in indexing database records? Calculate fanout for 4KB block.',
    topic_id: 4,
    repeat_group_id: 103,
    repeat_count: 4, // Asked 4x but MISSING notes!
    is_compulsory: true,
  },
  {
    id: 204,
    question_id: 'q-2023-3a',
    document_id: 3,
    page: 2,
    year: 2023,
    exam_type: 'End Semester',
    section: 'B',
    marks: 5,
    text: 'Given relation R(A, B, C, D, E) with functional dependencies F = {A → BC, CD → E, B → D, E → A}. Find all candidate keys.',
    topic_id: 1,
    repeat_group_id: 104,
    repeat_count: 3,
    is_compulsory: false,
  },
  {
    id: 205,
    question_id: 'q-2022-2a',
    document_id: 4,
    page: 1,
    year: 2022,
    exam_type: 'End Semester',
    section: 'A',
    marks: 5,
    text: 'Write Relational Algebra expressions for: (i) Find employees earning > 50,000 in IT dept, (ii) List departments with no employees.',
    topic_id: 3,
    repeat_group_id: 105,
    repeat_count: 2,
    is_compulsory: true,
  },
  {
    id: 206,
    question_id: 'q-2021-1b',
    document_id: 5,
    page: 1,
    year: 2021,
    exam_type: 'End Semester',
    section: 'A',
    marks: 5,
    text: 'State the difference between lossless-join decomposition and dependency preservation. Prove that 3NF preserves dependencies.',
    topic_id: 1,
    repeat_group_id: 101,
    repeat_count: 4,
    is_compulsory: true,
  },
  {
    id: 207,
    question_id: 'q-2020-4b',
    document_id: 6,
    page: 3,
    year: 2020,
    exam_type: 'End Semester',
    section: 'C',
    marks: 10,
    text: 'Explain conflict serializability and view serializability. Draw the precedence graph for given transaction schedule.',
    topic_id: 5,
    repeat_group_id: 106,
    repeat_count: 3,
    is_compulsory: false,
  },
  {
    id: 208,
    question_id: 'q-2024-4a',
    document_id: 2,
    page: 3,
    year: 2024,
    exam_type: 'End Semester',
    section: 'C',
    marks: 8,
    text: 'What are primary, secondary, and clustering indexes? Compare hash indexing vs B+ tree indexing under range query workloads.',
    topic_id: 4,
    repeat_group_id: 103,
    repeat_count: 4,
    is_compulsory: false,
  }
];

export const MOCK_HEATMAP_DATA = [
  { topicId: 1, topicName: 'Normalization & Dependencies', code: 'DBMS-01', color: '#FF3B30', years: { 2020: 2, 2021: 2, 2022: 1, 2023: 2, 2024: 2 }, streak: 5, totalMarks: 42 },
  { topicId: 5, topicName: 'Transactions & Concurrency', code: 'DBMS-05', color: '#8B5CF6', years: { 2020: 1, 2021: 2, 2022: 2, 2023: 1, 2024: 2 }, streak: 5, totalMarks: 38 },
  { topicId: 3, topicName: 'Relational Algebra & SQL', code: 'DBMS-03', color: '#A3E635', years: { 2020: 1, 2021: 1, 2022: 2, 2023: 2, 2024: 1 }, streak: 5, totalMarks: 36 },
  { topicId: 4, topicName: 'Indexing & B+ Trees', code: 'DBMS-04', color: '#F59E0B', years: { 2020: 1, 2021: 1, 2022: 1, 2023: 2, 2024: 1 }, streak: 5, totalMarks: 28, isGap: true },
  { topicId: 2, topicName: 'ER Modeling & Relational Schema', code: 'DBMS-02', color: '#06B6D4', years: { 2020: 1, 2021: 1, 2022: 1, 2023: 1, 2024: 1 }, streak: 5, totalMarks: 24 },
  { topicId: 6, topicName: 'Query Processing & Optimization', code: 'DBMS-06', color: '#F43F5E', years: { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0 }, streak: 1, totalMarks: 12 },
];

export const MOCK_COVERAGE_GAPS: CoverageGapItem[] = [
  {
    topic_id: 4,
    topic_name: 'Indexing, B+ Trees & Hashing',
    unit: 'Unit 4',
    historical_marks: 28,
    frequency: 6,
    reason: 'Frequently asked but NO notes',
    severity: 'HIGH',
  },
  {
    topic_id: 6,
    topic_name: 'Query Processing & Optimization',
    unit: 'Unit 4',
    historical_marks: 12,
    frequency: 2,
    reason: 'In syllabus but NEVER asked',
    severity: 'LOW',
  }
];

export const MOCK_STUDY_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    topic_id: 1,
    title: 'Review 3NF vs BCNF proofs & candidate key determination',
    duration_minutes: 60,
    day: 1,
    status: 'NOW',
    completed: false,
    notes_missing: false,
    expected_marks: 15,
  },
  {
    id: 'task-2',
    topic_id: 4,
    title: 'CRITICAL GAP: Read B+ Tree split/merge algorithms & fanout formulas',
    duration_minutes: 90,
    day: 1,
    status: 'NOW',
    completed: false,
    notes_missing: true, // flagged!
    expected_marks: 14,
  },
  {
    id: 'task-3',
    topic_id: 5,
    title: 'Solve Strict 2PL conflict serializability & precedence graph problems',
    duration_minutes: 75,
    day: 2,
    status: 'NEXT',
    completed: false,
    notes_missing: false,
    expected_marks: 15,
  },
  {
    id: 'task-4',
    topic_id: 3,
    title: 'Practice complex Relational Algebra join & division operations',
    duration_minutes: 60,
    day: 2,
    status: 'NEXT',
    completed: false,
    notes_missing: false,
    expected_marks: 10,
  },
  {
    id: 'task-5',
    topic_id: 2,
    title: 'ER to Relational Schema mapping rules and composite attribute conversion',
    duration_minutes: 45,
    day: 3,
    status: 'LATER',
    completed: false,
    notes_missing: false,
    expected_marks: 8,
  },
  {
    id: 'task-6',
    topic_id: 1,
    title: 'Timed Mock Practice: 2024 End Semester Section A & B questions',
    duration_minutes: 90,
    day: 3,
    status: 'LATER',
    completed: false,
    notes_missing: false,
    expected_marks: 20,
  }
];

export const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    note_id: 101,
    topic_id: 1,
    front: 'What is the precise condition differentiating 3NF from BCNF?',
    back: `For any functional dependency X → Y in F+:
• 3NF allows Y to be a prime attribute (part of candidate key) OR X to be a superkey.
• BCNF requires X to be a SUPERKEY without exception.
Hence: BCNF ⊂ 3NF (every BCNF relation is in 3NF, but not vice versa).`,
    linked_question_id: 201,
    mastered: false,
    repeat_count: 4,
  },
  {
    id: 2,
    note_id: 102,
    topic_id: 5,
    front: 'Why does Strict Two-Phase Locking (Strict 2PL) eliminate cascading aborts?',
    back: `In Strict 2PL, all EXCLUSIVE (write) locks are held until transaction commit/abort.
Therefore, no other transaction can read uncommitted dirty data written by T. If T aborts, no dependent transaction needs to be rolled back.`,
    linked_question_id: 202,
    mastered: true,
    repeat_count: 3,
  },
  {
    id: 3,
    note_id: 101,
    topic_id: 1,
    front: 'State the condition for a decomposition R = (R1, R2) to be Lossless-Join.',
    back: `A decomposition is lossless-join with respect to FD set F if and only if the common attributes contain a candidate key of at least one relation:
(R1 ∩ R2) → R1  ∈ F+   OR   (R1 ∩ R2) → R2  ∈ F+`,
    linked_question_id: 206,
    mastered: false,
    repeat_count: 4,
  },
  {
    id: 4,
    note_id: 103,
    topic_id: 3,
    front: 'What is the difference between Selection (σ) and Projection (π) in Relational Algebra?',
    back: `• Selection (σ_predicate): Horizontal filtering of tuples satisfying a boolean condition.
• Projection (π_attributes): Vertical extraction of specified column attributes, automatically discarding duplicate tuples.`,
    linked_question_id: 205,
    mastered: true,
    repeat_count: 2,
  },
  {
    id: 5,
    note_id: 101,
    topic_id: 4,
    front: 'How is the order (fanout) of a B+ Tree calculated from block size B and key size K?',
    back: `For a block size B, key size K, record/block pointer P:
n * P + (n - 1) * K ≤ B
Solving for n gives the maximum fanout order of internal nodes.`,
    linked_question_id: 203,
    mastered: false,
    repeat_count: 4,
  }
];

export const MOCK_GRAPH_NODES: GraphNode[] = [
  { id: 1, name: 'Normalization', unit: 'Unit 2', weight: 42, color: '#FF3B30', isGap: false, frequency: 9 },
  { id: 2, name: 'ER Modeling', unit: 'Unit 1', weight: 24, color: '#06B6D4', isGap: false, frequency: 5 },
  { id: 3, name: 'Relational Algebra', unit: 'Unit 3', weight: 36, color: '#A3E635', isGap: false, frequency: 7 },
  { id: 4, name: 'Indexing & B-Trees', unit: 'Unit 4', weight: 28, color: '#F59E0B', isGap: true, frequency: 6 },
  { id: 5, name: 'Transactions & 2PL', unit: 'Unit 5', weight: 38, color: '#8B5CF6', isGap: false, frequency: 8 },
  { id: 6, name: 'Query Optimization', unit: 'Unit 4', weight: 14, color: '#F43F5E', isGap: false, frequency: 2 },
];

export const MOCK_GRAPH_LINKS: GraphLink[] = [
  { source: 1, target: 2, strength: 0.8 }, // Normalization links to ER Modeling
  { source: 1, target: 3, strength: 0.7 }, // Normalization links to Relational Algebra
  { source: 3, target: 6, strength: 0.9 }, // Relational Algebra links to Query Optimization
  { source: 4, target: 6, strength: 0.6 }, // Indexing links to Query Optimization
  { source: 5, target: 3, strength: 0.5 }, // Transactions links to Relational Algebra
  { source: 4, target: 5, strength: 0.4 }, // Indexing links to Transactions
];
