import os
from collections import defaultdict
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer, util
from app.database import get_engine
from app.models import Question

class RepeatDetector:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', threshold: float = 0.70):
        os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
        self.model = SentenceTransformer(model_name)
        self.threshold = threshold

    def detect_repeats(self, session: Optional[Session] = None):
        if session is not None:
            self._do_detect(session)
        else:
            with Session(get_engine()) as session:
                self._do_detect(session)

    def _do_detect(self, session: Session):
        # 1. Fetch all questions (including unassigned questions)
        all_questions = session.query(Question).all()
        if not all_questions:
            print("No questions found for repeat detection.")
            return

        # Determine the current maximum repeat_group_id to prevent collision on subsequent runs
        max_group_record = session.query(Question).filter(Question.repeat_group_id != None).order_by(Question.repeat_group_id.desc()).first()
        current_group_id = max_group_record.repeat_group_id if (max_group_record and max_group_record.repeat_group_id) else 0

        updates = 0

        # If question dataset is small (<= 500 questions), compare globally to catch cross-topic duplicates
        if len(all_questions) <= 500:
            groups_to_process = {"all": all_questions}
        else:
            # Partition by topic_id (including None) for performance on large databases
            topic_groups = defaultdict(list)
            for q in all_questions:
                topic_groups[q.topic_id or 0].append(q)
            groups_to_process = topic_groups

        for group_key, questions in groups_to_process.items():
            n = len(questions)
            if n < 2:
                continue

            print(f"Processing group '{group_key}' with {n} questions...")
            q_texts = [q.cleaned_text or q.text for q in questions]
            embeddings = self.model.encode(q_texts, convert_to_tensor=True)

            cosine_scores = util.cos_sim(embeddings, embeddings)

            adj_list = defaultdict(list)
            for i in range(n):
                for j in range(i + 1, n):
                    score = cosine_scores[i][j].item()
                    if score >= self.threshold:
                        adj_list[i].append(j)
                        adj_list[j].append(i)
                        print(f"  [Edge] Q ID {questions[i].id} & Q ID {questions[j].id} (Score: {score:.3f})")

            visited = set()
            for i in range(n):
                if i not in visited and i in adj_list:
                    component = []
                    queue = [i]
                    visited.add(i)

                    while queue:
                        node = queue.pop(0)
                        component.append(node)
                        for neighbor in adj_list[node]:
                            if neighbor not in visited:
                                visited.add(neighbor)
                                queue.append(neighbor)

                    if len(component) >= 2:
                        current_group_id += 1
                        for node_idx in component:
                            q = questions[node_idx]
                            q.repeat_group_id = current_group_id
                            updates += 1
                        print(f"  -> Created Repeat Group {current_group_id} with {len(component)} questions.")

        session.commit()
        print(f"Repeat detection complete. Assigned repeat_group_id to {updates} questions.")

    def get_repeat_groups(self, session: Optional[Session] = None) -> Dict[int, List[Question]]:
        if session is not None:
            return self._do_get_repeat_groups(session)
        with Session(get_engine()) as session:
            return self._do_get_repeat_groups(session)

    def _do_get_repeat_groups(self, session: Session) -> Dict[int, List[Question]]:
        repeated = session.query(Question).filter(Question.repeat_group_id != None).all()
        groups = defaultdict(list)
        for q in repeated:
            groups[q.repeat_group_id].append(q)
        return dict(groups)

    def get_questions_by_group(self, repeat_group_id: int, session: Optional[Session] = None) -> List[Question]:
        if session is not None:
            return session.query(Question).filter(Question.repeat_group_id == repeat_group_id).all()
        with Session(get_engine()) as session:
            return session.query(Question).filter(Question.repeat_group_id == repeat_group_id).all()

if __name__ == "__main__":
    detector = RepeatDetector()
    detector.detect_repeats()