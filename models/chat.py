from datetime import datetime
from typing import List, Dict, Any
from mongoengine import Document, EmbeddedDocument, StringField, DateTimeField, EmbeddedDocumentListField


class Message(EmbeddedDocument):
	role = StringField(required=True, choices=["user", "assistant", "system"], default="user")
	content = StringField(required=True)
	created_at = DateTimeField(default=datetime.utcnow)

	def to_dict(self) -> Dict[str, Any]:
		return {
			"role": self.role,
			"content": self.content,
			"created_at": self.created_at.isoformat() if self.created_at else None,
		}


class ChatSession(Document):
	title = StringField(required=True)
	model = StringField(default="gemini-1.5-flash")
	messages = EmbeddedDocumentListField(Message, default=list)
	created_at = DateTimeField(default=datetime.utcnow)
	updated_at = DateTimeField(default=datetime.utcnow)

	meta = {
		"collection": "chat_sessions",
		"indexes": ["created_at"],
	}

	def add_message(self, role: str, content: str) -> None:
		self.messages.append(Message(role=role, content=content))
		self.updated_at = datetime.utcnow()

	def to_dict(self) -> Dict[str, Any]:
		return {
			"id": str(self.id),
			"title": self.title,
			"model": self.model,
			"created_at": self.created_at.isoformat() if self.created_at else None,
			"updated_at": self.updated_at.isoformat() if self.updated_at else None,
			"messages": [m.to_dict() for m in self.messages],
		}

