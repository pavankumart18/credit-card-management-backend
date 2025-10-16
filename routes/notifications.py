from flask import Blueprint, request, jsonify
from models.notification import Notification
from models.user import User
from services.auth import token_required
from bson import ObjectId
from datetime import datetime, timedelta

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@token_required
def get_notifications():
    """Get all notifications for the authenticated user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        notification_type = request.args.get('type', type=str)
        priority = request.args.get('priority', type=str)
        is_read = request.args.get('is_read', type=str)
        unread_only = request.args.get('unread_only', 'false', type=str).lower() == 'true'
        
        # Build query
        query = {'user_id': ObjectId(user_id)}
        if notification_type:
            query['notification_type'] = notification_type
        if priority:
            query['priority'] = priority
        if is_read is not None:
            query['is_read'] = is_read.lower() == 'true'
        if unread_only:
            query['is_read'] = False
        
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get notifications
        notifications = Notification.objects(__raw__=query).skip(skip).limit(per_page).order_by('-created_at')
        total = Notification.objects(__raw__=query).count()
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications],
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'per_page': per_page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>', methods=['GET'])
@token_required
def get_notification(notification_id):
    """Get a specific notification by ID"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        notification = Notification.objects.get(id=ObjectId(notification_id), user_id=ObjectId(user_id))
        return jsonify(notification.to_dict()), 200
    except Notification.DoesNotExist:
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/', methods=['POST'])
@token_required
def create_notification():
    """Create a new notification"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        required_fields = ['title', 'message', 'notification_type']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create notification
        notification = Notification.create_notification(
            user_id=ObjectId(user_id),
            title=data['title'],
            message=data['message'],
            notification_type=data['notification_type'],
            priority=data.get('priority', 'medium'),
            channels=data.get('channels', ['in_app']),
            related_entity_type=data.get('related_entity_type'),
            related_entity_id=data.get('related_entity_id'),
            action_url=data.get('action_url'),
            action_text=data.get('action_text'),
            requires_action=data.get('requires_action', False),
            metadata=data.get('metadata'),
            tags=data.get('tags', []),
            expires_at=datetime.fromisoformat(data['expires_at']) if data.get('expires_at') else None
        )
        
        notification.save()
        return jsonify(notification.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        notification = Notification.objects.get(id=ObjectId(notification_id), user_id=ObjectId(user_id))
        notification.mark_as_read()
        
        return jsonify(notification.to_dict()), 200
    except Notification.DoesNotExist:
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>/unread', methods=['PUT'])
@token_required
def mark_notification_unread(notification_id):
    """Mark a notification as unread"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        notification = Notification.objects.get(id=ObjectId(notification_id), user_id=ObjectId(user_id))
        notification.mark_as_unread()
        
        return jsonify(notification.to_dict()), 200
    except Notification.DoesNotExist:
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/mark-all-read', methods=['PUT'])
@token_required
def mark_all_notifications_read():
    """Mark all notifications as read"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get all unread notifications
        notifications = Notification.objects(user_id=ObjectId(user_id), is_read=False)
        
        # Mark all as read
        for notification in notifications:
            notification.mark_as_read()
        
        return jsonify({'message': f'Marked {len(notifications)} notifications as read'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>', methods=['PUT'])
@token_required
def update_notification(notification_id):
    """Update a notification"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        notification = Notification.objects.get(id=ObjectId(notification_id), user_id=ObjectId(user_id))
        data = request.get_json()
        
        # Update allowed fields
        if 'title' in data:
            notification.title = data['title']
        if 'message' in data:
            notification.message = data['message']
        if 'priority' in data:
            notification.priority = data['priority']
        if 'action_url' in data:
            notification.action_url = data['action_url']
        if 'action_text' in data:
            notification.action_text = data['action_text']
        if 'requires_action' in data:
            notification.requires_action = data['requires_action']
        if 'metadata' in data:
            notification.set_metadata(data['metadata'])
        if 'tags' in data:
            notification.tags = data['tags']
        
        notification.save()
        return jsonify(notification.to_dict()), 200
    except Notification.DoesNotExist:
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>', methods=['DELETE'])
@token_required
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        notification = Notification.objects.get(id=ObjectId(notification_id), user_id=ObjectId(user_id))
        notification.delete()
        
        return jsonify({'message': 'Notification deleted successfully'}), 200
    except Notification.DoesNotExist:
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/types', methods=['GET'])
@token_required
def get_notification_types():
    """Get available notification types"""
    notification_types = [
        'transaction', 'payment', 'bill', 'emi', 'card', 'security', 'promotional', 'system'
    ]
    
    return jsonify({'notification_types': notification_types}), 200

@notifications_bp.route('/summary', methods=['GET'])
@token_required
def get_notifications_summary():
    """Get notifications summary for the user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get all notifications for user
        notifications = Notification.objects(user_id=ObjectId(user_id))
        
        # Calculate summary
        total_notifications = len(notifications)
        unread_notifications = len([n for n in notifications if not n.is_read])
        urgent_notifications = len([n for n in notifications if n.is_urgent()])
        high_priority_notifications = len([n for n in notifications if n.is_high_priority()])
        expired_notifications = len([n for n in notifications if n.is_expired()])
        
        # Type breakdown
        type_breakdown = {}
        for notification in notifications:
            notification_type = notification.notification_type
            if notification_type not in type_breakdown:
                type_breakdown[notification_type] = {'total': 0, 'unread': 0}
            type_breakdown[notification_type]['total'] += 1
            if not notification.is_read:
                type_breakdown[notification_type]['unread'] += 1
        
        return jsonify({
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'urgent_notifications': urgent_notifications,
            'high_priority_notifications': high_priority_notifications,
            'expired_notifications': expired_notifications,
            'type_breakdown': type_breakdown
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
