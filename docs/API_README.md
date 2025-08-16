# Flask API Usage Guide

This guide explains how to send HTTP requests to the Flask API endpoints for the pullup feedback system.

## Quick Start

### 1. Start the Flask Server

First, make sure you have all dependencies installed:

```bash
cd backend
pip install -r requirements.txt
```

Then start the Flask server:

```bash
python flask_server.py
```

The server will run on `http://localhost:5000` and display available endpoints.

### 2. Test the API

Run the test suite to verify everything is working:

```bash
python test_api.py
```

Or run the usage examples:

```bash
python example_usage.py
```

## Available Endpoints

### 1. Health Check
**GET** `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Flask server is running"
}
```

### 2. Analyze Pose
**POST** `/api/analyze-pose`

Analyze pose data and return feedback.

**Request Body:**
```json
{
  "landmarks": [
    {
      "x": 0.5,
      "y": 0.3,
      "z": 0.1,
      "visibility": 0.9
    }
  ],
  "stage": "up",
  "armpit_angle": 45.0,
  "frame": "base64_encoded_image"
}
```

**Response:**
```json
{
  "feedback": "Good form",
  "reps": 3,
  "armpit_angle": 45.0,
  "stage": "up",
  "processed_frame": "base64_encoded_processed_image"
}
```

### 3. Get Gemini Feedback
**POST** `/api/get-gemini-feedback`

Get AI feedback for form issues.

**Request Body:**
```json
{
  "frame": "base64_encoded_image",
  "landmarks": [
    {
      "x": 0.5,
      "y": 0.3,
      "z": 0.1,
      "visibility": 0.9
    }
  ],
  "issue": "Poor form detected",
  "exercise_type": "pullup"
}
```

**Response:**
```json
{
  "advice": "AI Feedback for Poor form detected: Focus on maintaining proper form...",
  "confidence": 0.85,
  "exercise_type": "pullup"
}
```

### 4. Update Reps
**POST** `/api/update-reps`

Update the rep counter.

**Request Body:**
```json
{
  "reps": 5,
  "stage": "down",
  "exercise_type": "pullup"
}
```

**Response:**
```json
{
  "success": true,
  "reps": 5,
  "stage": "down",
  "exercise_type": "pullup"
}
```

### 5. Reset Counter
**POST** `/api/reset-counter`

Reset the rep counter to zero.

**Response:**
```json
{
  "success": true,
  "message": "Counter reset successfully"
}
```

### 6. Analyze Frame
**POST** `/api/analyze-frame`

Analyze a single frame for pose detection.

**Request Body:**
```json
{
  "frame": "base64_encoded_image"
}
```

**Response:**
```json
{
  "feedback": "Good form",
  "reps": 3,
  "armpit_angle": 45.0,
  "stage": "up",
  "processed_frame": "base64_encoded_processed_image"
}
```

## Using the API in Your Code

### Method 1: Use the Existing Functions

Your `app.py` already has functions that make HTTP requests:

```python
from app import (
    call_flask_api,
    send_pose_analysis,
    send_feedback_request,
    update_reps_api
)

# Check server health
response = call_flask_api("health", {})

# Send pose analysis
response = send_pose_analysis(landmarks_list, stage, frame, armpit_angle)

# Get AI feedback
response = send_feedback_request(frame, landmarks_data, feedback_issue)

# Update reps
response = update_reps_api(current_reps, stage)
```

### Method 2: Direct HTTP Requests

You can also make direct HTTP requests using the `requests` library:

```python
import requests
import json
import base64
import cv2

FLASK_API_URL = "http://localhost:5000/api"

def encode_frame_to_base64(frame):
    """Convert frame to base64 string"""
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')

# Example: Analyze pose
def analyze_pose(landmarks, stage, frame, armpit_angle):
    data = {
        "landmarks": landmarks,
        "stage": stage,
        "armpit_angle": armpit_angle,
        "frame": encode_frame_to_base64(frame)
    }
    
    response = requests.post(f"{FLASK_API_URL}/analyze-pose", json=data)
    return response.json() if response.status_code == 200 else None

# Example: Get AI feedback
def get_ai_feedback(frame, issue):
    data = {
        "frame": encode_frame_to_base64(frame),
        "issue": issue,
        "exercise_type": "pullup"
    }
    
    response = requests.post(f"{FLASK_API_URL}/get-gemini-feedback", json=data)
    return response.json() if response.status_code == 200 else None
```

### Method 3: Using cURL

You can test endpoints directly from the command line:

```bash
# Health check
curl -X GET http://localhost:5000/api/health

# Analyze pose (with mock data)
curl -X POST http://localhost:5000/api/analyze-pose \
  -H "Content-Type: application/json" \
  -d '{
    "landmarks": [{"x": 0.5, "y": 0.3, "z": 0.1, "visibility": 0.9}],
    "stage": "up",
    "armpit_angle": 45.0,
    "frame": ""
  }'

# Reset counter
curl -X POST http://localhost:5000/api/reset-counter
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request (missing or invalid data)
- **500**: Internal Server Error

Error responses include an error message:

```json
{
  "error": "No data provided"
}
```

## Frame Encoding

Images must be encoded as base64 strings. Use this helper function:

```python
def encode_frame_to_base64(frame):
    """Convert OpenCV frame to base64 string"""
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Make sure the Flask server is running
2. **Import errors**: Install all requirements with `pip install -r requirements.txt`
3. **CORS errors**: The server has CORS enabled, but check your client configuration
4. **Timeout errors**: Increase timeout values for large frame data

### Debug Mode

The Flask server runs in debug mode by default. Check the console output for detailed error messages.

### Testing

Use the provided test scripts to verify your setup:

```bash
python test_api.py      # Comprehensive API tests
python example_usage.py # Usage examples
```

## Next Steps

1. **Real Gemini Integration**: Replace the mock AI feedback with actual Gemini API calls
2. **Database Integration**: Add endpoints for storing session data
3. **Authentication**: Add user authentication and session management
4. **WebSocket Support**: Add real-time communication for live feedback
