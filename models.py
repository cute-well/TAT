# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(500))
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    process_date = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='pending')
    category = db.Column(db.String(100))
    confidence = db.Column(db.Float)
    
    # Extracted data stored as JSON
    extracted_names = db.Column(db.Text)  # JSON array
    extracted_dates = db.Column(db.Text)  # JSON array
    extracted_amounts = db.Column(db.Text)  # JSON array
    extracted_emails = db.Column(db.Text)  # JSON array
    extracted_phones = db.Column(db.Text)  # JSON array
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'file_size': self.file_size,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'status': self.status,
            'category': self.category or 'Uncategorized',
            'confidence': self.confidence,
            'extracted_data': {
                'names': json.loads(self.extracted_names) if self.extracted_names else [],
                'dates': json.loads(self.extracted_dates) if self.extracted_dates else [],
                'amounts': json.loads(self.extracted_amounts) if self.extracted_amounts else [],
                'emails': json.loads(self.extracted_emails) if self.extracted_emails else [],
                'phones': json.loads(self.extracted_phones) if self.extracted_phones else []
            }
        }

class Workflow(db.Model):
    __tablename__ = 'workflows'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    trigger_type = db.Column(db.String(50))
    trigger_config = db.Column(db.Text)  # JSON config
    actions = db.Column(db.Text)  # JSON array
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    executions = db.Column(db.Integer, default=0)
    last_run = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'trigger_type': self.trigger_type,
            'trigger_config': json.loads(self.trigger_config) if self.trigger_config else {},
            'actions': json.loads(self.actions) if self.actions else [],
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'executions': self.executions,
            'last_run': self.last_run.isoformat() if self.last_run else None
        }

class WorkflowLog(db.Model):
    __tablename__ = 'workflow_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.Integer, db.ForeignKey('workflows.id'))
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'))
    executed_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50))
    result = db.Column(db.Text)

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'))
    alert_type = db.Column(db.String(100))
    severity = db.Column(db.String(50))
    message = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    report_type = db.Column(db.String(50))
    format = db.Column(db.String(20))
    filepath = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    parameters = db.Column(db.Text)  # JSON
    status = db.Column(db.String(50), default='generated')