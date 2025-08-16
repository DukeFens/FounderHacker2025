# Flask Backend Integration

This document explains how to connect your Next.js frontend to the Flask backend API.

## 🚀 Quick Start

### 1. Start the Flask Backend

```bash
cd backend
python flask_server.py
```

The Flask server will run on `http://localhost:5000`

### 2. Start the Next.js Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Test the Integration

Visit `http://localhost:3000/api-demo` to test the Flask API integration.

## 📋 API Endpoints

Your Flask backend provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check server status |
| `/api/analyze-pose` | POST | Analyze pose data |
| `/api/get-gemini-feedback` | POST | Get AI feedback |
| `/api/update-reps` | POST | Update rep counter |
| `/api/reset-counter` | POST | Reset counter |
| `/api/analyze-frame` | POST | Analyze single frame |

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_MODE=flask
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000/api
```

### API Mode Switching

The frontend can switch between:
- **Mock Mode**: Uses local mock data (default)
- **Flask Mode**: Connects to your Flask backend

Use the API Status component in the top-right corner to switch modes.

## 🧩 Components

### ApiStatus Component

Shows connection status and allows switching between API modes.

```tsx
import { ApiStatus } from '@/components/ApiStatus';

// Automatically included in layout.tsx
```

### FlaskApiDemo Component

Demonstrates how to use the Flask API.

```tsx
import { FlaskApiDemo } from '@/components/FlaskApiDemo';

export default function DemoPage() {
  return <FlaskApiDemo />;
}
```

## 🔌 Using the Flask API

### Basic Usage

```tsx
import { useApi } from '@/lib/hooks/useApi';
import { FlaskApiAdapter } from '@/lib/adapters/flask-api';

function MyComponent() {
  const { apiMode, status, flaskApi } = useApi();

  const analyzePose = async () => {
    if (!flaskApi) return;

    try {
      const response = await flaskApi.analyzePose({
        landmarks: [...],
        stage: 'up',
        armpit_angle: 45.0,
        frame: 'base64_encoded_image',
      });
      
      console.log('Analysis result:', response);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div>
      {apiMode === 'flask' && status.isConnected ? (
        <button onClick={analyzePose}>Analyze Pose</button>
      ) : (
        <p>Flask API not connected</p>
      )}
    </div>
  );
}
```

### Frame Encoding

Convert video/canvas frames to base64:

```tsx
import { FlaskApiAdapter } from '@/lib/adapters/flask-api';

// From canvas
const canvas = document.querySelector('canvas');
const frameBase64 = FlaskApiAdapter.encodeFrameToBase64(canvas);

// From video
const video = document.querySelector('video');
const frameBase64 = FlaskApiAdapter.encodeFrameToBase64(video);
```

## 🎯 Integration with Existing Components

### CameraFeed Component

Update your camera feed to use Flask API:

```tsx
import { useApi } from '@/lib/hooks/useApi';

export function CameraFeed() {
  const { flaskApi } = useApi();
  
  const processFrame = async (frame: ImageData) => {
    if (!flaskApi) return;
    
    const frameBase64 = FlaskApiAdapter.encodeFrameToBase64(frame);
    
    const response = await flaskApi.analyzeFrame({
      frame: frameBase64,
    });
    
    // Update UI with response
    setFeedback(response.feedback);
    setReps(response.reps);
  };
  
  // ... rest of component
}
```

### Pose Engine Integration

Replace local pose detection with Flask API:

```tsx
// Instead of local pose detection
const localPose = await poseEngine.detectPose(frame);

// Use Flask API
const flaskPose = await flaskApi.analyzePose({
  landmarks: localPose.landmarks,
  stage: currentStage,
  armpit_angle: calculatedAngle,
  frame: frameBase64,
});
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Flask server has CORS enabled
   - Check browser console for CORS errors
   - Ensure Flask server is running on correct port

2. **Connection Refused**
   - Make sure Flask server is running: `python flask_server.py`
   - Check port 5000 is not in use
   - Verify URL in environment variables

3. **API Mode Not Switching**
   - Check environment variables
   - Refresh page after changing mode
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```bash
# In .env.local
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Testing Individual Endpoints

Use the demo page or test directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Reset counter
curl -X POST http://localhost:5000/api/reset-counter
```

## 📚 Next Steps

1. **Real Camera Integration**: Connect camera feed to Flask API
2. **Real-time Updates**: Use WebSocket for live feedback
3. **Error Handling**: Add retry logic and fallbacks
4. **Performance**: Optimize frame encoding and API calls
5. **Authentication**: Add user authentication to Flask API

## 🔗 Related Files

- `src/lib/adapters/flask-api.ts` - Flask API adapter
- `src/lib/hooks/useApi.ts` - API connection hook
- `src/components/ApiStatus.tsx` - Connection status component
- `src/components/FlaskApiDemo.tsx` - Demo component
- `src/app/api-demo/page.tsx` - Demo page
