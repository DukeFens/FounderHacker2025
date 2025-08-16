from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from model.pose_detector import PoseDetector
from model.feedback_rules import check_pullup_form, check_squat_form, check_shoulder_abduction_form
from model.rep_counter import RepCounter

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize models
pose_detector = PoseDetector()
rep_counter = RepCounter("pullup")  # Default to pullup
current_exercise = "pullup"  # Track current exercise

def get_exercise_feedback(landmarks_list, stage, exercise_type="pullup"):
    """Get feedback based on exercise type"""
    if exercise_type.lower() == "pullup":
        return check_pullup_form(landmarks_list, stage)
    elif exercise_type.lower() == "squat":
        return check_squat_form(landmarks_list, stage)
    elif exercise_type.lower() == "shoulderabduction":
        return check_shoulder_abduction_form(landmarks_list, stage)
    else:
        return "Unknown exercise type"

def update_exercise_type(exercise_type):
    """Update the current exercise type and rep counter"""
    global rep_counter, current_exercise
    if exercise_type.lower() != current_exercise:
        old_exercise = current_exercise
        current_exercise = exercise_type.lower()
        rep_counter = RepCounter(current_exercise)
        print(f"🔄 Exercise changed from '{old_exercise}' to '{current_exercise}'")
        print(f"🔧 Rep counter reset for {current_exercise}")
    else:
        print(f"✅ Exercise remains: {current_exercise}")

def decode_base64_to_frame(base64_string):
    """Convert base64 string back to cv2 frame"""
    try:
        # Remove data URL prefix if present
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        frame_data = base64.b64decode(base64_string)
        frame_array = np.frombuffer(frame_data, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print(f"Error decoding base64 frame: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Flask server is running"})

@app.route('/api/reset-counter', methods=['POST'])
def reset_counter():
    """Reset the rep counter"""
    try:
        global rep_counter
        rep_counter.reset()
        return jsonify({"message": "Counter reset", "reps": 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-frame', methods=['POST'])
def analyze_frame():
    """Simple frame analysis - just rep counting and angle like app.py"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        frame_b64 = data.get('frame', '')
        exercise_type = data.get('exercise_type', 'pullup')
        
        if not frame_b64:
            return jsonify({"error": "No frame provided"}), 400
        
        # Update exercise type if it changed
        update_exercise_type(exercise_type)
        
        # Decode frame
        frame = decode_base64_to_frame(frame_b64)
        if frame is None:
            return jsonify({"error": "Invalid frame data"}), 400
        
        # Simple pose detection like app.py
        processed_frame, landmarks = pose_detector.detect_pose(frame, draw=True)
        
        if landmarks:
            landmarks_list = landmarks.landmark
            
            # Core functionality: Rep counting and angle calculation
            reps, angle_value = rep_counter.update(landmarks_list)
            
            # Simple feedback based on exercise type  
            feedback = get_exercise_feedback(landmarks_list, rep_counter.stage, exercise_type)
            
            # Encode processed frame with MediaPipe skeleton (like app.py)
            _, buffer = cv2.imencode('.jpg', processed_frame)
            processed_frame_b64 = base64.b64encode(buffer).decode('utf-8')
            
            return jsonify({
                "reps": reps,
                "armpit_angle": angle_value,  # Main angle for the exercise
                "stage": rep_counter.stage,
                "feedback": feedback,
                "processed_frame": processed_frame_b64,  # Frame with skeleton like app.py
                "has_pose": True
            })
        else:
            return jsonify({
                "reps": rep_counter.reps,
                "armpit_angle": 0.0,
                "stage": rep_counter.stage,
                "feedback": "No pose detected",
                "has_pose": False
            })
            
    except Exception as e:
        print(f"Error in analyze_frame: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask API Server (Simple like app.py)")
    print("📋 Available endpoints:")
    print("- POST /api/analyze-frame (main endpoint for rep counting & angles)")
    print("- POST /api/reset-counter")
    print("- GET /api/health")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
