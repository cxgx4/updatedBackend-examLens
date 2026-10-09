import os
import uuid
from enum import Enum
from typing import List, Optional
import pymupdf
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document
from app.services.ingestion import process_images_to_pdf, rasterize_pdf

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

UPLOAD_BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads")


class IngestionDocType(str, Enum):
    question_paper = "question_paper"
    lecture_board = "lecture_board"


@router.post("/upload")
async def upload_document(
    doc_type: str = Form(
        "question_paper", 
        description="Select document type: 'question_paper' or 'lecture_board'"
    ),
    lecture_date: Optional[str] = Form(None, description="Optional lecture date (YYYY-MM-DD)"),
    files: List[UploadFile] = File(..., description="PDF document or image files to ingest"),
    db: Session = Depends(get_db)
):
    # Normalize doc_type to prevent casing, dash, or Swagger placeholder mismatches
    doc_type_val = doc_type.value if hasattr(doc_type, "value") else str(doc_type)
    raw_type = doc_type_val.strip().lower().replace("-", "_")
    
    if raw_type in ["lecture", "board", "lecture_board", "lecture_notes", "notes"]:
        final_doc_type = "lecture_board"
    elif raw_type in ["exam", "question", "question_paper", "exam_paper", "questions", "string", ""]:
        # Defaults to question_paper even if Swagger's 'string' placeholder wasn't changed
        final_doc_type = "question_paper"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid doc_type '{doc_type}'. Expected 'question_paper' or 'lecture_board'."
        )

    doc_uuid = str(uuid.uuid4())
    doc_dir = os.path.join(UPLOAD_BASE, doc_uuid)
    os.makedirs(doc_dir, exist_ok=True)

    timestamp = lecture_date
    final_pdf_path = os.path.join(doc_dir, "document.pdf")

    # Check file formats (case-insensitive)
    is_pdf = len(files) == 1 and (files[0].filename or "").lower().endswith(".pdf")

    if is_pdf:
        content = await files[0].read()
        with open(final_pdf_path, "wb") as f:
            f.write(content)
        pdf_doc = pymupdf.open(final_pdf_path)
        total_pages = len(pdf_doc)
        pdf_doc.close()
    else:
        # Array of images: sort by EXIF and merge into single PDF
        image_tuples = []
        for file in files:
            file_bytes = await file.read()
            image_tuples.append((file.filename, file_bytes))

        pdf_bytes, exif_ts = process_images_to_pdf(image_tuples)
        if not timestamp and exif_ts:
            timestamp = exif_ts

        with open(final_pdf_path, "wb") as f:
            f.write(pdf_bytes)
        
        total_pages = len(image_tuples)

    original_name = files[0].filename if files and files[0].filename else "document.pdf"
    doc_record = Document(
        type=final_doc_type,
        file_name=original_name,
        source_pages=total_pages,
        timestamp=timestamp,
        file_path=final_pdf_path
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # Rasterize PDF pages to 300 DPI images for downstream processing
    pages_dir = os.path.join(doc_dir, "pages")
    with open(final_pdf_path, "rb") as f:
        pdf_bytes = f.read()
    rasterize_pdf(pdf_bytes=pdf_bytes, output_dir=pages_dir, dpi=300)

    return {
        "status": "success",
        "document_id": doc_record.id,
        "type": doc_record.type,
        "source_pages": doc_record.source_pages,
        "timestamp": doc_record.timestamp
    }