#!/usr/bin/env python3
"""
Test script to verify exercise type handling
"""
import requests
import json
import cv2
import base64

def encode_frame_to_base64(frame):
    """Convert frame to base64 string for API transmission"""
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def test_exercise_switching():
    """Test switching between different exercise types"""
    
    # Test Flask server health first
    try:
        health_response = requests.get("http://localhost:5000/api/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ Flask server is not running. Start it with: python flask_server.py")
            return
        print("✅ Flask server is healthy")
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to Flask server. Start it with: python flask_server.py")
        return
    
    # Create a dummy frame for testing
    dummy_frame = cv2.imread('/dev/null') if cv2.imread('/dev/null') is not None else None
    if dummy_frame is None:
        # Create a simple test image
        import numpy as np
        dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    frame_b64 = encode_frame_to_base64(dummy_frame)
    
    # Test different exercise types
    exercises = ['pullup', 'squat', 'shoulderabduction']
    
    for exercise in exercises:
        print(f"\n🏃 Testing {exercise}...")
        
        api_data = {
            "frame": frame_b64,
            "exercise_type": exercise
        }
        
        try:
            response = requests.post("http://localhost:5000/api/analyze-frame", 
                                   json=api_data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {exercise} response:")
                print(f"   Exercise type: {result.get('exercise_type', 'N/A')}")
                print(f"   Feedback: {result.get('feedback', 'N/A')}")
                print(f"   Has pose: {result.get('has_pose', 'N/A')}")
                print(f"   Reps: {result.get('reps', 'N/A')}")
            else:
                print(f"❌ {exercise} failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {exercise} request failed: {e}")

if __name__ == "__main__":
    print("🧪 Exercise Type Switching Test")
    print("=" * 50)
    test_exercise_switching()
    print("\n✨ Test complete!")
