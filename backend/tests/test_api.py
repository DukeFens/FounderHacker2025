import requests
import json
import base64
import cv2
import numpy as np

# Flask API configuration
FLASK_API_URL = "http://localhost:5000/api"

def encode_frame_to_base64(frame):
    """Convert frame to base64 string for API transmission"""
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{FLASK_API_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def test_analyze_pose():
    """Test the analyze-pose endpoint"""
    print("\nTesting analyze-pose endpoint...")
    
    # Create mock data
    mock_landmarks = [
        {"x": 0.5, "y": 0.3, "z": 0.1, "visibility": 0.9},
        {"x": 0.6, "y": 0.4, "z": 0.2, "visibility": 0.8},
        # Add more landmarks as needed
    ]
    
    # Create a mock frame (black image)
    mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame_b64 = encode_frame_to_base64(mock_frame)
    
    data = {
        "landmarks": mock_landmarks,
        "stage": "up",
        "armpit_angle": 45.0,
        "frame": frame_b64
    }
    
    try:
        response = requests.post(f"{FLASK_API_URL}/analyze-pose", 
                               json=data, 
                               timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def test_get_gemini_feedback():
    """Test the get-gemini-feedback endpoint"""
    print("\nTesting get-gemini-feedback endpoint...")
    
    # Create a mock frame
    mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame_b64 = encode_frame_to_base64(mock_frame)
    
    mock_landmarks = [
        {"x": 0.5, "y": 0.3, "z": 0.1, "visibility": 0.9}
    ]
    
    data = {
        "frame": frame_b64,
        "landmarks": mock_landmarks,
        "issue": "Poor form detected",
        "exercise_type": "pullup"
    }
    
    try:
        response = requests.post(f"{FLASK_API_URL}/get-gemini-feedback", 
                               json=data, 
                               timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def test_update_reps():
    """Test the update-reps endpoint"""
    print("\nTesting update-reps endpoint...")
    
    data = {
        "reps": 5,
        "stage": "down",
        "exercise_type": "pullup"
    }
    
    try:
        response = requests.post(f"{FLASK_API_URL}/update-reps", 
                               json=data, 
                               timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def test_reset_counter():
    """Test the reset-counter endpoint"""
    print("\nTesting reset-counter endpoint...")
    
    try:
        response = requests.post(f"{FLASK_API_URL}/reset-counter", 
                               timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def test_analyze_frame():
    """Test the analyze-frame endpoint"""
    print("\nTesting analyze-frame endpoint...")
    
    # Create a mock frame
    mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame_b64 = encode_frame_to_base64(mock_frame)
    
    data = {
        "frame": frame_b64
    }
    
    try:
        response = requests.post(f"{FLASK_API_URL}/analyze-frame", 
                               json=data, 
                               timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all API tests"""
    print("=== Flask API Test Suite ===")
    print(f"Testing endpoints at: {FLASK_API_URL}")
    print("Make sure the Flask server is running first!")
    print("Run: python flask_server.py")
    print()
    
    # Test all endpoints
    tests = [
        ("Health Check", test_health_check),
        ("Analyze Pose", test_analyze_pose),
        ("Get Gemini Feedback", test_get_gemini_feedback),
        ("Update Reps", test_update_reps),
        ("Reset Counter", test_reset_counter),
        ("Analyze Frame", test_analyze_frame)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"--- {test_name} ---")
        success = test_func()
        results.append((test_name, success))
        print()
    
    # Summary
    print("=== Test Summary ===")
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nOverall: {passed}/{total} tests passed")

if __name__ == "__main__":
    main()
