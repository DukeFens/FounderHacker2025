"""
Example usage of HTTP requests to Flask API endpoints
This script demonstrates how to use the functions from app.py
"""

import cv2
import numpy as np
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import (
    call_flask_api, 
    send_pose_analysis, 
    send_feedback_request, 
    update_reps_api,
    encode_frame_to_base64
)

def example_health_check():
    """Example: Check if the Flask server is running"""
    print("=== Health Check Example ===")
    
    try:
        response = call_flask_api("health", {})
        if response:
            print("✅ Server is healthy!")
            print(f"Response: {response}")
        else:
            print("❌ Server is not responding")
    except Exception as e:
        print(f"❌ Error: {e}")

def example_pose_analysis():
    """Example: Send pose data for analysis"""
    print("\n=== Pose Analysis Example ===")
    
    # Create a mock frame (black image)
    mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Create mock landmarks (MediaPipe format)
    mock_landmarks = [
        type('Landmark', (), {
            'x': 0.5, 'y': 0.3, 'z': 0.1, 'visibility': 0.9
        })(),
        type('Landmark', (), {
            'x': 0.6, 'y': 0.4, 'z': 0.2, 'visibility': 0.8
        })()
    ]
    
    stage = "up"
    armpit_angle = 45.0
    
    try:
        response = send_pose_analysis(mock_landmarks, stage, mock_frame, armpit_angle)
        if response:
            print("✅ Pose analysis successful!")
            print(f"Feedback: {response.get('feedback', 'N/A')}")
            print(f"Reps: {response.get('reps', 'N/A')}")
            print(f"Armpit Angle: {response.get('armpit_angle', 'N/A')}")
        else:
            print("❌ Pose analysis failed")
    except Exception as e:
        print(f"❌ Error: {e}")

def example_gemini_feedback():
    """Example: Get AI feedback for form issues"""
    print("\n=== Gemini Feedback Example ===")
    
    # Create a mock frame
    mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Create mock landmarks data
    landmarks_data = [
        {'x': 0.5, 'y': 0.3, 'z': 0.1, 'visibility': 0.9},
        {'x': 0.6, 'y': 0.4, 'z': 0.2, 'visibility': 0.8}
    ]
    
    feedback_issue = "Poor form detected - keep your core engaged"
    
    try:
        response = send_feedback_request(mock_frame, landmarks_data, feedback_issue)
        if response:
            print("✅ Gemini feedback received!")
            print(f"Advice: {response.get('advice', 'N/A')}")
            print(f"Confidence: {response.get('confidence', 'N/A')}")
        else:
            print("❌ Failed to get Gemini feedback")
    except Exception as e:
        print(f"❌ Error: {e}")

def example_update_reps():
    """Example: Update rep count"""
    print("\n=== Update Reps Example ===")
    
    current_reps = 5
    stage = "down"
    
    try:
        response = update_reps_api(current_reps, stage)
        if response:
            print("✅ Reps updated successfully!")
            print(f"Current Reps: {response.get('reps', 'N/A')}")
            print(f"Stage: {response.get('stage', 'N/A')}")
        else:
            print("❌ Failed to update reps")
    except Exception as e:
        print(f"❌ Error: {e}")

def example_custom_api_call():
    """Example: Make a custom API call"""
    print("\n=== Custom API Call Example ===")
    
    # Example: Reset the counter
    try:
        response = call_flask_api("reset-counter", {})
        if response:
            print("✅ Counter reset successful!")
            print(f"Response: {response}")
        else:
            print("❌ Failed to reset counter")
    except Exception as e:
        print(f"❌ Error: {e}")

def example_with_real_camera():
    """Example: Using real camera feed (if available)"""
    print("\n=== Real Camera Example ===")
    print("This example requires a camera to be connected")
    
    # Try to open camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ No camera available")
        return
    
    print("✅ Camera opened successfully")
    
    # Capture one frame
    ret, frame = cap.read()
    if ret:
        print("✅ Frame captured successfully")
        
        # Example: Analyze the frame
        try:
            # Create mock landmarks for this example
            mock_landmarks = [
                type('Landmark', (), {
                    'x': 0.5, 'y': 0.3, 'z': 0.1, 'visibility': 0.9
                })()
            ]
            
            response = send_pose_analysis(mock_landmarks, "up", frame, 45.0)
            if response:
                print("✅ Frame analysis successful!")
                print(f"Feedback: {response.get('feedback', 'N/A')}")
            else:
                print("❌ Frame analysis failed")
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print("❌ Failed to capture frame")
    
    cap.release()

def main():
    """Run all examples"""
    print("=== Flask API Usage Examples ===")
    print("Make sure the Flask server is running first!")
    print("Run: python flask_server.py")
    print()
    
    # Run examples
    example_health_check()
    example_pose_analysis()
    example_gemini_feedback()
    example_update_reps()
    example_custom_api_call()
    
    # Uncomment the line below if you want to test with a real camera
    # example_with_real_camera()
    
    print("\n=== Examples Complete ===")
    print("Check the output above to see if all API calls were successful.")

if __name__ == "__main__":
    main()
