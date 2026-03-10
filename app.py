# app.py
import os
import sys
import uuid
import json
import re
import random
from datetime import datetime, timedelta
from threading import Thread

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix

from models import db, Document, Workflow, WorkflowLog, Alert, Report, Setting

# Try to import OCR libraries (optional)
try:
    import pytesseract
    from PIL import Image
    import cv2
    import numpy as np
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("⚠️ OCR libraries not installed. Using mock OCR.")

# Initialize Flask app
app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'smart-dms-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dms.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp', 'gif'}

# Initialize extensions
CORS(app, origins=["http://localhost:5500", "http://127.0.0.1:5500", "file://", "*"])
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
db.init_app(app)

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ============ DATABASE INITIALIZATION ============
def init_database():
    """Initialize database with sample data"""
    with app.app_context():
        db.create_all()
        
        # Add sample workflows if empty
        if Workflow.query.count() == 0:
            sample_workflows = [
                Workflow(
                    name="High-Value Invoice Alert",
                    description="Send alert for invoices over $10,000",
                    trigger_type="field_value",
                    trigger_config=json.dumps({"field": "amount", "operator": ">", "value": 10000}),
                    actions=json.dumps(["email", "slack"]),
                    is_active=True,
                    executions=45,
                    last_run=datetime.utcnow() - timedelta(hours=5)
                ),
                Workflow(
                    name="Contract Expiry Notification",
                    description="Notify 30 days before contract expiry",
                    trigger_type="date",
                    trigger_config=json.dumps({"field": "expiry_date", "days": 30}),
                    actions=json.dumps(["email", "teams"]),
                    is_active=True,
                    executions=12,
                    last_run=datetime.utcnow() - timedelta(days=1)
                ),
                Workflow(
                    name="Auto-Organize Documents",
                    description="Move documents to folders by category",
                    trigger_type="document_type",
                    trigger_config=json.dumps({"always": True}),
                    actions=json.dumps(["move", "rename"]),
                    is_active=True,
                    executions=234,
                    last_run=datetime.utcnow() - timedelta(minutes=30)
                )
            ]
            for w in sample_workflows:
                db.session.add(w)
            
            # Add sample documents
            sample_docs = [
                Document(
                    filename="Invoice_ACME_2024-001.pdf",
                    filepath="uploads/sample1.pdf",
                    file_size=2450000,
                    mime_type="application/pdf",
                    upload_date=datetime.utcnow() - timedelta(days=5),
                    process_date=datetime.utcnow() - timedelta(days=5),
                    status="completed",
                    category="invoice",
                    confidence=0.95,
                    extracted_names=json.dumps(["John Smith", "ACME Corp"]),
                    extracted_dates=json.dumps(["2024-01-15", "2024-02-15"]),
                    extracted_amounts=json.dumps([1250.00, 150.00]),
                    extracted_emails=json.dumps(["john@acme.com"])
                ),
                Document(
                    filename="Contract_Agreement.pdf",
                    filepath="uploads/sample2.pdf",
                    file_size=3800000,
                    mime_type="application/pdf",
                    upload_date=datetime.utcnow() - timedelta(days=10),
                    process_date=datetime.utcnow() - timedelta(days=10),
                    status="completed",
                    category="contract",
                    confidence=0.88,
                    extracted_names=json.dumps(["Jane Doe", "Tech Solutions Inc"]),
                    extracted_dates=json.dumps(["2024-01-01", "2025-01-01"]),
                    extracted_amounts=json.dumps([50000.00])
                )
            ]
            for d in sample_docs:
                db.session.add(d)
            
            # Add sample alerts
            sample_alerts = [
                Alert(
                    document_id=1,
                    alert_type="workflow",
                    severity="critical",
                    message="High-value invoice detected: $12,500",
                    is_read=False,
                    created_at=datetime.utcnow() - timedelta(hours=2)
                ),
                Alert(
                    document_id=2,
                    alert_type="workflow",
                    severity="high",
                    message="Contract expiring in 30 days",
                    is_read=False,
                    created_at=datetime.utcnow() - timedelta(hours=5)
                ),
                Alert(
                    alert_type="system",
                    severity="low",
                    message="System backup completed successfully",
                    is_read=True,
                    created_at=datetime.utcnow() - timedelta(days=1)
                )
            ]
            for a in sample_alerts:
                db.session.add(a)
            
            db.session.commit()
            print("✅ Database initialized with sample data")

