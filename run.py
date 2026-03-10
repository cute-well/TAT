# run.py
import os
import sys
import subprocess
import webbrowser
from threading import Timer

def main():
    print("=" * 50)
    print("🚀 Smart Document Management System")
    print("=" * 50)
    
    # Get current directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Install dependencies if needed
    print("\n📦 Checking dependencies...")
    try:
        import flask
        print("✅ Flask already installed")
    except ImportError:
        print("📥 Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Create uploads folder
    uploads_dir = os.path.join(base_dir, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    print(f"✅ Uploads folder: {uploads_dir}")
    
    # Open browser
    def open_browser():
        webbrowser.open('http://localhost:5000')
    
    Timer(2, open_browser).start()
    
    # Start server
    print("\n🌐 Starting backend server...")
    print("📱 API: http://localhost:5000/api")
    print("🔌 WebSocket: ws://localhost:5000")
    print("=" * 50)
    
    # Run the app
    os.environ['FLASK_ENV'] = 'development'
    subprocess.run([sys.executable, "app.py"])

if __name__ == '__main__':
    main()