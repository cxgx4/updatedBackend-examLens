import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import pandas as pd
from typing import Optional

from app.database import get_db, get_engine
from app.models import Document, Note, NoteTopic, Topic, Question, Flashcard
from app.ocr.store import load_result
from analytics_and_planning.member5_analytics.topic_stats import compute_topic_stats

router = APIRouter(prefix="/api", tags=["Read Additions"])

@router.get("/notes")
def get_notes(document_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Note)
    if document_id:
        query = query.filter(Note.document_id == document_id)
    notes = query.order_by(Note.page).all()
    
    result = []
    for note in notes:
        topic_ids = [nt.topic_id for nt in note.topic_links]
        
        words = []
        regions = []
        equations = []
        ocr_res = load_result(note.document_id, note.page)
        if ocr_res:
            for tb in ocr_res.text_blocks:
                for w in tb.words:
                    words.append({
                        "word_id": w.word_id,
                        "text": w.text,
                        "confidence": w.confidence,
                        "low_confidence": w.low_confidence,
                        "corrected": w.corrected
                    })
            for e in ocr_res.equations:
                equations.append({
                    "region_id": e.region_id,
                    "latex": e.latex,
                    "render_ok": e.render_ok,
                    "confidence": e.confidence,
                    "low_confidence": e.low_confidence
                })
        
        result.append({
            "id": note.id,
            "document_id": note.document_id,
            "page": note.page,
            "lecture_date": note.lecture_date,
            "text": note.text,
            "structured_content": note.structured_content,
            "latex": note.latex,
            "confidence": note.confidence,
            "topic_ids": topic_ids,
            "words": words,
            "regions": regions,
            "equations": equations,
            "raw_image_url": f"/api/images/raw/{note.document_id}/{note.page}",
            "cleaned_image_url": f"/api/images/cleaned/{note.document_id}/{note.page}",
        })
    return result

@router.get("/notes/{note_id}")
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    topic_ids = [nt.topic_id for nt in note.topic_links]
    words = []
    regions = []
    equations = []
    ocr_res = load_result(note.document_id, note.page)
    if ocr_res:
        for tb in ocr_res.text_blocks:
            for w in tb.words:
                words.append({
                    "word_id": w.word_id,
                    "text": w.text,
                    "confidence": w.confidence,
                    "low_confidence": w.low_confidence,
                    "corrected": w.corrected
                })
        for e in ocr_res.equations:
            equations.append({
                "region_id": e.region_id,
                "latex": e.latex,
                "render_ok": e.render_ok,
                "confidence": e.confidence,
                "low_confidence": e.low_confidence
            })
            
    return {
        "id": note.id,
        "document_id": note.document_id,
        "page": note.page,
        "lecture_date": note.lecture_date,
        "text": note.text,
        "structured_content": note.structured_content,
        "latex": note.latex,
        "confidence": note.confidence,
        "topic_ids": topic_ids,
        "words": words,
        "regions": regions,
        "equations": equations,
        "raw_image_url": f"/api/images/raw/{note.document_id}/{note.page}",
        "cleaned_image_url": f"/api/images/cleaned/{note.document_id}/{note.page}",
    }

@router.get("/images/raw/{document_id}/{page}")
def get_raw_image(document_id: int, page: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_dir = os.path.dirname(doc.file_path)
    image_path = os.path.join(doc_dir, "pages", f"page_{page}.png")
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)

@router.get("/images/cleaned/{document_id}/{page}")
def get_cleaned_image(document_id: int, page: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_dir = os.path.dirname(doc.file_path)
    image_path = os.path.join(doc_dir, "pages", "cleaned", f"page_{page}.png")
    if not os.path.exists(image_path):
        # Fallback to raw if cleaned not found
        image_path = os.path.join(doc_dir, "pages", f"page_{page}.png")
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)

@router.get("/flashcards")
def get_flashcards(document_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Flashcard)
    if document_id:
        query = query.filter(
            (Flashcard.document_id == document_id) |
            (Flashcard.note_id.in_(db.query(Note.id).filter(Note.document_id == document_id)))
        )
    cards = query.all()
    
    result = []
    for card in cards:
        topic_id = None
        repeat_count = 1
        if card.note_id:
            note_topics = db.query(NoteTopic).filter(NoteTopic.note_id == card.note_id).first()
            if note_topics:
                topic_id = note_topics.topic_id
            
        if card.linked_question_id:
            q = db.query(Question).filter(Question.id == card.linked_question_id).first()
            if q:
                if topic_id is None and q.topic_id:
                    topic_id = q.topic_id
                if q.repeat_group_id:
                    count = db.query(Question).filter(Question.repeat_group_id == q.repeat_group_id).count()
                    if count > 0:
                        repeat_count = count
                    
        result.append({
            "id": card.id,
            "document_id": card.document_id,
            "note_id": card.note_id,
            "front": card.front,
            "back": card.back,
            "linked_question_id": card.linked_question_id,
            "topic_id": topic_id,
            "repeat_count": repeat_count
        })
    return result