# Run database initialization
with app.app_context():
    init_database()

# ============ UTILITY FUNCTIONS ============
def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_from_image(image_path):
    """Extract text from image using OCR"""
    if not OCR_AVAILABLE:
        # Mock OCR for demo
        return mock_ocr_extraction()
    
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return mock_ocr_extraction()
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=30)
        
        # Threshold
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Extract text with Tesseract
        text = pytesseract.image_to_string(thresh)
        
        return text
    except Exception as e:
        print(f"OCR error: {e}")
        return mock_ocr_extraction()

def mock_ocr_extraction():
    """Generate mock OCR text for demo"""
    texts = [
        "INVOICE #INV-2024-001\nDate: 2024-01-15\nDue Date: 2024-02-15\nVendor: ACME Corp\nTotal Amount: $1,250.00\nTax: $150.00",
        "EMPLOYMENT CONTRACT\nBetween: Tech Solutions Inc\nAnd: Jane Doe\nEffective Date: January 1, 2024\nSalary: $50,000 per year",
        "RECEIPT\nStore: Amazon.com\nDate: 2024-01-15\nTotal: $89.99\nPayment Method: Visa",
        "RESUME\nName: Sarah Johnson\nEmail: sarah.j@email.com\nPhone: 555-0123\nExperience: 5 years in software development"
    ]
    return random.choice(texts)

def extract_structured_data(text):
    """Extract names, dates, amounts from text using regex"""
    extracted = {
        'names': [],
        'dates': [],
        'amounts': [],
        'emails': [],
        'phones': []
    }
    
    # Extract emails
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    extracted['emails'] = list(set(re.findall(email_pattern, text)))
    
    # Extract phone numbers
    phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    extracted['phones'] = list(set(re.findall(phone_pattern, text)))
    
    # Extract dates (YYYY-MM-DD or MM/DD/YYYY)
    date_patterns = [
        r'\d{4}-\d{2}-\d{2}',
        r'\d{1,2}/\d{1,2}/\d{4}',
        r'\d{1,2}-\d{1,2}-\d{4}'
    ]
    for pattern in date_patterns:
        matches = re.findall(pattern, text)
        extracted['dates'].extend(matches)
    
    # Extract amounts ($X,XXX.XX or X,XXX.XX USD)
    amount_pattern = r'\$\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|dollars?)'
    matches = re.findall(amount_pattern, text, re.IGNORECASE)
    extracted['amounts'] = [float(re.sub(r'[^\d.]', '', m)) for m in matches if re.sub(r'[^\d.]', '', m)]
    
    # Extract names (simple heuristic - capitalized words)
    lines = text.split('\n')
    for line in lines[:10]:
        words = line.split()
        name_candidates = []
        for word in words:
            if word and word[0].isupper() and len(word) > 1 and word.lower() not in ['the', 'and', 'for', 'with']:
                name_candidates.append(word)
            else:
                if len(name_candidates) >= 2:
                    extracted['names'].append(' '.join(name_candidates))
                name_candidates = []
        if len(name_candidates) >= 2:
            extracted['names'].append(' '.join(name_candidates))
    
    # Remove duplicates and limit
    for key in extracted:
        if isinstance(extracted[key], list):
            extracted[key] = list(set(extracted[key]))[:5]
    
    return extracted

