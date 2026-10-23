import os
import pymupdf
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document
from app.schemas import SharedPageContract, DocumentResponse, PageReorderRequest
from app.services.ingestion import rasterize_pdf

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("")
def list_documents(db: Session = Depends(get_db)):
    """Returns all uploaded documents with summary stats (pages, questions, flashcards, notes)."""
    from app.models import Question, Note, Flashcard
    docs = db.query(Document).order_by(Document.id.desc()).all()
    results = []
    for d in docs:
        q_count = db.query(Question).filter(Question.document_id == d.id).count()
        n_count = db.query(Note).filter(Note.document_id == d.id).count()
        f_count = db.query(Flashcard).filter(
            (Flashcard.document_id == d.id) |
            (Flashcard.note_id.in_(db.query(Note.id).filter(Note.document_id == d.id)))
        ).count()
        
        display_name = d.file_name or os.path.basename(d.file_path or f"document_{d.id}.pdf")
        results.append({
            "id": d.id,
            "type": d.type,
            "file_name": display_name,
            "source_pages": d.source_pages,
            "timestamp": d.timestamp,
            "year": d.year,
            "exam_type": d.exam_type,
            "created_at": str(d.created_at) if d.created_at else None,
            "question_count": q_count,
            "notes_count": n_count,
            "flashcard_count": f_count
        })
    return results

@router.post("/{document_id}/generate-flashcards")
def generate_flashcards_for_doc(document_id: int, db: Session = Depends(get_db)):
    """Generates flashcards for a specific document."""
    from app.services.flashcard_service import FlashcardGenerator
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    FlashcardGenerator().generate_for_document(document_id, db)
    from app.models import Flashcard, Note
    count = db.query(Flashcard).filter(
        (Flashcard.document_id == document_id) |
        (Flashcard.note_id.in_(db.query(Note.id).filter(Note.document_id == document_id)))
    ).count()
    return {"status": "success", "document_id": document_id, "flashcard_count": count}

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{document_id}/contract", response_model=List[SharedPageContract])
def get_shared_contract_payload(document_id: int, db: Session = Depends(get_db)):
    """
    Delivers the exact Day 1 shared interface contract to Vision, OCR, and Parsing engines.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_dir = os.path.dirname(doc.file_path)
    pages_dir = os.path.join(doc_dir, "pages")

    pdf_doc = pymupdf.open(doc.file_path)
    contracts = []

    for idx in range(len(pdf_doc)):
        page_num = idx + 1
        page = pdf_doc.load_page(idx)
        text_layer = page.get_text("text").strip()

        image_path = os.path.join(pages_dir, f"page_{page_num}.png")

        contracts.append(SharedPageContract(
            document_id=doc.id,
            page_number=page_num,
            doc_type=doc.type,
            image_path=image_path,
            embedded_text=text_layer if len(text_layer) > 0 else None,
            timestamp=doc.timestamp
        ))

    pdf_doc.close()
    return contracts

@router.post("/{document_id}/reorder")
def reorder_pages(document_id: int, payload: PageReorderRequest, db: Session = Depends(get_db)):
    """
    Reorders document pages according to user UI sequence and rebuilds the source PDF.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    src_pdf = pymupdf.open(doc.file_path)
    total_pages = len(src_pdf)
    if len(payload.new_page_order) != total_pages:
        src_pdf.close()
        raise HTTPException(status_code=400, detail="Page count mismatch")

    if any(p < 1 or p > total_pages for p in payload.new_page_order):
        src_pdf.close()
        raise HTTPException(status_code=400, detail=f"Page numbers must be between 1 and {total_pages}")

    new_pdf = pymupdf.open()
    for orig_page_num in payload.new_page_order:
        # Convert 1-based index to 0-based index
        new_pdf.insert_pdf(src_pdf, from_page=orig_page_num - 1, to_page=orig_page_num - 1)

    src_pdf.close()
    temp_path = doc.file_path + ".tmp"
    new_pdf.save(temp_path, incremental=False, encryption=0)
    new_pdf.close()

    os.replace(temp_path, doc.file_path)

    # Re-rasterize pages after reordering
    doc_dir = os.path.dirname(doc.file_path)
    pages_dir = os.path.join(doc_dir, "pages")
    with open(doc.file_path, "rb") as f:
        rasterize_pdf(f.read(), pages_dir, dpi=300)

    return {"status": "success", "reordered_sequence": payload.new_page_order}