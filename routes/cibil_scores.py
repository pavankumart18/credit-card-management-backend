from flask import Blueprint, request, jsonify
from models.cibil_score import CibilScore
from models.user import User
from services.auth import token_required
from bson import ObjectId
from datetime import datetime, timedelta

cibil_scores_bp = Blueprint('cibil_scores', __name__)

@cibil_scores_bp.route('/', methods=['GET'])
@token_required
def get_cibil_scores():
    """Get all CIBIL scores for the authenticated user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        current_only = request.args.get('current_only', 'true', type=str).lower() == 'true'
        
        # Build query
        query = {'user_id': ObjectId(user_id)}
        if current_only:
            query['is_current'] = True
        
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get CIBIL scores
        cibil_scores = CibilScore.objects(__raw__=query).skip(skip).limit(per_page).order_by('-score_date')
        total = CibilScore.objects(__raw__=query).count()
        
        return jsonify({
            'cibil_scores': [score.to_dict() for score in cibil_scores],
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'per_page': per_page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/current', methods=['GET'])
@token_required
def get_current_cibil_score():
    """Get current CIBIL score for the authenticated user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        cibil_score = CibilScore.objects(user_id=ObjectId(user_id), is_current=True).first()
        
        if not cibil_score:
            return jsonify({'error': 'No CIBIL score found'}), 404
        
        return jsonify(cibil_score.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/', methods=['POST'])
@token_required
def create_cibil_score():
    """Create a new CIBIL score"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        required_fields = ['score', 'score_date']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate score range
        if not (300 <= data['score'] <= 900):
            return jsonify({'error': 'Score must be between 300 and 900'}), 400
        
        # Parse score date
        score_date = datetime.fromisoformat(data['score_date']) if isinstance(data['score_date'], str) else data['score_date']
        
        # Create CIBIL score
        cibil_score = CibilScore.create_cibil_score(
            user_id=ObjectId(user_id),
            score=data['score'],
            score_date=score_date,
            score_type=data.get('score_type', 'cibil'),
            payment_history_score=data.get('payment_history_score'),
            credit_utilization_score=data.get('credit_utilization_score'),
            credit_age_score=data.get('credit_age_score'),
            credit_mix_score=data.get('credit_mix_score'),
            new_credit_score=data.get('new_credit_score')
        )
        
        # Set additional fields
        cibil_score.total_accounts = data.get('total_accounts', 0)
        cibil_score.active_accounts = data.get('active_accounts', 0)
        cibil_score.closed_accounts = data.get('closed_accounts', 0)
        cibil_score.credit_inquiries = data.get('credit_inquiries', 0)
        cibil_score.hard_inquiries = data.get('hard_inquiries', 0)
        cibil_score.soft_inquiries = data.get('soft_inquiries', 0)
        cibil_score.total_credit_limit = data.get('total_credit_limit', 0)
        cibil_score.total_outstanding = data.get('total_outstanding', 0)
        cibil_score.oldest_account_age = data.get('oldest_account_age', 0)
        cibil_score.newest_account_age = data.get('newest_account_age', 0)
        cibil_score.late_payments = data.get('late_payments', 0)
        cibil_score.missed_payments = data.get('missed_payments', 0)
        cibil_score.defaults = data.get('defaults', 0)
        cibil_score.bankruptcies = data.get('bankruptcies', 0)
        cibil_score.collections = data.get('collections', 0)
        cibil_score.report_number = data.get('report_number')
        cibil_score.bureau_reference = data.get('bureau_reference')
        cibil_score.notes = data.get('notes')
        
        # Calculate credit utilization
        cibil_score.calculate_credit_utilization()
        
        cibil_score.save()
        return jsonify(cibil_score.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/<score_id>', methods=['GET'])
@token_required
def get_cibil_score(score_id):
    """Get a specific CIBIL score by ID"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        cibil_score = CibilScore.objects.get(id=ObjectId(score_id), user_id=ObjectId(user_id))
        return jsonify(cibil_score.to_dict()), 200
    except CibilScore.DoesNotExist:
        return jsonify({'error': 'CIBIL score not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/<score_id>/verify', methods=['PUT'])
@token_required
def verify_cibil_score(score_id):
    """Verify a CIBIL score"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        verification_date = data.get('verification_date')
        
        cibil_score = CibilScore.objects.get(id=ObjectId(score_id), user_id=ObjectId(user_id))
        
        if verification_date:
            verification_date = datetime.fromisoformat(verification_date) if isinstance(verification_date, str) else verification_date
        
        cibil_score.verify_score(verification_date)
        return jsonify(cibil_score.to_dict()), 200
    except CibilScore.DoesNotExist:
        return jsonify({'error': 'CIBIL score not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/<score_id>', methods=['PUT'])
@token_required
def update_cibil_score(score_id):
    """Update a CIBIL score"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        cibil_score = CibilScore.objects.get(id=ObjectId(score_id), user_id=ObjectId(user_id))
        data = request.get_json()
        
        # Update allowed fields
        if 'notes' in data:
            cibil_score.notes = data['notes']
        if 'total_credit_limit' in data:
            cibil_score.total_credit_limit = data['total_credit_limit']
        if 'total_outstanding' in data:
            cibil_score.total_outstanding = data['total_outstanding']
        if 'late_payments' in data:
            cibil_score.late_payments = data['late_payments']
        if 'missed_payments' in data:
            cibil_score.missed_payments = data['missed_payments']
        if 'defaults' in data:
            cibil_score.defaults = data['defaults']
        if 'bankruptcies' in data:
            cibil_score.bankruptcies = data['bankruptcies']
        if 'collections' in data:
            cibil_score.collections = data['collections']
        
        # Recalculate credit utilization
        cibil_score.calculate_credit_utilization()
        
        cibil_score.save()
        return jsonify(cibil_score.to_dict()), 200
    except CibilScore.DoesNotExist:
        return jsonify({'error': 'CIBIL score not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/<score_id>', methods=['DELETE'])
@token_required
def delete_cibil_score(score_id):
    """Delete a CIBIL score"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        cibil_score = CibilScore.objects.get(id=ObjectId(score_id), user_id=ObjectId(user_id))
        cibil_score.delete()
        
        return jsonify({'message': 'CIBIL score deleted successfully'}), 200
    except CibilScore.DoesNotExist:
        return jsonify({'error': 'CIBIL score not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/trend', methods=['GET'])
@token_required
def get_cibil_trend():
    """Get CIBIL score trend for the user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get date range
        days = request.args.get('days', 365, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get CIBIL scores in date range
        cibil_scores = CibilScore.objects(
            user_id=ObjectId(user_id),
            score_date__gte=start_date,
            score_date__lte=end_date
        ).order_by('score_date')
        
        # Calculate trend
        scores = [score.score for score in cibil_scores]
        if len(scores) < 2:
            trend = 'insufficient_data'
            change = 0
        else:
            change = scores[-1] - scores[0]
            if change > 10:
                trend = 'improving'
            elif change < -10:
                trend = 'declining'
            else:
                trend = 'stable'
        
        return jsonify({
            'period_days': days,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'scores': scores,
            'trend': trend,
            'change': change,
            'current_score': scores[-1] if scores else None,
            'previous_score': scores[-2] if len(scores) > 1 else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cibil_scores_bp.route('/summary', methods=['GET'])
@token_required
def get_cibil_summary():
    """Get CIBIL score summary for the user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get current score
        current_score = CibilScore.objects(user_id=ObjectId(user_id), is_current=True).first()
        
        if not current_score:
            return jsonify({'error': 'No CIBIL score found'}), 404
        
        # Get all scores for trend
        all_scores = CibilScore.objects(user_id=ObjectId(user_id)).order_by('score_date')
        
        # Calculate summary
        total_scores = len(all_scores)
        highest_score = max(score.score for score in all_scores) if all_scores else 0
        lowest_score = min(score.score for score in all_scores) if all_scores else 0
        average_score = sum(score.score for score in all_scores) / len(all_scores) if all_scores else 0
        
        return jsonify({
            'current_score': current_score.score,
            'score_range': current_score.score_range,
            'credit_grade': current_score.get_credit_grade(),
            'is_score_good': current_score.is_score_good(),
            'total_scores': total_scores,
            'highest_score': highest_score,
            'lowest_score': lowest_score,
            'average_score': float(average_score),
            'score_description': current_score.get_score_description(),
            'improvement_suggestions': current_score.get_improvement_suggestions()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
