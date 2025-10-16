from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from mongoengine import Document, StringField, BooleanField, DateTimeField, ReferenceField, ListField, IntField, FloatField

class User(Document):
	"""User model for authentication and user management"""
	
	# Core auth
	username = StringField(required=True, unique=True, max_length=80)
	email = StringField(required=True, unique=True, max_length=120)
	password_hash = StringField(required=True, max_length=255)
	first_name = StringField(required=True, max_length=50)
	last_name = StringField(required=True, max_length=50)
	is_active = BooleanField(default=True)
	is_admin = BooleanField(default=False)
	role = StringField(default='user', choices=['user', 'manager', 'admin'])
	
	# Security features
	password_reset_token = StringField(max_length=255)
	password_reset_expires = DateTimeField()
	login_attempts = IntField(default=0)
	locked_until = DateTimeField()
	last_login = DateTimeField()
	last_activity = DateTimeField()
	session_id = StringField(max_length=255)
	
	# Two-factor authentication
	two_factor_enabled = BooleanField(default=False)
	two_factor_secret = StringField(max_length=255)
	backup_codes = ListField(StringField(max_length=10))
	
	# Account security
	email_verified = BooleanField(default=False)
	phone_verified = BooleanField(default=False)
	security_questions = ListField(StringField(max_length=500))
	
	created_at = DateTimeField(default=datetime.utcnow)
	updated_at = DateTimeField(default=datetime.utcnow)
	
	# Relationships
	orders = ListField(ReferenceField('Order'))
	
	# Personal information
	age = IntField()
	gender = StringField(choices=["male", "female", "other", "prefer_not_to_say"]) 
	nationality = StringField(max_length=80)
	address = StringField(max_length=500)
	phone_number = StringField(max_length=30)
	pan = StringField(max_length=20)
	aadhaar = StringField(max_length=20)
	salary_slips = ListField(StringField(max_length=255))  # file URLs or references
	
	# Employment details
	employment_type = StringField(choices=["salaried", "unemployed", "self employed"]) 
	company = StringField(max_length=200)
	years_of_experience = IntField()
	
	# Financial information
	annual_income = FloatField()
	bank_account_details = StringField(max_length=255)
	estimated_existing_loan_amount = FloatField()
	
	meta = {
		'collection': 'users',
		'indexes': [
			'username',
			'email',
			'created_at'
		]
	}
	
	@classmethod
	def create_user(cls, username, email, password, first_name, last_name):
		"""Create a new user with password hashing"""
		user = cls()
		user.username = username
		user.email = email
		user.set_password(password)
		user.first_name = first_name
		user.last_name = last_name
		return user
	
	def set_password(self, password):
		"""Hash and set password"""
		self.password_hash = generate_password_hash(password)
	
	def check_password(self, password):
		"""Check if provided password matches hash"""
		return check_password_hash(self.password_hash, password)
	
	def save(self, *args, **kwargs):
		"""Override save to update updated_at timestamp"""
		self.updated_at = datetime.utcnow()
		return super().save(*args, **kwargs)
	
	def to_dict(self):
		"""Convert user to dictionary for JSON serialization"""
		return {
			'id': str(self.id),
			'username': self.username,
			'email': self.email,
			'first_name': self.first_name,
			'last_name': self.last_name,
			'is_active': self.is_active,
			'is_admin': self.is_admin,
			'created_at': self.created_at.isoformat() if self.created_at else None,
			'updated_at': self.updated_at.isoformat() if self.updated_at else None,
			# Personal
			'age': self.age,
			'gender': self.gender,
			'nationality': self.nationality,
			'address': self.address,
			'phone_number': self.phone_number,
			'pan': self.pan,
			'aadhaar': self.aadhaar,
			'salary_slips': list(self.salary_slips) if self.salary_slips else [],
			# Employment
			'employment_type': self.employment_type,
			'company': self.company,
			'years_of_experience': self.years_of_experience,
			# Financial
			'annual_income': self.annual_income,
			'bank_account_details': self.bank_account_details,
			'estimated_existing_loan_amount': self.estimated_existing_loan_amount,
		}
	
	def is_account_locked(self):
		"""Check if account is locked due to too many failed login attempts"""
		if self.locked_until and datetime.utcnow() < self.locked_until:
			return True
		return False
	
	def lock_account(self, minutes=30):
		"""Lock account for specified minutes"""
		self.locked_until = datetime.utcnow() + timedelta(minutes=minutes)
		self.save()
	
	def unlock_account(self):
		"""Unlock account"""
		self.locked_until = None
		self.login_attempts = 0
		self.save()
	
	def increment_login_attempts(self):
		"""Increment failed login attempts"""
		self.login_attempts += 1
		if self.login_attempts >= 5:  # Lock after 5 attempts
			self.lock_account()
		self.save()
	
	def reset_login_attempts(self):
		"""Reset failed login attempts"""
		self.login_attempts = 0
		self.locked_until = None
		self.save()
	
	def update_last_login(self):
		"""Update last login timestamp"""
		self.last_login = datetime.utcnow()
		self.last_activity = datetime.utcnow()
		self.save()
	
	def update_last_activity(self):
		"""Update last activity timestamp"""
		self.last_activity = datetime.utcnow()
		self.save()
	
	def set_password_reset_token(self, token, expires_in_hours=1):
		"""Set password reset token"""
		self.password_reset_token = token
		self.password_reset_expires = datetime.utcnow() + timedelta(hours=expires_in_hours)
		self.save()
	
	def clear_password_reset_token(self):
		"""Clear password reset token"""
		self.password_reset_token = None
		self.password_reset_expires = None
		self.save()
	
	def is_password_reset_token_valid(self, token):
		"""Check if password reset token is valid"""
		if not self.password_reset_token or not self.password_reset_expires:
			return False
		if self.password_reset_token != token:
			return False
		if datetime.utcnow() > self.password_reset_expires:
			return False
		return True
	
	def enable_two_factor(self, secret):
		"""Enable two-factor authentication"""
		self.two_factor_enabled = True
		self.two_factor_secret = secret
		# Generate backup codes
		import secrets
		self.backup_codes = [secrets.token_hex(4) for _ in range(10)]
		self.save()
	
	def disable_two_factor(self):
		"""Disable two-factor authentication"""
		self.two_factor_enabled = False
		self.two_factor_secret = None
		self.backup_codes = []
		self.save()
	
	def verify_backup_code(self, code):
		"""Verify and consume a backup code"""
		if code in self.backup_codes:
			self.backup_codes.remove(code)
			self.save()
			return True
		return False
	
	def has_permission(self, permission):
		"""Check if user has specific permission"""
		from services.auth import get_user_permissions
		permissions = get_user_permissions(self.role)
		return permission in permissions
	
	def is_session_valid(self):
		"""Check if user session is still valid"""
		from services.auth import validate_session_timeout
		if not self.last_activity:
			return False
		return validate_session_timeout(str(self.id), self.last_activity)
	
	def get_security_summary(self):
		"""Get security summary for user"""
		return {
			'email_verified': self.email_verified,
			'phone_verified': self.phone_verified,
			'two_factor_enabled': self.two_factor_enabled,
			'last_login': self.last_login.isoformat() if self.last_login else None,
			'login_attempts': self.login_attempts,
			'is_locked': self.is_account_locked(),
			'role': self.role,
			'is_admin': self.is_admin
		}
	
	def __repr__(self):
		return f'<User {self.username}>'