def classify_document(text):
    """Classify document type based on keywords"""
    categories = {
        'invoice': ['invoice', 'bill', 'payment', 'due', 'total', 'amount', 'vendor'],
        'contract': ['agreement', 'contract', 'party', 'shall', 'hereby', 'witnesseth'],
        'receipt': ['receipt', 'paid', 'store', 'merchant', 'transaction'],
        'resume': ['resume', 'cv', 'experience', 'education', 'skills'],
        'report': ['report', 'summary', 'analysis', 'conclusion']
    }
    
    text_lower = text.lower()
    scores = {}
    
    for category, keywords in categories.items():
        score = sum(text_lower.count(keyword) for keyword in keywords)
        scores[category] = score
    
    if max(scores.values()) > 0:
        category = max(scores, key=scores.get)
        confidence = scores[category] / sum(scores.values()) if sum(scores.values()) > 0 else 0.5
        return category, min(confidence, 0.95)
    
    return 'general', 0.5

def check_workflows(document):
    """Check and trigger workflows based on document"""
    with app.app_context():
        workflows = Workflow.query.filter_by(is_active=True).all()
        doc_dict = document.to_dict()
        extracted = doc_dict['extracted_data']
        
        for workflow in workflows:
            should_trigger = False
            config = json.loads(workflow.trigger_config) if workflow.trigger_config else {}
            
            if workflow.trigger_type == 'document_type':
                should_trigger = config.get('always', False) or doc_dict['category'] == config.get('category')
            
            elif workflow.trigger_type == 'field_value':
                field = config.get('field')
                operator = config.get('operator')
                value = float(config.get('value', 0))
                
                if field == 'amount' and extracted.get('amounts'):
                    amount = float(extracted['amounts'][0])
                    if operator == '>' and amount > value:
                        should_trigger = True
                    elif operator == '<' and amount < value:
                        should_trigger = True
                    elif operator == '=' and amount == value:
                        should_trigger = True
            
            elif workflow.trigger_type == 'always':
                should_trigger = True
            
            if should_trigger:
                # Execute workflow actions
                execute_workflow(workflow, document)

def execute_workflow(workflow, document):
    """Execute workflow actions"""
    with app.app_context():
        actions = json.loads(workflow.actions) if workflow.actions else []
        
        for action in actions:
            # Create alert for notifications
            if action in ['email', 'slack', 'teams']:
                alert = Alert(
                    document_id=document.id,
                    alert_type='workflow',
                    severity='high' if action == 'email' else 'medium',
                    message=f'Workflow "{workflow.name}" triggered: {action} notification',
                    is_read=False
                )
                db.session.add(alert)
            
            # Log execution
            log = WorkflowLog(
                workflow_id=workflow.id,
                document_id=document.id,
                status='success',
                result=json.dumps({'action': action, 'message': f'Executed {action}'})
            )
            db.session.add(log)
        
        workflow.executions += 1
        workflow.last_run = datetime.utcnow()
        db.session.commit()
        
        # Emit real-time update
        socketio.emit('workflow_executed', {
            'workflow_id': workflow.id,
            'workflow_name': workflow.name,
            'document_id': document.id,
            'timestamp': datetime.utcnow().isoformat()
        })

# ============ API ROUTES ============

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'ocr_available': OCR_AVAILABLE
    })

