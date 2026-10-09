import csv
import os
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_engine
from app.models import Note, Flashcard, Question, NoteTopic

class FlashcardGenerator:
    def __init__(self, export_dir: str = "exports"):
        self.export_dir = export_dir
        if not os.path.exists(self.export_dir):
            os.makedirs(self.export_dir, exist_ok=True)

    def generate_from_notes(self, session: Optional[Session] = None):
        if session is not None:
            self._do_generate(session)
        else:
            with Session(get_engine()) as session:
                self._do_generate(session)

    def _do_generate(self, session: Session):
        # Prevent creating duplicate flashcards for notes that already have flashcards
        existing_cards = session.query(Flashcard.note_id).distinct().all()
        existing_note_ids = {c.note_id for c in existing_cards}
        
        notes = session.query(Note).filter(
            (Note.text != None) | (Note.structured_content != None)
        ).all()
        
        notes_to_process = [n for n in notes if n.id not in existing_note_ids]
        
        if not notes_to_process:
            print("No new structured notes found to generate flashcards.")
            return

        updates = 0
        
        for note in notes_to_process:
            note_body = note.structured_content or note.text or ""
            lines = [l.strip() for l in note_body.split('\n') if l.strip()]
            front_text = f"Key concept from page {note.page}"
            back_text = " ".join(lines[:2]) if lines else "Summary note"
            
            # Find a related past exam question to link
            linked_q_id = None
            note_topic = session.query(NoteTopic).filter_by(note_id=note.id).first()
            
            if note_topic:
                related_q = session.query(Question).filter(
                    Question.topic_id == note_topic.topic_id,
                    Question.repeat_group_id != None
                ).first()
                
                if related_q:
                    linked_q_id = related_q.id
                    q_text = getattr(related_q, "cleaned_text", None) or getattr(related_q, "text", None) or ""
                    back_text += f"\n\n[Past Exam Context]: {q_text}"

            card = Flashcard(
                note_id=note.id,
                front=front_text,
                back=back_text,
                linked_question_id=linked_q_id
            )
            session.add(card)
            updates += 1

        session.commit()
        print(f"Generated {updates} flashcards in the database.")

    def export_to_anki(self, session: Optional[Session] = None) -> Optional[str]:
        if session is not None:
            return self._do_export_to_anki(session)
        with Session(get_engine()) as session:
            return self._do_export_to_anki(session)

    def _do_export_to_anki(self, session: Session) -> Optional[str]:
        cards = session.query(Flashcard).all()
        if not cards:
            print("No flashcards to export.")
            return None
            
        filepath = os.path.join(self.export_dir, "anki_deck.csv")
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Front", "Back", "Tags"])
            
            for card in cards:
                tags = "study_platform"
                note_topics = session.query(NoteTopic).filter_by(note_id=card.note_id).all()
                if note_topics:
                    tags += " " + " ".join([f"topic_{nt.topic_id}" for nt in note_topics])
                    
                writer.writerow([card.front, card.back.replace('\n', '<br>'), tags])
                
        print(f"Exported {len(cards)} cards to {filepath} for Anki import.")
        return filepath

if __name__ == "__main__":
    generator = FlashcardGenerator()
    generator.generate_from_notes()
    generator.export_to_anki()