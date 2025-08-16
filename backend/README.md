# Backend - Pullup Feedback AI

This directory contains the backend services for the Pullup Feedback AI system.

## 📁 Folder Structure

```
backend/
├── app.py                 # Main client application (uses webcam)
├── flask_server.py        # Flask API server
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── model/                # Core ML models and logic
│   ├── __init__.py
│   ├── feedback_rules.py
│   ├── pose_detector.py
│   └── rep_counter.py
├── utils/                # Utility functions
│   ├── draw_pose.py
│   └── video_io.py
├── tests/                # Test and debug files
│   ├── test_api.py       # API endpoint tests
│   ├── example_usage.py  # Usage examples
│   ├── run_tests.py      # Automated test runner
│   └── debug_script.py   # Debug utilities
└── docs/                 # Documentation
    └── API_README.md     # API documentation
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Flask Server
```bash
python flask_server.py
```

### 3. Run the Main Application
```bash
python app.py
```

## 🧪 Testing

### Run All Tests
```bash
cd tests
python run_tests.py
```

### Run Individual Tests
```bash
cd tests
python test_api.py
python example_usage.py
```

### Test Specific Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Reset counter
curl -X POST http://localhost:5000/api/reset-counter
```

## 📚 Documentation

- **API Documentation**: See `docs/API_README.md` for detailed API usage
- **Test Examples**: See `tests/example_usage.py` for usage examples

## 🔧 Development

### Adding New Endpoints
1. Add the route to `flask_server.py`
2. Add tests to `tests/test_api.py`
3. Update documentation in `docs/API_README.md`

### Running in Development Mode
The Flask server runs in debug mode by default, so it will automatically reload when you make changes.

## 📋 Available Endpoints

- `GET /api/health` - Health check
- `POST /api/analyze-pose` - Analyze pose data
- `POST /api/get-gemini-feedback` - Get AI feedback
- `POST /api/update-reps` - Update rep counter
- `POST /api/reset-counter` - Reset counter
- `POST /api/analyze-frame` - Analyze single frame

## 🐛 Troubleshooting

1. **Port already in use**: Change the port in `flask_server.py`
2. **Import errors**: Make sure you're in the correct directory
3. **Camera issues**: Check camera permissions and connections

## 📝 Notes

- The Flask server runs on `http://localhost:5000` by default
- All API endpoints are prefixed with `/api/`
- CORS is enabled for cross-origin requests
- The server includes error handling and logging
