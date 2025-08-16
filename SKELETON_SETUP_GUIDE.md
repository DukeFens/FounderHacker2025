# MediaPipe Skeleton Visualization Setup Guide

## Overview
This guide explains how to show the MediaPipe skeleton overlay on your frontend interface instead of just in the OpenCV window.

## Current Setup Analysis

### Backend (Flask)
- ✅ `flask_server.py` has been updated to return pose landmarks in frontend-compatible format
- ✅ `analyze-frame` endpoint now returns raw pose landmarks for overlay drawing
- ✅ Pose detector returns landmarks without drawing them on the frame

### Frontend (React/Next.js)
- ✅ `CoachOverlay.tsx` component exists for drawing skeleton
- ✅ `live/page.tsx` processes API responses and updates pose state
- ✅ Flask API adapter handles communication

## Step-by-Step Setup

### 1. Start the Backend
```bash
cd backend
python flask_server.py
```

The server should start on `http://localhost:5000` and show available endpoints.

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:3000`.

### 3. Test the Setup
```bash
cd backend
python test_flask_pose.py
```

This will:
- Test Flask API health
- Open webcam with local pose detection
- Allow testing Flask API integration by pressing 's'

### 4. Access the Live Interface
1. Go to `http://localhost:3000`
2. Navigate to the "Live Coach" page
3. Click "Start Session" and select an exercise
4. Allow camera permissions when prompted
5. You should see:
   - ✅ Video feed from your camera
   - ✅ Green skeleton overlay on your pose
   - ✅ Feedback messages from pose analysis
   - ✅ Rep counting and scoring

## Key Components

### Backend Changes Made
1. **Flask Server (`flask_server.py`)**:
   - Modified `analyze-frame` endpoint to return pose landmarks
   - Added landmark name mapping for frontend compatibility
   - Returns clean frame without skeleton drawn on it

### Frontend Integration
1. **Live Page (`live/page.tsx`)**:
   - Sends video frames to Flask API every second
   - Receives pose landmarks and creates pose objects
   - Updates pose state for skeleton overlay

2. **Coach Overlay (`CoachOverlay.tsx`)**:
   - Draws skeleton connections between joints
   - Shows joint markers with glow effects
   - Displays feedback flags near detected poses

## Testing & Debugging

### Debug Controls Available
- **Toggle Skeleton**: Button to show/hide skeleton overlay
- **API Status**: Shows Flask API connection status
- **Pose Detection**: Shows if pose is currently detected

### Troubleshooting

#### No Skeleton Showing
1. Check Flask server is running: `curl http://localhost:5000/api/health`
2. Verify camera permissions are granted
3. Check browser console for API errors
4. Ensure you're visible in the camera frame

#### API Connection Issues
1. Verify Flask server is running on port 5000
2. Check for CORS issues in browser console
3. Test API manually: `python test_flask_pose.py`

#### Skeleton Not Accurate
1. Ensure good lighting conditions
2. Stand with full body visible in frame
3. Check MediaPipe pose detection confidence
4. Verify landmark mapping is correct

## What You Should See

1. **Camera Feed**: Live video from your webcam
2. **Green Skeleton**: Real-time pose overlay with joint connections
3. **Feedback**: Text feedback about your exercise form
4. **Rep Counter**: Counting pull-ups or other exercises
5. **Status Indicators**: API connection and pose detection status

## Code Flow

```
Camera Frame → Frontend → Flask API → MediaPipe → Pose Landmarks → Frontend → Skeleton Overlay
```

1. Frontend captures video frame from camera
2. Encodes frame as base64 and sends to Flask API
3. Flask processes frame with MediaPipe pose detection
4. Returns pose landmarks in frontend-compatible format
5. Frontend receives landmarks and draws skeleton overlay

## Next Steps

Once the skeleton is showing properly, you can:
- Adjust skeleton colors and styles in `CoachOverlay.tsx`
- Add more detailed joint analysis
- Implement exercise-specific feedback
- Add recording capabilities
- Enhance pose tracking accuracy
