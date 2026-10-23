"""Gemini-backed structuring of OCR notes.

Reads GEMINI_API_KEY from the environment (typically backend/.env).
Never logs or returns the key. Tests inject generate_fn instead of calling Gemini.
"""

from __future__ import annotations

import os
from typing import Callable, Optional

from sqlalchemy.orm import Session

from app.database import get_engine
from app.env_loader import load_backend_env
from app.models import Note

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_TIMEOUT_SECONDS = 30


def _model_name() -> str:
    load_backend_env()
    return os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL) or DEFAULT_GEMINI_MODEL
_SYSTEM_PROMPT = (
    "You are an academic data structurer. Convert the provided raw OCR text "
    "into organized markdown. Use '##' for headings, '-' for bullets, and bold "
    "key terms. Correct obvious OCR artifacts but do not hallucinate external facts."
)


class GeminiNotConfiguredError(RuntimeError):
    """Raised when GEMINI_API_KEY is missing."""


class GeminiResponseError(RuntimeError):
    """Raised when Gemini returns empty or unusable content."""


def _require_api_key(explicit: Optional[str] = None) -> str:
    load_backend_env()
    key = explicit if explicit is not None else os.getenv("GEMINI_API_KEY")
    if key:
        key = key.strip()
    if not key or key == "your_gemini_api_key_here":
        raise GeminiNotConfiguredError(
            "GEMINI_API_KEY is not set. Add it to backend/.env "
            "(see backend/.env.example)."
        )
    return key


def gemini_key_is_configured() -> bool:
    try:
        _require_api_key()
        return True
    except GeminiNotConfiguredError:
        return False


class NoteStructurer:
    def __init__(
        self,
        api_key: Optional[str] = None,
        generate_fn: Optional[Callable[[str], str]] = None,
        model=None,
    ):
        self.api_key = _require_api_key(api_key)
        self._generate_fn = generate_fn
        self.model = model
        if self._generate_fn is None and self.model is None:
            from google import genai

            self.model = genai.Client(
                api_key=self.api_key,
                http_options={"timeout": GEMINI_TIMEOUT_SECONDS * 1000},
            )

    def structure_text(self, text: str) -> str:
        raw = (text or "").strip()
        if not raw:
            raise GeminiResponseError("cannot structure empty OCR text")
        if self._generate_fn is not None:
            structured = self._generate_fn(raw)
        else:
            structured = self._call_gemini(raw)
        structured = (structured or "").strip()
        if not structured:
            raise GeminiResponseError("Gemini returned empty structured content")
        return structured

    def _call_gemini(self, text: str) -> str:
        from google.genai import types

        last_exc: Exception | None = None
        for attempt in range(2):
            try:
                response = self.model.models.generate_content(
                    model=_model_name(),
                    contents=text,
                    config=types.GenerateContentConfig(
                        system_instruction=_SYSTEM_PROMPT,
                        temperature=0.1,
                    ),
                )
                return getattr(response, "text", None) or ""
            except Exception as exc:
                last_exc = exc
                status = getattr(exc, "code", None) or getattr(exc, "status_code", None)
                if status == 503 and attempt == 0:
                    import time

                    time.sleep(2)
                    continue
                raise GeminiResponseError(
                    f"Gemini request failed ({type(exc).__name__})"
                ) from exc
        raise GeminiResponseError(
            f"Gemini request failed ({type(last_exc).__name__})"
        ) from last_exc

    def transcribe_and_structure_image(self, image_path: str) -> str:
        """Transcribes handwritten notes, formulas, and diagrams directly from page image using Gemini Vision."""
        if self._generate_fn is not None:
            return self._generate_fn(f"[image: {image_path}]")

        try:
            from PIL import Image
            from google.genai import types

            img = Image.open(image_path)
            max_dim = 1600
            if max(img.size) > max_dim:
                ratio = max_dim / max(img.size)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)

            vision_prompt = (
                "You are an academic transcriber. Transcribe all handwritten questions, notes, "
                "formulas, steps, and calculations on this lecture/notebook page into organized clean Markdown. "
                "Use standard LaTeX notation $...$ for inline math and $$...$$ for standalone formulas and fractions. "
                "Preserve problem numbers, headings, and clear structure."
            )

            response = self.model.models.generate_content(
                model=_model_name(),
                contents=[vision_prompt, img],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                ),
            )
            text = getattr(response, "text", "") or ""
            return text.strip()
        except Exception as exc:
            raise GeminiResponseError(f"Gemini Vision request failed: {exc}") from exc

    def structure_notes(
        self,
        session: Optional[Session] = None,
        note_ids: Optional[list[int]] = None,
    ) -> dict:
        own_session = session is None
        if own_session:
            session = Session(bind=get_engine())
        try:
            from app.models import Document

            query = session.query(Note).filter(
                (Note.text != None) | (Note.confidence != None),  # noqa: E711
            )
            if note_ids is not None:
                if not note_ids:
                    return {"status": "ok", "updated": 0, "failed": 0}
                query = query.filter(Note.id.in_(note_ids))
            notes = query.all()
            updated = 0
            failed = 0
            for note in notes:
                try:
                    structured = None

                    # If source page image is available, transcribe directly with Gemini Vision
                    doc = session.query(Document).filter(Document.id == note.document_id).first()
                    if doc and doc.file_path and self._generate_fn is None:
                        doc_dir = os.path.dirname(doc.file_path)
                        candidate = os.path.join(doc_dir, "pages", f"page_{note.page}.png")
                        if os.path.exists(candidate):
                            try:
                                structured = self.transcribe_and_structure_image(candidate)
                                if structured:
                                    note.text = structured
                                    note.confidence = 0.98
                            except Exception as ve:
                                print(f"Gemini Vision fallback error: {ve}")

                    # Fallback to standard structuring if not handled by vision
                    if not structured and note.text:
                        structured = self.structure_text(note.text)

                    if structured:
                        note.structured_content = structured
                        updated += 1
                except Exception as ex:
                    print(f"Failed to structure note #{note.id}: {ex}")
                    failed += 1
            session.commit()
            return {"status": "ok", "updated": updated, "failed": failed, "considered": len(notes)}
        finally:
            if own_session:
                session.close()


if __name__ == "__main__":
    structurer = NoteStructurer()
    print(structurer.structure_notes())
