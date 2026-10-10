from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.database.db import get_questions_by_document, insert_questions_batch
from app.exam_parser.parser import parse_question_paper
from app.models import Document
from app.ocr.store import run_and_store
from app.ocr.tesseract_runtime import is_tesseract_available
from app.routers.documents import get_shared_contract_payload
from app.services.note_service import (
    GeminiNotConfiguredError,
    NoteStructurer,
)
from app.vision.pipeline import process_board_images

router = APIRouter(prefix="/api/process", tags=["Processing Pipeline"])

_TESSERACT_HELP = (
    "Tesseract OCR is not installed or not reachable. "
    "Install the UB-Mannheim Windows build from "
    "https://github.com/UB-Mannheim/tesseract/wiki "
    "and set TESSERACT_PATH in backend/.env."
)


def _structure_notes(db: Session, note_ids: list[int]) -> dict:
    if not note_ids:
        return {"status": "skipped", "reason": "no notes to structure"}
    try:
        return NoteStructurer().structure_notes(session=db, note_ids=note_ids)
    except GeminiNotConfiguredError as exc:
        return {"status": "skipped", "reason": str(exc)}
    except Exception as exc:
        return {"status": "error", "reason": str(exc)}


@router.post("/{document_id}")
def trigger_processing_pipeline(document_id: int, db: Session = Depends(get_db)):
    """
    Integration hub: SharedPageContract → Vision / OCR / exam parser.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    shared_contract = get_shared_contract_payload(document_id, db)

    try:
        if doc.type == "lecture_board":
            cleaned_pages = process_board_images(shared_contract)
            if not cleaned_pages:
                raise HTTPException(
                    status_code=500,
                    detail="Vision produced no cleaned pages",
                )
            if not is_tesseract_available():
                raise HTTPException(status_code=503, detail=_TESSERACT_HELP)
            note_ids = run_and_store(cleaned_pages, db, lecture_date=doc.timestamp)
            structuring = _structure_notes(db, note_ids)
            db.commit()

            # Trigger topic assignment and flashcard generation for notes
            topics_status = {"status": "skipped"}
            flashcards_status = {"status": "skipped"}
            try:
                from app.services.topic_service import TopicAssigner
                from app.services.flashcard_service import FlashcardGenerator
                try:
                    TopicAssigner().assign_topics_to_notes(db)
                    topics_status = {"status": "success"}
                except Exception as e:
                    topics_status = {"status": "error", "reason": str(e)}
                try:
                    FlashcardGenerator().generate_from_notes(db)
                    flashcards_status = {"status": "success"}
                except Exception as e:
                    flashcards_status = {"status": "error", "reason": str(e)}
            except Exception as exc:
                print(f"Post-processing for notes skipped: {exc}")

            return {
                "status": "success",
                "message": f"Pipeline completed for {doc.type}",
                "cleaned_pages": len(cleaned_pages),
                "note_ids": note_ids,
                "structuring": structuring,
                "vision": {"status": "success", "reason": f"Processed {len(cleaned_pages)} pages"},
                "ocr": {"status": "success", "reason": f"Stored {len(note_ids)} notes"},
                "topics": topics_status,
                "flashcards": flashcards_status
            }

        if doc.type == "question_paper":
            existing = get_questions_by_document(doc.id)
            if existing:
                question_count = len(existing)
            else:
                parsed = parse_question_paper(doc.file_path, document_id=doc.id)
                if parsed.year and not doc.year:
                    doc.year = parsed.year
                if parsed.exam_type and not doc.exam_type:
                    doc.exam_type = parsed.exam_type
                for question in parsed.questions:
                    question.document_id = doc.id
                question_count = insert_questions_batch(parsed.questions)
            db.commit()

            # Optional NLP topic classification, repeat grouping & flashcards
            nlp_result = {"status": "skipped"}
            topics_status = {"status": "skipped"}
            repeats_status = {"status": "skipped"}
            flashcards_status = {"status": "skipped"}
            try:
                from app.services.topic_service import TopicAssigner
                from app.services.repeat_service import RepeatDetector
                from app.services.flashcard_service import FlashcardGenerator
                
                try:
                    # Fixing the session argument issue here for question_paper branch.
                    TopicAssigner().assign_topics_to_questions(db)
                    topics_status = {"status": "success"}
                except Exception as e:
                    topics_status = {"status": "error", "reason": str(e)}
                    
                try:
                    RepeatDetector().detect_repeats(db)
                    repeats_status = {"status": "success"}
                except Exception as e:
                    repeats_status = {"status": "error", "reason": str(e)}
                    
                try:
                    FlashcardGenerator().generate_from_notes(db)
                    flashcards_status = {"status": "success"}
                except Exception as e:
                    flashcards_status = {"status": "error", "reason": str(e)}
                    
                nlp_result = {"status": "success"}
            except Exception as exc:
                nlp_result = {"status": "skipped", "reason": str(exc)}

            return {
                "status": "success",
                "message": f"Pipeline completed for {doc.type}",
                "question_count": question_count,
                "nlp_pipeline": nlp_result,
                "topics": topics_status,
                "repeats": repeats_status,
                "flashcards": flashcards_status
            }

        raise HTTPException(status_code=400, detail=f"Unsupported document type: {doc.type}")

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Pipeline failure: {str(e)}")