# ============ DOCUMENT ROUTES ============

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Get all documents with optional filtering"""
    try:
        category = request.args.get('category')
        status = request.args.get('status')
        search = request.args.get('search')
        limit = request.args.get('limit', type=int)
        
        query = Document.query.order_by(Document.upload_date.desc())
        
        if category and category != 'undefined' and category != '':
            query = query.filter(Document.category == category)
        
        if status and status != 'undefined' and status != '':
            query = query.filter(Document.status == status)
        
        if search and search != 'undefined' and search != '':
            query = query.filter(
                db.or_(
                    Document.filename.contains(search),
                    Document.category.contains(search),
                    Document.extracted_names.contains(search)
                )
            )
        
        if limit:
            documents = query.limit(limit).all()
        else:
            documents = query.all()
        
        return jsonify([doc.to_dict() for doc in documents])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/<int:doc_id>', methods=['GET'])
def get_document(doc_id):
    """Get single document by ID"""
    try:
        document = Document.query.get_or_404(doc_id)
        return jsonify(document.to_dict())
    except Exception as e:
        return jsonify({'error': 'Document not found'}), 404

@app.route('/api/documents/upload', methods=['POST'])
def upload_document():
    """Upload and process a document"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        unique_id = str(uuid.uuid4())[:8]
        saved_filename = f"{unique_id}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], saved_filename)
        file.save(filepath)
        
        # Create document record
        document = Document(
            filename=filename,
            filepath=filepath,
            file_size=os.path.getsize(filepath),
            mime_type=file.mimetype,
            status='processing'
        )
        
        db.session.add(document)
        db.session.commit()
        
        # Process document in background
        def process_document():
            with app.app_context():
                try:
                    # Simulate OCR processing
                    doc = Document.query.get(document.id)
                    if not doc:
                        return
                    
                    # Extract text (mock OCR for demo)
                    text = mock_ocr_extraction()
                    
                    # Extract structured data
                    extracted = extract_structured_data(text)
                    
                    # Classify document
                    category, confidence = classify_document(text)
                    
                    # Update document
                    doc.category = category
                    doc.confidence = confidence
                    doc.extracted_names = json.dumps(extracted['names'])
                    doc.extracted_dates = json.dumps(extracted['dates'])
                    doc.extracted_amounts = json.dumps(extracted['amounts'])
                    doc.extracted_emails = json.dumps(extracted['emails'])
                    doc.extracted_phones = json.dumps(extracted['phones'])
                    doc.status = 'completed'
                    doc.process_date = datetime.utcnow()
                    
                    db.session.commit()
                    
                    # Check workflows
                    check_workflows(doc)
                    
                    # Create upload alert
                    alert = Alert(
                        document_id=doc.id,
                        alert_type='upload',
                        severity='low',
                        message=f'Document processed: {doc.filename}',
                        is_read=False
                    )
                    db.session.add(alert)
                    db.session.commit()
                    
                    # Emit real-time update
                    socketio.emit('document_processed', {
                        'id': doc.id,
                        'filename': doc.filename,
                        'category': doc.category,
                        'status': 'completed'
                    })
                    
                except Exception as e:
                    doc = Document.query.get(document.id)
                    if doc:
                        doc.status = 'failed'
                        db.session.commit()
                    print(f"Processing error: {e}")
        
        # Start background thread
        thread = Thread(target=process_document)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document': document.to_dict()
        }), 202
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/<int:doc_id>/download', methods=['GET'])
def download_document(doc_id):
    """Download document file"""
    try:
        document = Document.query.get_or_404(doc_id)
        if not os.path.exists(document.filepath):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            document.filepath,
            as_attachment=True,
            download_name=document.filename,
            mimetype=document.mime_type
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Delete document"""
    try:
        document = Document.query.get_or_404(doc_id)
        
        # Delete file
        if os.path.exists(document.filepath):
            os.remove(document.filepath)
        
        db.session.delete(document)
        db.session.commit()
        
        socketio.emit('document_deleted', {'id': doc_id})
        
        return jsonify({'message': 'Document deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ WORKFLOW ROUTES ============

@app.route('/api/workflows', methods=['GET'])
def get_workflows():
    """Get all workflows"""
    try:
        active_only = request.args.get('active') == 'true'
        query = Workflow.query.order_by(Workflow.created_at.desc())
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        workflows = query.all()
        return jsonify([w.to_dict() for w in workflows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/workflows', methods=['POST'])
def create_workflow():
    """Create new workflow"""
    try:
        data = request.json
        
        workflow = Workflow(
            name=data.get('name'),
            description=data.get('description', ''),
            trigger_type=data.get('trigger_type', 'always'),
            trigger_config=json.dumps(data.get('trigger_config', {})),
            actions=json.dumps(data.get('actions', [])),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(workflow)
        db.session.commit()
        
        socketio.emit('workflow_created', workflow.to_dict())
        
        return jsonify(workflow.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/workflows/<int:workflow_id>', methods=['PUT'])
def update_workflow(workflow_id):
    """Update workflow"""
    try:
        workflow = Workflow.query.get_or_404(workflow_id)
        data = request.json
        
        workflow.name = data.get('name', workflow.name)
        workflow.description = data.get('description', workflow.description)
        workflow.trigger_type = data.get('trigger_type', workflow.trigger_type)
        workflow.trigger_config = json.dumps(data.get('trigger_config', json.loads(workflow.trigger_config or '{}')))
        workflow.actions = json.dumps(data.get('actions', json.loads(workflow.actions or '[]')))
        workflow.is_active = data.get('is_active', workflow.is_active)
        
        db.session.commit()
        
        return jsonify(workflow.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/workflows/<int:workflow_id>/toggle', methods=['POST'])
def toggle_workflow(workflow_id):
    """Toggle workflow active status"""
    try:
        workflow = Workflow.query.get_or_404(workflow_id)
        workflow.is_active = not workflow.is_active
        db.session.commit()
        
        return jsonify({'is_active': workflow.is_active})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/workflows/<int:workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    """Delete workflow"""
    try:
        workflow = Workflow.query.get_or_404(workflow_id)
        db.session.delete(workflow)
        db.session.commit()
        
        return jsonify({'message': 'Workflow deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/workflows/<int:workflow_id>/logs', methods=['GET'])
def get_workflow_logs(workflow_id):
    """Get workflow execution logs"""
    try:
        logs = WorkflowLog.query.filter_by(workflow_id=workflow_id)\
            .order_by(WorkflowLog.executed_at.desc())\
            .limit(50).all()
        return jsonify([log.to_dict() for log in logs])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ ALERT ROUTES ============

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    try:
        unread_only = request.args.get('unread') == 'true'
        limit = request.args.get('limit', type=int, default=50)
        
        query = Alert.query.order_by(Alert.created_at.desc())
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        alerts = query.limit(limit).all()
        return jsonify([a.to_dict() for a in alerts])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts/<int:alert_id>/read', methods=['POST'])
def mark_alert_read(alert_id):
    """Mark alert as read"""
    try:
        alert = Alert.query.get_or_404(alert_id)
        alert.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Alert marked as read'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts/read-all', methods=['POST'])
def mark_all_alerts_read():
    """Mark all alerts as read"""
    try:
        Alert.query.update({Alert.is_read: True})
        db.session.commit()
        
        return jsonify({'message': 'All alerts marked as read'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Delete alert"""
    try:
        alert = Alert.query.get_or_404(alert_id)
        db.session.delete(alert)
        db.session.commit()
        
        return jsonify({'message': 'Alert deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ REPORT ROUTES ============

@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all reports"""
    try:
        reports = Report.query.order_by(Report.created_at.desc()).all()
        return jsonify([r.to_dict() for r in reports])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/generate', methods=['POST'])
def generate_report():
    """Generate a new report"""
    try:
        data = request.json
        report_type = data.get('report_type', 'summary')
        format = data.get('format', 'pdf')
        parameters = data.get('parameters', {})
        
        # Create report record
        report = Report(
            name=f"{report_type.capitalize()} Report {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            report_type=report_type,
            format=format,
            parameters=json.dumps(parameters),
            status='generating'
        )
        
        db.session.add(report)
        db.session.commit()
        
        # Simulate report generation in background
        def generate():
            with app.app_context():
                time.sleep(2)  # Simulate processing
                report = Report.query.get(report.id)
                if report:
                    report.status = 'completed'
                    db.session.commit()
                    
                    # Create alert
                    alert = Alert(
                        alert_type='report',
                        severity='low',
                        message=f'Report "{report.name}" generated successfully',
                        is_read=False
                    )
                    db.session.add(alert)
                    db.session.commit()
                    
                    socketio.emit('report_generated', report.to_dict())
        
        thread = Thread(target=generate)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'message': 'Report generation started',
            'report': report.to_dict()
        }), 202
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/<int:report_id>/download', methods=['GET'])
def download_report(report_id):
    """Download report (mock)"""
    try:
        report = Report.query.get_or_404(report_id)
        # In real implementation, generate and return file
        return jsonify({'message': 'Report download would start here'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ STATISTICS ROUTES ============

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get dashboard statistics"""
    try:
        # Basic counts
        total_docs = Document.query.count()
        completed_today = Document.query.filter(
            db.func.date(Document.process_date) == datetime.utcnow().date(),
            Document.status == 'completed'
        ).count()
        pending = Document.query.filter_by(status='processing').count()
        failed = Document.query.filter_by(status='failed').count()
        active_alerts = Alert.query.filter_by(is_read=False).count()
        
        # Category distribution
        categories = db.session.query(
            Document.category, db.func.count(Document.category)
        ).filter(Document.category.isnot(None)).group_by(Document.category).all()
        
        by_category = {cat or 'Uncategorized': count for cat, count in categories if cat}
        
        # Document trend (last 7 days)
        trend = []
        for i in range(6, -1, -1):
            date = (datetime.utcnow() - timedelta(days=i)).date()
            count = Document.query.filter(
                db.func.date(Document.upload_date) == date
            ).count()
            trend.append({
                'date': date.isoformat(),
                'count': count
            })
        
        return jsonify({
            'total_documents': total_docs,
            'processed_today': completed_today,
            'pending_documents': pending,
            'failed_documents': failed,
            'active_alerts': active_alerts,
            'by_category': by_category,
            'trend': trend
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ SEARCH ROUTES ============

@app.route('/api/search', methods=['GET'])
def search():
    """Global search across documents"""
    try:
        query = request.args.get('q', '')
        if len(query) < 2:
            return jsonify([])
        
        # Search in documents
        docs = Document.query.filter(
            db.or_(
                Document.filename.contains(query),
                Document.category.contains(query),
                Document.extracted_names.contains(query)
            )
        ).limit(20).all()
        
        return jsonify([doc.to_dict() for doc in docs])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ SETTINGS ROUTES ============

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get all settings"""
    try:
        settings = Setting.query.all()
        return jsonify([s.to_dict() for s in settings])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings/<key>', methods=['GET'])
def get_setting(key):
    """Get setting by key"""
    try:
        setting = Setting.query.filter_by(key=key).first()
        if not setting:
            return jsonify({'error': 'Setting not found'}), 404
        return jsonify(setting.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def update_setting():
    """Create or update setting"""
    try:
        data = request.json
        key = data.get('key')
        value = data.get('value')
        category = data.get('category', 'general')
        
        setting = Setting.query.filter_by(key=key).first()
        
        if setting:
            setting.value = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
            setting.category = category
        else:
            setting = Setting(
                key=key,
                value=json.dumps(value) if isinstance(value, (dict, list)) else str(value),
                category=category
            )
            db.session.add(setting)
        
        db.session.commit()
        
        return jsonify(setting.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ WEBSOCKET EVENTS ============

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"Client connected: {request.sid}")
    emit('connected', {'data': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")

@socketio.on('subscribe_documents')
def handle_subscribe_documents():
    """Subscribe to document updates"""
    join_room('documents')
    emit('subscribed', {'room': 'documents'})

@socketio.on('subscribe_alerts')
def handle_subscribe_alerts():
    """Subscribe to alert updates"""
    join_room('alerts')
    emit('subscribed', {'room': 'alerts'})

# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# ============ MAIN ============

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Smart Document Management System - Backend")
    print("=" * 50)
    print(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"🗄️  Database: SQLite (dms.db)")
    print(f"📡 API: http://localhost:5000/api")
    print(f"🔌 WebSocket: ws://localhost:5000")
    print(f"📊 OCR Available: {OCR_AVAILABLE}")
    print("=" * 50)
    
    # Run the app
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)