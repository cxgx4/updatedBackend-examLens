import csv
import os
import re
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import get_engine
from app.models import Note, Flashcard, Question, NoteTopic, Topic, Document

class FlashcardGenerator:
    def __init__(self, export_dir: str = "exports"):
        self.export_dir = export_dir
        if not os.path.exists(self.export_dir):
            os.makedirs(self.export_dir, exist_ok=True)

    def generate_for_document(self, document_id: int, session: Optional[Session] = None):
        """Generates flashcards for a specific uploaded document (PDF or board notes)."""
        if session is not None:
            self._do_generate_for_document(document_id, session)
        else:
            with Session(get_engine()) as session:
                self._do_generate_for_document(document_id, session)

    def _do_generate_for_document(self, document_id: int, session: Session):
        doc = session.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return

        if doc.type == "question_paper":
            self._do_generate_from_questions(session, document_id=document_id)
        else:
            self._do_generate_from_notes(session, document_id=document_id)
            # If no notes were generated but questions were linked, generate from questions
            card_count = session.query(Flashcard).filter(Flashcard.document_id == document_id).count()
            if card_count == 0:
                self._do_generate_from_questions(session, document_id=document_id)

    def generate_from_notes(self, session: Optional[Session] = None, document_id: Optional[int] = None):
        if session is not None:
            self._do_generate_from_notes(session, document_id=document_id)
        else:
            with Session(get_engine()) as session:
                self._do_generate_from_notes(session, document_id=document_id)

    def _do_generate_from_notes(self, session: Session, document_id: Optional[int] = None):
        query = session.query(Note).filter(
            (Note.text != None) | (Note.structured_content != None)
        )
        if document_id is not None:
            query = query.filter(Note.document_id == document_id)
        
        notes = query.all()
        existing_cards = session.query(Flashcard.note_id).filter(Flashcard.note_id != None).distinct().all()
        existing_note_ids = {c[0] for c in existing_cards if c[0] is not None}

        notes_to_process = [n for n in notes if n.id not in existing_note_ids]
        if not notes_to_process:
            return

        updates = 0
        for note in notes_to_process:
            note_body = (note.structured_content or note.text or "").strip()
            lines = [l.strip() for l in note_body.split('\n') if l.strip() and not l.strip().startswith('#')]
            
            # Determine topic name if available
            topic_name = "Core Concept"
            note_topic = session.query(NoteTopic).filter_by(note_id=note.id).first()
            if note_topic and note_topic.topic_id:
                t = session.query(Topic).filter_by(id=note_topic.topic_id).first()
                if t:
                    topic_name = t.name

            first_line = lines[0] if lines else f"Lecture Notes (Page {note.page})"
            # Clean leading markers
            first_line = re.sub(r'^[0-9\.\-\*\s]+', '', first_line).strip()
            front_text = f"[{topic_name}] {first_line[:140]}" if len(first_line) > 10 else f"Key concept from page {note.page}"
            
            back_text = "\n".join(lines[1:5]) if len(lines) > 1 else (note_body[:300] or "Review lecture notes summary.")
            
            # Link related past exam question if found
            linked_q_id = None
            if note_topic:
                related_q = session.query(Question).filter(
                    Question.topic_id == note_topic.topic_id
                ).first()
                if related_q:
                    linked_q_id = related_q.id
                    q_text = getattr(related_q, "cleaned_text", None) or getattr(related_q, "text", None) or ""
                    if q_text:
                        back_text += f"\n\n[Exam Question Reference]:\n{q_text[:200]}"

            card = Flashcard(
                note_id=note.id,
                document_id=note.document_id,
                front=front_text,
                back=back_text,
                linked_question_id=linked_q_id
            )
            session.add(card)
            updates += 1

        session.commit()
        print(f"Generated {updates} flashcards from notes.")

    def generate_from_questions(self, session: Optional[Session] = None, document_id: Optional[int] = None):
        if session is not None:
            self._do_generate_from_questions(session, document_id=document_id)
        else:
            with Session(get_engine()) as session:
                self._do_generate_from_questions(session, document_id=document_id)

    def _do_generate_from_questions(self, session: Session, document_id: Optional[int] = None):
        query = session.query(Question)
        if document_id is not None:
            query = query.filter(Question.document_id == document_id)
        
        questions = query.all()
        existing_cards = session.query(Flashcard.linked_question_id).filter(
            Flashcard.linked_question_id != None
        ).distinct().all()
        existing_q_ids = {c[0] for c in existing_cards if c[0] is not None}

        # Filter out boilerplate instructions sheets (e.g. test instructions)
        instruction_keywords = [
            "answer sheet", "test booklet", "ball point pen", "invigilator",
            "rough work", "blue/black", "handed over", "deducted from total"
        ]

        updates = 0
        for q in questions:
            if q.id in existing_q_ids:
                continue

            raw_text = (q.cleaned_text or q.text or "").strip()
            if len(raw_text) < 15:
                continue

            # Skip test instruction notices
            lower_text = raw_text.lower()
            if any(kw in lower_text for kw in instruction_keywords):
                continue

            # Strip leading question number (e.g. "1. ", "Q1: ", "10(a) ")
            cleaned_q = re.sub(r'^(?:[Qq]uestion\s*\d+|[Qq]\d+[\.\:]?|\d+[\.\)\:]\s*)', '', raw_text).strip()
            
            # Format front prompt
            marks_tag = f"[{q.marks} Marks] " if q.marks else ""
            section_tag = f"({q.section}) " if q.section and q.section != 'all' else ""
            
            # If question text has multiple choices or long body, extract the main problem statement
            first_sentence = cleaned_q.split('\n')[0].strip()
            if len(first_sentence) > 160:
                front_prompt = f"{marks_tag}{section_tag}{first_sentence[:150]}..."
            else:
                front_prompt = f"{marks_tag}{section_tag}{first_sentence}"

            # Format back answer/explanation framework
            topic_name = "Exam Topic"
            if q.topic_id:
                t = session.query(Topic).filter_by(id=q.topic_id).first()
                if t:
                    topic_name = t.name

            # Build high yield back content
            back_parts = [
                f"**Topic Focus:** {topic_name}",
                f"**Exam Context:** Page {q.page}" + (f" • Year {q.year}" if q.year else "") + (f" • {q.marks} Marks" if q.marks else ""),
                "",
                f"**Full Problem Statement & Analysis:**\n{cleaned_q}",
            ]
            
            if q.marks and q.marks >= 5:
                back_parts.append("\n**Key Answer Rubric:**\n• State direct definition and core underlying theory\n• Provide step-by-step mathematical derivation or architecture diagram\n• Conclude with time/space complexity or practical engineering tradeoff")
            else:
                back_parts.append("\n**Key Points:** Focus on precise definitions, formula application, and units.")

            back_content = "\n".join(back_parts)

            card = Flashcard(
                note_id=None,
                document_id=q.document_id,
                front=front_prompt,
                back=back_content,
                linked_question_id=q.id
            )
            session.add(card)
            updates += 1

        session.commit()
        print(f"Generated {updates} flashcards from questions.")

    def export_to_anki(self, session: Optional[Session] = None, document_id: Optional[int] = None) -> Optional[str]:
        if session is not None:
            return self._do_export_to_anki(session, document_id)
        with Session(get_engine()) as session:
            return self._do_export_to_anki(session, document_id)

    def _do_export_to_anki(self, session: Session, document_id: Optional[int] = None) -> Optional[str]:
        query = session.query(Flashcard)
        if document_id is not None:
            query = query.filter(Flashcard.document_id == document_id)
        
        cards = query.all()
        if not cards:
            print("No flashcards to export.")
            return None
            
        filepath = os.path.join(self.export_dir, "anki_deck.csv")
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Front", "Back", "Tags"])
            
            for card in cards:
                tags = "examlens"
                if card.document_id:
                    tags += f" doc_{card.document_id}"
                if card.note_id:
                    note_topics = session.query(NoteTopic).filter_by(note_id=card.note_id).all()
                    for nt in note_topics:
                        tags += f" topic_{nt.topic_id}"
                    
                writer.writerow([card.front, card.back.replace('\n', '<br>'), tags])
                
        print(f"Exported {len(cards)} cards to {filepath} for Anki import.")
        return filepath