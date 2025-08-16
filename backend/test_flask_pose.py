#!/usr/bin/env python3
"""
Test script to verify Flask API pose detection and skeleton overlay functionality
"""
import cv2
import base64
import requests
import json
import time
import numpy as np
from model.pose_detector import PoseDetector

def encode_frame_to_base64(frame):
    """Convert frame to base64 string for API transmission"""
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def decode_base64_to_frame(base64_string):
    """Convert base64 string back to cv2 frame"""
    try:
        # Decode base64
        frame_data = base64.b64decode(base64_string)
        frame_array = np.frombuffer(frame_data, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print(f"Error decoding base64 frame: {e}")
        return None

def test_local_pose_detection():
    """Test local pose detection with skeleton overlay"""
    print("🎯 Testing local pose detection...")
    
    cap = cv2.VideoCapture(0)  # Use webcam
    detector = PoseDetector()
    
    print("📹 Starting webcam... Press 'q' to quit, 's' to test Flask API")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Detect pose locally
        frame_with_skeleton, landmarks = detector.detect_pose(frame, draw=True)
        
        # Add status text
        if landmarks:
            cv2.putText(frame_with_skeleton, "Pose Detected", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Count visible landmarks
            visible_count = sum(1 for lm in landmarks.landmark if lm.visibility > 0.5)
            cv2.putText(frame_with_skeleton, f"Visible landmarks: {visible_count}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        else:
            cv2.putText(frame_with_skeleton, "No Pose Detected", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        cv2.putText(frame_with_skeleton, "Press 's' to test Flask API", (10, frame.shape[0] - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        cv2.imshow("Local Pose Detection Test", frame_with_skeleton)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            test_flask_api_with_frame(frame)
    
    cap.release()
    cv2.destroyAllWindows()

def test_flask_api_with_frame(frame):
    """Test Flask API with a single frame"""
    print("🌐 Testing Flask API...")
    
    try:
        # Test health check first
        health_response = requests.get("http://localhost:5000/api/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Flask server is healthy")
        else:
            print("❌ Flask server health check failed")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Flask server: {e}")
        print("Make sure Flask server is running with: python flask_server.py")
        return
    
    # Encode frame
    frame_b64 = encode_frame_to_base64(frame)
    
    # Send to API
    try:
        api_data = {"frame": frame_b64}
        response = requests.post("http://localhost:5000/api/analyze-frame", 
                               json=api_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Flask API response received:")
            print(f"   Feedback: {result.get('feedback', 'N/A')}")
            print(f"   Reps: {result.get('reps', 'N/A')}")
            print(f"   Stage: {result.get('stage', 'N/A')}")
            print(f"   Has pose: {result.get('has_pose', 'N/A')}")
            
            if result.get('pose_landmarks'):
                landmarks_count = len(result['pose_landmarks'])
                print(f"   Pose landmarks: {landmarks_count} points")
                
                # Verify landmark structure
                if landmarks_count > 0:
                    sample_landmark = result['pose_landmarks'][0]
                    print(f"   Sample landmark: {sample_landmark}")
            else:
                print("   No pose landmarks returned")
                
        else:
            print(f"❌ Flask API error: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Flask API request failed: {e}")

def test_flask_api_only():
    """Test Flask API without camera"""
    print("🌐 Testing Flask API health...")
    
    try:
        # Test health check
        health_response = requests.get("http://localhost:5000/api/health", timeout=5)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print("✅ Flask server is healthy:")
            print(f"   Status: {health_data.get('status')}")
            print(f"   Message: {health_data.get('message')}")
        else:
            print("❌ Flask server health check failed")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Flask server: {e}")
        print("Make sure Flask server is running with: python flask_server.py")
        return False
    
    return True

if __name__ == "__main__":
    print("🧪 Flask Pose Detection Test")
    print("=" * 50)
    
    # First test Flask API connection
    if test_flask_api_only():
        print("\n🎥 Starting camera test...")
        print("This will open your webcam and show pose detection.")
        print("Press 's' while the camera is running to test the Flask API.")
        input("Press Enter to continue or Ctrl+C to exit...")
        
        test_local_pose_detection()
    else:
        print("\n❌ Flask API test failed. Please start the Flask server first:")
        print("   cd backend")
        print("   python flask_server.py")