@router.get("/questions/enriched")
def get_enriched_questions(
    year: Optional[int] = None,
    document_id: Optional[int] = None,
    section: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if year is not None:
        query = query.filter(Question.year == year)
    if document_id is not None:
        query = query.filter(Question.document_id == document_id)
    if section is not None:
        query = query.filter(Question.section == section)
        
    questions = query.all()
    
    result = []
    for q in questions:
        repeat_count = 1
        if q.repeat_group_id:
            count = db.query(Question).filter(Question.repeat_group_id == q.repeat_group_id).count()
            if count > 0:
                repeat_count = count
                
        topic_name = None
        if q.topic_id:
            t = db.query(Topic).filter(Topic.id == q.topic_id).first()
            if t:
                topic_name = t.name
                
        is_comp = False
        if q.is_compulsory is not None:
            is_comp = q.is_compulsory
            
        result.append({
            "id": q.id,
            "question_id": q.question_id,
            "document_id": q.document_id,
            "page": q.page,
            "year": q.year,
            "exam_type": q.exam_type,
            "section": q.section,
            "marks": q.marks,
            "text": q.text,
            "cleaned_text": q.cleaned_text,
            "topic_id": q.topic_id,
            "topic_name": topic_name,
            "repeat_group_id": q.repeat_group_id,
            "repeat_count": repeat_count,
            "is_compulsory": is_comp
        })
    return result

@router.get("/topics/stats")
def get_topic_stats(db: Session = Depends(get_db)):
    engine = get_engine()
    topics_df = pd.read_sql("SELECT * FROM Topic", engine)
    notes_df = pd.read_sql("SELECT * FROM Note", engine)
    questions_df = pd.read_sql("SELECT * FROM Question", engine)
    note_topics_df = pd.read_sql("SELECT * FROM NoteTopic", engine)
    
    if topics_df.empty:
        return []
        
    try:
        stats = compute_topic_stats(topics_df, questions_df, notes_df, note_topics_df)
        return stats.to_dict(orient="records")
    except ValueError:
        return []

@router.get("/graph")
def get_graph(db: Session = Depends(get_db)):
    engine = get_engine()
    topics_df = pd.read_sql("SELECT * FROM Topic", engine)
    notes_df = pd.read_sql("SELECT * FROM Note", engine)
    questions_df = pd.read_sql("SELECT * FROM Question", engine)
    note_topics_df = pd.read_sql("SELECT * FROM NoteTopic", engine)
    
    if topics_df.empty:
        return {"nodes": [], "links": []}
        
    try:
        stats = compute_topic_stats(topics_df, questions_df, notes_df, note_topics_df)
    except ValueError:
        stats = pd.DataFrame(columns=["topic_id", "name", "total_marks", "n_questions", "has_notes", "expected_marks", "priority"])
        
    nodes = []
    if not stats.empty:
        for _, row in stats.iterrows():
            isGap = bool(row.get("year_share", 0) >= 0.5 and not row.get("has_notes", False)) # Simplified logic
            nodes.append({
                "id": int(row["topic_id"]),
                "name": row["name"],
                "unit": row["syllabus_unit"],
                "weight": float(row["total_marks"]) if "total_marks" in row else 10.0,
                "frequency": int(row["n_questions"]) if "n_questions" in row else 0,
                "isGap": isGap
            })
            
    # Compute links (co-occurrence in questions via repeat group or something, or simply topics connected if they are in same unit for now, or just share notes?)
    # "topics sharing notes/questions or by co-occurrence, with a strength 0 to 1"
    links = []
    
    # Co-occurrence in notes
    note_counts = {}
    for _, row in note_topics_df.iterrows():
        nid = row["note_id"]
        tid = row["topic_id"]
        if nid not in note_counts:
            note_counts[nid] = []
        note_counts[nid].append(tid)
        
    pair_counts = {}
    for tids in note_counts.values():
        if len(tids) > 1:
            for i in range(len(tids)):
                for j in range(i+1, len(tids)):
                    p = tuple(sorted([tids[i], tids[j]]))
                    pair_counts[p] = pair_counts.get(p, 0) + 1
                    
    max_count = max(pair_counts.values()) if pair_counts else 1
    for (t1, t2), count in pair_counts.items():
        links.append({
            "source": int(t1),
            "target": int(t2),
            "strength": float(count) / max_count
        })
        
    return {"nodes": nodes, "links": links}
