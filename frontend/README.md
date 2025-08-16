# PhysioPosture - AI-Powered Posture Feedback App

A comprehensive, mobile-optimized web application for physiotherapy and allied health professionals, providing real-time posture analysis and feedback using AI pose detection.

## 🚀 Features

### Live Coaching (`/live`)
- **Real-time Pose Detection**: MediaPipe integration with fallback to mock engine
- **Exercise Selection**: Squat and Shoulder Abduction with specific form rules
- **Live Feedback**: Toast notifications and voice cues for form violations
- **Rep Counting**: Automatic repetition detection with timing analysis
- **Angle Stack**: Real-time joint angle display with visual feedback
- **Privacy-First**: Local-only processing with no data uploads

### Clinician Review (`/review`)
- **Session Playback**: Video player with timeline navigation
- **Rep Analysis**: Detailed metrics for each repetition
- **Comment System**: Time-stamped notes and feedback
- **Performance Metrics**: Adherence percentage, ROM trends, and insights
- **Mock Data**: Seeded sample sessions for immediate testing

### Landing Page (`/`)
- **Feature Showcase**: Three main capabilities with visual examples
- **Responsive Design**: Mobile-first approach with beautiful animations
- **Clear CTAs**: Direct navigation to live coaching and review

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **State Management**: Zustand for lightweight, performant state
- **Pose Detection**: MediaPipe with fallback to mock engine
- **UI Components**: Lucide React icons, custom component library
- **PWA**: Installable web app with offline capabilities
- **Real-time**: WebRTC camera access with pose estimation loop

## 📱 Design System

- **Color Palette**: Warm amber backgrounds, cool sky accents
- **Typography**: System fonts with clear hierarchy (3xl/4xl headlines)
- **Components**: Rounded-3xl cards with soft shadows and generous spacing
- **Animations**: Smooth 200ms transitions with hover effects
- **Mobile-First**: Responsive design optimized for mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd physio-posture-app

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your preferred settings

# Run development server
npm run dev
```

### Environment Configuration
```bash
# API Configuration
NEXT_PUBLIC_API_MODE=mock|real
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_LOCAL_ONLY=true|false
NEXT_PUBLIC_UPLOADS=presigned|direct

# Pose Engine Configuration
NEXT_PUBLIC_USE_POSE=real|mock
NEXT_PUBLIC_POSE_ENGINE=mediapipe|movenet|remote

# Feature Flags
NEXT_PUBLIC_ENABLE_RECORDING=true|false
NEXT_PUBLIC_ENABLE_VOICE_CUES=true|false
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true|false
```

## 🏗️ Architecture

### Core Components
- **Pose Engine**: Swappable pose detection (MediaPipe/MoveNet/Mock)
- **Rules Engine**: Exercise-specific form validation and scoring
- **Rep Detection**: Finite state machine for repetition counting
- **State Management**: Zustand stores for live sessions and review data

### File Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (patient)/         # Patient-facing routes
│   ├── (clinician)/       # Clinician routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/             # Reusable UI components
├── lib/                    # Core business logic
│   ├── pose/              # Pose detection engine
│   ├── store/             # Zustand stores
│   ├── adapters/          # API adapters
│   └── utils/             # Utility functions
└── types/                  # TypeScript type definitions
```

## 🎯 Exercise Rules

### Squat Analysis
- **Depth**: Knee angle < 120° for proper depth
- **Chest Position**: Torso lean < 15° from vertical
- **Knee Alignment**: Prevent valgus (knees caving in)
- **Tempo**: Minimum 1s eccentric phase

### Shoulder Abduction
- **ROM Target**: 90° ± 10° range of motion
- **Form**: Elbow leads, shoulder relaxed
- **Symmetry**: Left/right difference < 15°
- **Control**: Smooth movement throughout range

## 🔧 Development

### Adding New Exercises
1. Extend the `Exercise` type in `src/types/index.ts`
2. Add exercise-specific rules in `src/lib/pose/rules.ts`
3. Update rep detection logic in `src/lib/pose/repDetector.ts`
4. Add exercise guide in `src/components/AngleStack.tsx`

### Customizing Pose Engine
1. Implement `PoseEngine` interface in `src/lib/pose/engines/`
2. Add engine to factory in `src/lib/pose/factory.ts`
3. Set `NEXT_PUBLIC_POSE_ENGINE` environment variable

### API Integration
1. Set `NEXT_PUBLIC_API_MODE=real`
2. Implement backend endpoints matching the API interface
3. Update `NEXT_PUBLIC_API_BASE_URL` to your backend URL

## 📊 Performance

- **Pose Estimation**: 30 FPS target with MediaPipe
- **Mobile Optimization**: Responsive design with touch-friendly controls
- **Offline Support**: PWA capabilities with service worker
- **Bundle Size**: Optimized with Next.js tree shaking

## 🔒 Privacy & Security

- **Local Processing**: All pose analysis runs client-side
- **No Data Upload**: Privacy-first approach by default
- **Camera Access**: Secure WebRTC implementation
- **Configurable**: Easy to enable cloud features when needed

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t physio-posture .
docker run -p 3000:3000 physio-posture
```

### Static Export
```bash
npm run build
npm run export
# Deploy `out/` directory to any static hosting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe**: Google's pose detection technology
- **Next.js**: Vercel's React framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide**: Beautiful icon library
- **Zustand**: Lightweight state management

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the physiotherapy community**
