import cv2
import requests
import json
import base64
from model.pose_detector import PoseDetector
from model.feedback_rules import check_pullup_form
from model.rep_counter import RepCounter

# Flask API configuration
FLASK_API_URL = "http://localhost:5000/api"

def encode_frame_to_base64(frame):
    """Convert frame to base64 string for API transmission"""
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def call_flask_api(endpoint, data):
    """Generic function to call Flask API endpoints"""
    try:
        response = requests.post(f"{FLASK_API_URL}/{endpoint}", 
                               json=data, 
                               timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API Error: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"API Connection Error: {e}")
        return None

def send_pose_analysis(landmarks_list, stage, frame, armpit_angle):
    """Send pose data to Flask for analysis"""
    # Convert landmarks to serializable format
    landmarks_data = []
    if landmarks_list:
        for landmark in landmarks_list:
            landmarks_data.append({
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })
    
    data = {
        'landmarks': landmarks_data,
        'stage': stage,
        'armpit_angle': armpit_angle,
        'frame': encode_frame_to_base64(frame)  # Send frame for Gemini analysis
    }
    
    return call_flask_api("analyze-pose", data)

def send_feedback_request(frame, landmarks_data, feedback_issue):
    """Send frame to Flask for Gemini AI feedback"""
    data = {
        'frame': encode_frame_to_base64(frame),
        'landmarks': landmarks_data,
        'issue': feedback_issue,
        'exercise_type': 'pullup'
    }
    
    return call_flask_api("get-gemini-feedback", data)

def update_reps_api(current_reps, stage):
    """Update rep count via API"""
    data = {
        'reps': current_reps,
        'stage': stage,
        'exercise_type': 'pullup'
    }
    
    return call_flask_api("update-reps", data)

def main(video_path=0):
    cap = cv2.VideoCapture(video_path)
    detector = PoseDetector()
    counter = RepCounter("pullup")  # tracking pull-ups
    
    # Variables for API optimization
    frame_count = 0
    api_call_interval = 10  # Call API every 10 frames to avoid overwhelming
    last_gemini_feedback = ""
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Detect pose
        frame, landmarks = detector.detect_pose(frame)
        landmarks_list = landmarks.landmark if landmarks else None
        feedback = None
        armpit_angle = 0.0
        
        if landmarks_list:
            # Local form checking (fast)
            feedback = check_pullup_form(landmarks_list, counter.stage)
            reps, armpit_angle = counter.update(landmarks_list)
            
            # API calls (less frequent to avoid lag)
            if frame_count % api_call_interval == 0:
                # Send pose analysis to Flask
                api_response = send_pose_analysis(landmarks_list, counter.stage, frame, armpit_angle)
                
                if api_response:
                    # Update reps via API
                    rep_response = update_reps_api(reps, counter.stage)
                    
                    # If poor form detected, get Gemini feedback
                    if feedback and feedback != "Good form" and feedback != "No person detected":
                        landmarks_data = [{
                            'x': lm.x, 'y': lm.y, 'z': lm.z, 'visibility': lm.visibility
                        } for lm in landmarks_list]
                        
                        gemini_response = send_feedback_request(frame, landmarks_data, feedback)
                        if gemini_response and 'advice' in gemini_response:
                            last_gemini_feedback = gemini_response['advice']
            
        else:
            reps = counter.reps  # keep last reps
            feedback = "No person detected"
        
        # Overlay info on frame
        cv2.putText(frame, f"Reps: {reps}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Feedback: {feedback}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(frame, f"Armpit Angle: {armpit_angle:.1f}", (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
        
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
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main(0)  # 0 = default webcam