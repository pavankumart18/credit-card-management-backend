from flask import Blueprint, request, jsonify, Response
from bson import ObjectId
from models.chat import ChatSession
from services.gemini import generate_text, stream_text
import os

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/sessions', methods=['POST'])
def create_session():
	data = request.get_json() or {}
	title = data.get('title') or 'New Chat'
	model = data.get('model') or os.environ.get('GEMINI_MODEL', 'gemini-1.5-flash')
	chat = ChatSession(title=title, model=model)
	chat.save()
	return jsonify(chat.to_dict()), 201


@chat_bp.route('/sessions', methods=['GET'])
def list_sessions():
	page = request.args.get('page', 1, type=int)
	per_page = request.args.get('per_page', 10, type=int)
	skip = (page - 1) * per_page
	total = ChatSession.objects.count()
	sessions = ChatSession.objects.order_by('-updated_at').skip(skip).limit(per_page)
	return jsonify({
		"sessions": [s.to_dict() for s in sessions],
		"total": total,
		"pages": (total + per_page - 1) // per_page,
		"current_page": page,
		"per_page": per_page,
	}), 200


@chat_bp.route('/sessions/<session_id>', methods=['GET'])
def get_session(session_id: str):
	try:
		s = ChatSession.objects.get(id=ObjectId(session_id))
		return jsonify(s.to_dict()), 200
	except ChatSession.DoesNotExist:
		return jsonify({'error': 'Session not found'}), 404


@chat_bp.route('/sessions/<session_id>/send', methods=['POST'])
def send_message(session_id: str):
	data = request.get_json() or {}
	prompt = data.get('message')
	model = data.get('model')
	if not prompt:
		return jsonify({'error': 'message is required'}), 400
	try:
		s = ChatSession.objects.get(id=ObjectId(session_id))
		s.add_message('user', prompt)
		reply = generate_text(prompt, model=model or s.model)
		s.add_message('assistant', reply)
		s.save()
		return jsonify({
			"session": s.to_dict(),
			"reply": reply,
		}), 200
	except ChatSession.DoesNotExist:
		return jsonify({'error': 'Session not found'}), 404
	except Exception as e:
		return jsonify({'error': str(e)}), 500


@chat_bp.route('/sessions/<session_id>/stream', methods=['POST'])
def stream_reply(session_id: str):
	data = request.get_json() or {}
	prompt = data.get('message')
	model = data.get('model')
	if not prompt:
		return jsonify({'error': 'message is required'}), 400
	try:
		s = ChatSession.objects.get(id=ObjectId(session_id))
		s.add_message('user', prompt)
		s.save()

		def gen():
			accum = ''
			for chunk in stream_text(prompt, model=model or s.model):
				accum += chunk
				yield chunk
			s.add_message('assistant', accum)
			s.save()
		return Response(gen(), mimetype='text/plain')
	except ChatSession.DoesNotExist:
		return jsonify({'error': 'Session not found'}), 404
	except Exception as e:
		return jsonify({'error': str(e)}), 500

