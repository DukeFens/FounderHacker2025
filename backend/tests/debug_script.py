#!/usr/bin/env python3
"""
Flask API Debugging Script
This script helps identify why API calls are failing
"""

import requests
import json
import time
import socket
from urllib.parse import urlparse

FLASK_API_URL = "http://localhost:5000/api"

def check_server_connection():
    """Check if the Flask server is running and accessible"""
    print("=== Server Connection Check ===")
    
    # Parse URL
    parsed = urlparse(FLASK_API_URL)
    host = parsed.hostname or 'localhost'
    port = parsed.port or 5000
    
    print(f"Checking connection to {host}:{port}...")
    
    # Test socket connection
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print("✅ Socket connection successful - Server is listening")
            return True
        else:
            print(f"❌ Socket connection failed - Error code: {result}")
            print("   Possible causes:")
            print("   - Flask server is not running")
            print("   - Server is running on a different port")
            print("   - Firewall blocking the connection")
            return False
    except Exception as e:
        print(f"❌ Socket connection error: {e}")
        return False

def test_health_endpoint():
    """Test the health endpoint with detailed error handling"""
    print("\n=== Health Endpoint Test ===")
    
    url = f"{FLASK_API_URL}/health"
    print(f"Testing: {url}")
    
    try:
        print("Making request...")
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Health check successful!")
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                return True
            except json.JSONDecodeError:
                print(f"⚠️ Response is not JSON: {response.text}")
                return False
        else:
            print(f"❌ Health check failed!")
            print(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.ConnectError as e:
        print(f"❌ Connection Error: {e}")
        print("   The server is likely not running or not accessible")
        return False
    except requests.exceptions.Timeout as e:
        print(f"❌ Timeout Error: {e}")
        print("   The server is taking too long to respond")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def test_simple_post_endpoint():
    """Test a simple POST endpoint"""
    print("\n=== Simple POST Test ===")
    
    url = f"{FLASK_API_URL}/reset-counter"
    print(f"Testing: {url}")
    
    try:
        response = requests.post(url, 
                               json={}, 
                               timeout=10,
                               headers={'Content-Type': 'application/json'})
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ POST request successful!")
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                return True
            except json.JSONDecodeError:
                print(f"⚠️ Response is not JSON: {response.text}")
                return False
        else:
            print(f"❌ POST request failed!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ POST Error: {e}")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n=== Dependency Check ===")
    
    required_modules = [
        'requests', 'json', 'base64', 'cv2', 'numpy', 
        'flask', 'flask_cors'
    ]
    
    missing_modules = []
    
    for module in required_modules:
        try:
            if module == 'cv2':
                import cv2
            elif module == 'flask_cors':
                from flask_cors import CORS
            else:
                __import__(module)
            print(f"✅ {module}")
        except ImportError:
            print(f"❌ {module} - NOT INSTALLED")
            missing_modules.append(module)
    
    if missing_modules:
        print(f"\n⚠️ Missing modules: {', '.join(missing_modules)}")
        print("Install them with:")
        for module in missing_modules:
            if module == 'cv2':
                print("   pip install opencv-python")
            elif module == 'flask_cors':
                print("   pip install flask-cors")
            else:
                print(f"   pip install {module}")
        return False
    else:
        print("\n✅ All dependencies are installed!")
        return True

def debug_app_imports():
    """Check if the model imports in your app are working"""
    print("\n=== Model Import Check ===")
    
    try:
        from model.pose_detector import PoseDetector
        print("✅ PoseDetector import successful")
    except ImportError as e:
        print(f"❌ PoseDetector import failed: {e}")
        print("   Check if model/pose_detector.py exists")
    
    try:
        from model.feedback_rules import check_pullup_form
        print("✅ feedback_rules import successful")
    except ImportError as e:
        print(f"❌ feedback_rules import failed: {e}")
        print("   Check if model/feedback_rules.py exists")
    
    try:
        from model.rep_counter import RepCounter
        print("✅ RepCounter import successful")
    except ImportError as e:
        print(f"❌ RepCounter import failed: {e}")
        print("   Check if model/rep_counter.py exists")

def comprehensive_debug():
    """Run all debugging tests"""
    print("🔍 FLASK API COMPREHENSIVE DEBUG")
    print("=" * 50)
    
    # Step 1: Check dependencies
    deps_ok = check_dependencies()
    
    # Step 2: Check model imports
    debug_app_imports()
    
    # Step 3: Check server connection
    server_ok = check_server_connection()
    
    # Step 4: Test health endpoint
    health_ok = False
    if server_ok:
        health_ok = test_health_endpoint()
    
    # Step 5: Test simple POST
    post_ok = False
    if health_ok:
        post_ok = test_simple_post_endpoint()
    
    # Summary
    print("\n" + "=" * 50)
    print("🏁 DEBUG SUMMARY")
    print("=" * 50)
    print(f"Dependencies: {'✅ OK' if deps_ok else '❌ ISSUES'}")
    print(f"Server Connection: {'✅ OK' if server_ok else '❌ FAILED'}")
    print(f"Health Endpoint: {'✅ OK' if health_ok else '❌ FAILED'}")
    print(f"POST Endpoint: {'✅ OK' if post_ok else '❌ FAILED'}")
    
    if not server_ok:
        print("\n🚨 MAIN ISSUE: Flask server is not running or not accessible")
        print("🔧 SOLUTIONS:")
        print("   1. Start the Flask server: python flask_server.py")
        print("   2. Check if another process is using port 5000")
        print("   3. Try changing the port in flask_server.py")
        print("   4. Check firewall settings")
    elif not health_ok:
        print("\n🚨 MAIN ISSUE: Server is running but not responding correctly")
        print("🔧 SOLUTIONS:")
        print("   1. Check server logs for errors")
        print("   2. Verify CORS configuration")
        print("   3. Check if all imports in flask_server.py work")
    elif post_ok:
        print("\n✅ ALL GOOD: API should be working fine!")
        print("   If you're still having issues, check your specific API calls")
    else:
        print("\n🚨 ISSUE: GET works but POST doesn't")
        print("🔧 SOLUTIONS:")
        print("   1. Check Content-Type headers")
        print("   2. Verify JSON data format")
        print("   3. Check server request handling")

if __name__ == "__main__":
    comprehensive_debug()