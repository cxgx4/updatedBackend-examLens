import os
from typing import Optional
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer, util
from app.database import get_engine
from app.models import Topic, Question, Note, NoteTopic

class TopicAssigner:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', threshold: float = 0.45):
        print(f"Loading embedding model '{model_name}'...")
        # Suppress symlink warnings on Windows
        os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
        
        self.model = SentenceTransformer(model_name)
        self.threshold = threshold
        self.topic_embeddings = None
        self.topic_map = {}  # Maps tensor index back to the integer Topic.id

    def _load_and_embed_topics(self, session: Session) -> bool:
        topics = session.query(Topic).all()
        if not topics:
            print("Error: No topics found in the database.")
            return False

        self.topic_map = {}
        topic_texts = []
        for idx, t in enumerate(topics):
            # Concatenate name and unit for a denser semantic representation
            text = f"{t.name}. {t.syllabus_unit}"
            topic_texts.append(text)
            self.topic_map[idx] = t.id

        print(f"Embedding {len(topic_texts)} syllabus topics...")
        self.topic_embeddings = self.model.encode(topic_texts, convert_to_tensor=True)
        return True

    def assign_topics_to_questions(self, session: Optional[Session] = None):
        if session is not None:
            self._do_assign_questions(session)
        else:
            with Session(get_engine()) as session:
                self._do_assign_questions(session)

    def _do_assign_questions(self, session: Session):
        if not self._load_and_embed_topics(session):
            return

        # Target only questions without a designated topic
        unassigned_questions = session.query(Question).filter(Question.topic_id == None).all()
        if not unassigned_questions:
            print("No unassigned questions found.")
            return

        print(f"Processing {len(unassigned_questions)} unassigned questions...")
        
        # Batch encode question texts (fallback to text if cleaned_text is unavailable)
        q_texts = [q.cleaned_text or q.text for q in unassigned_questions]
        q_embeddings = self.model.encode(q_texts, convert_to_tensor=True)

        # Compute dot product/cosine similarity matrix
        cosine_scores = util.cos_sim(q_embeddings, self.topic_embeddings)

        updates = 0
        for i, q in enumerate(unassigned_questions):
            scores = cosine_scores[i]
            best_score_val = scores.max().item()
            best_idx = scores.argmax().item()

            if best_score_val >= self.threshold:
                q.topic_id = self.topic_map[best_idx]
                updates += 1
                print(f"[Match] Q ID: {q.id} -> Topic ID: {q.topic_id} (Confidence: {best_score_val:.3f})")
            else:
                print(f"[Skip] Q ID: {q.id} remains NULL (Highest confidence: {best_score_val:.3f} < {self.threshold})")

        session.commit()
        print(f"Update complete: Assigned topics to {updates}/{len(unassigned_questions)} questions.")

    def assign_topics_to_notes(self, session: Optional[Session] = None):
        if session is not None:
            self._do_assign_notes(session)
        else:
            with Session(get_engine()) as session:
                self._do_assign_notes(session)

    def _do_assign_notes(self, session: Session):
        if not self._load_and_embed_topics(session):
            return

        subq = session.query(NoteTopic.note_id).distinct()
        unassigned_notes = session.query(Note).filter(
            (Note.text != None) | (Note.structured_content != None),
            ~Note.id.in_(subq)
        ).all()

        if not unassigned_notes:
            print("No unassigned notes found.")
            return

        print(f"Processing {len(unassigned_notes)} unassigned notes...")
        note_texts = [n.structured_content or n.text for n in unassigned_notes]
        n_embeddings = self.model.encode(note_texts, convert_to_tensor=True)

        cosine_scores = util.cos_sim(n_embeddings, self.topic_embeddings)

        updates = 0
        for i, note in enumerate(unassigned_notes):
            scores = cosine_scores[i]
            best_score_val = scores.max().item()
            best_idx = scores.argmax().item()

            if best_score_val >= self.threshold:
                topic_id = self.topic_map[best_idx]
                note_topic = NoteTopic(
                    note_id=note.id,
                    topic_id=topic_id,
                    confidence=best_score_val
                )
                session.add(note_topic)
                updates += 1
                print(f"[Match] Note ID: {note.id} -> Topic ID: {topic_id} (Confidence: {best_score_val:.3f})")
            else:
                print(f"[Skip] Note ID: {note.id} remains unassigned (Highest confidence: {best_score_val:.3f} < {self.threshold})")

        session.commit()
        print(f"Update complete: Assigned topics to {updates}/{len(unassigned_notes)} notes.")

if __name__ == "__main__":
    assigner = TopicAssigner()
    assigner.assign_topics_to_questions()
    assigner.assign_topics_to_notes()