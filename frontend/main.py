import cv2
import requests
import json
import base64

# Flask API configuration
FLASK_API_URL = "http://localhost:5000/api"

def encode_frame_to_base64(frame):
    """Convert frame to base64 string for API transmission"""
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def decode_base64_to_frame(base64_string):
    """Convert base64 string back to cv2 frame"""
    try:
        import numpy as np
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print(f"Error decoding frame: {e}")
        return None

def call_flask_api(endpoint, data):
    """Generic function to call Flask API endpoints"""
    try:
        response = requests.post(f"{FLASK_API_URL}/{endpoint}", 
                               json=data, 
                               timeout=2)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API Error: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"API Connection Error: {e}")
        return None

def send_frame_for_analysis(frame):
    """Send frame to Flask backend that uses YOUR classes"""
    data = {
        'frame': encode_frame_to_base64(frame)
    }
    return call_flask_api("analyze-frame", data)

def get_gemini_feedback(frame, issue):
    """Request Gemini feedback for form issues"""
    data = {
        'frame': encode_frame_to_base64(frame),
        'issue': issue,
        'exercise_type': 'pullup'
    }
    return call_flask_api("get-gemini-feedback", data)

def main(video_path=0):
    cap = cv2.VideoCapture(video_path)
    
    # Variables for optimization
    frame_count = 0
    use_backend = True  # Set to False to run locally without API
    gemini_feedback_interval = 30  # Get AI feedback every 30 frames
    last_gemini_feedback = ""
    
    # Check if backend is available
    try:
        health_response = requests.get(f"{FLASK_API_URL}/health", timeout=2)
        if health_response.status_code != 200:
            use_backend = False
            print("Backend not available, running in local mode...")
    except:
        use_backend = False
        print("Backend not available, running in local mode...")
    
    # Local fallback imports (if backend is not available)
    if not use_backend:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
        from model.pose_detector import PoseDetector
        from model.feedback_rules import check_pullup_form
        from model.rep_counter import RepCounter
        
        detector = PoseDetector()
        counter = RepCounter("pullup")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        if use_backend:
            # === BACKEND MODE: Use your classes through Flask API ===
            api_response = send_frame_for_analysis(frame)
            
            if api_response:
                # Get processed frame from backend (with pose overlay)
                processed_frame_b64 = api_response.get('processed_frame', '')
                if processed_frame_b64:
                    processed_frame = decode_base64_to_frame(processed_frame_b64)
                    if processed_frame is not None:
                        frame = processed_frame
                
                # Get data from YOUR backend classes
                reps = api_response.get('reps', 0)
                feedback = api_response.get('feedback', 'No data')
                armpit_angle = api_response.get('armpit_angle', 0.0)
                stage = api_response.get('stage', '')
                
                # Get Gemini feedback for form issues (less frequently)
                if (frame_count % gemini_feedback_interval == 0 and 
                    feedback not in ["Good form", "No person detected"]):
                    
                    gemini_response = get_gemini_feedback(frame, feedback)
                    if gemini_response and 'advice' in gemini_response:
                        last_gemini_feedback = gemini_response['advice']
            else:
                # API failed, show last known state
                reps = 0
                feedback = "Backend connection lost"
                armpit_angle = 0.0
        
        else:
            # === LOCAL MODE: Direct use of your classes (fallback) ===
            frame, landmarks = detector.detect_pose(frame)
            landmarks_list = landmarks.landmark if landmarks else None
            
            if landmarks_list:
                feedback = check_pullup_form(landmarks_list, counter.stage)
                reps, armpit_angle = counter.update(landmarks_list)
            else:
                reps = counter.reps
                feedback = "No person detected"
                armpit_angle = 0.0
        
        # === DISPLAY INFO ON FRAME (same for both modes) ===
        cv2.putText(frame, f"Reps: {reps}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Feedback: {feedback}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(frame, f"Armpit Angle: {armpit_angle:.1f}", (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
        
        # Display mode indicator
        mode_text = "Backend Mode" if use_backend else "Local Mode"
        cv2.putText(frame, mode_text, (10, frame.shape[0] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Display Gemini AI feedback if available
        if last_gemini_feedback:
            # Split long feedback into multiple lines
            words = last_gemini_feedback.split()
            lines = []
            current_line = ""
            for word in words:
                if len(current_line + word) < 50:  # Fit text in frame
                    current_line += word + " "
                else:
                    lines.append(current_line.strip())
                    current_line = word + " "
            if current_line:
                lines.append(current_line.strip())
            
            # Display feedback lines
            y_offset = 120
            for line in lines[:3]:  # Show max 3 lines
                cv2.putText(frame, f"AI: {line}", (10, y_offset),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
                y_offset += 20
        
        # Show window
        cv2.imshow("Gym Form Detection", frame)
        
        # Handle key presses
        key = cv2.waitKey(10) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r') and use_backend:
            # Reset counter via API
            reset_response = requests.post(f"{FLASK_API_URL}/reset-counter")
            if reset_response.status_code == 200:
                print("Counter reset via API")
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    print("Starting Gym Form Detection...")
    print("Controls:")
    print("- 'q': Quit")
    print("- 'r': Reset counter (backend mode only)")
    print("\nTrying to connect to Flask backend...")
    main(0)  # 0 = default webcam