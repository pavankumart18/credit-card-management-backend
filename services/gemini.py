import os
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. Gemini features will be disabled.")
from typing import Iterable, Optional


def _configure_client() -> None:
    if not GEMINI_AVAILABLE:
        raise RuntimeError("Google Generative AI not available")
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY not set in environment')
    genai.configure(api_key=api_key)


def get_model(name: Optional[str] = None):
	_configure_client()
	model_name = name or os.environ.get('GEMINI_MODEL', 'gemini-1.5-flash')
	return genai.GenerativeModel(model_name)


def generate_text(prompt: str, *, model: Optional[str] = None) -> str:
	mdl = get_model(model)
	resp = mdl.generate_content(prompt)
	return getattr(resp, 'text', '') or ''


def stream_text(prompt: str, *, model: Optional[str] = None) -> Iterable[str]:
	mdl = get_model(model)
	stream = mdl.generate_content(prompt, stream=True)
	for chunk in stream:
		text = getattr(chunk, 'text', '')
		if text:
			yield text
