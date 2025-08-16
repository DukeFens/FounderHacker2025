'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CameraFeed } from '@/components/CameraFeed';
import { CoachOverlay } from '@/components/CoachOverlay';
import { AngleStack } from '@/components/AngleStack';
import { ControlBar } from '@/components/ControlBar';
import { SummaryChips } from '@/components/SummaryChips';
import { useLiveStore } from '@/lib/store/useLiveStore';
import { createPoseEngine } from '@/lib/pose/factory';
import { calculateAngles } from '@/lib/pose/angles';
import { analyzePose } from '@/lib/pose/rules';
import { toast } from 'react-hot-toast';

export default function LiveCoachPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [poseEngine, setPoseEngine] = useState<any>(null);
  
  const {
    isActive,
    exercise,
    currentPose,
    currentAngles,
    currentFlags,
    currentScore,
    currentRep,
    repMetrics,
    startSession,
    stopSession,
    updatePose,
    updateAngles,
    updateFlags,
    updateScore
  } = useLiveStore();

  useEffect(() => {
    if (isActive && videoRef.current) {
      const engine = createPoseEngine();
      engine.init(videoRef.current);
      setPoseEngine(engine);
      
      // Start pose estimation loop
      const estimatePose = async () => {
        if (engine && isActive) {
          try {
            const pose = await engine.estimate();
            if (pose) {
              updatePose(pose);
              
              // Calculate angles
              const angles = calculateAngles(pose.keypoints);
              updateAngles(angles);
              
              // Analyze pose and apply rules
              const analysis = analyzePose(pose.keypoints, angles, exercise, Date.now());
              updateFlags(analysis.flags);
              updateScore(Math.max(0, 100 - analysis.deductions));
              
              // Show toast for new flags
              if (analysis.flags.length > 0) {
                analysis.flags.forEach(flag => {
                  toast(flag, { icon: '⚠️' });
                });
                
                // Voice cue
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(analysis.flags[0]);
                  utterance.rate = 0.8;
                  speechSynthesis.speak(utterance);
                }
              }
            }
          } catch (error) {
            console.error('Pose estimation error:', error);
          }
          
          requestAnimationFrame(estimatePose);
        }
      };
      
      estimatePose();
    }
    
    return () => {
      if (poseEngine) {
        poseEngine.dispose();
      }
    };
  }, [isActive, exercise, updatePose, updateAngles, updateFlags, updateScore, poseEngine]);

  const handleStartSession = (selectedExercise: 'Squat' | 'ShoulderAbduction') => {
    startSession(selectedExercise);
  };

  const handleStopSession = () => {
    stopSession();
    if (poseEngine) {
      poseEngine.dispose();
      setPoseEngine(null);
    }
  };

  return (
    <div className="min-h-screen bg-cool">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Live Coach</h1>
          </div>
          <div className="text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_LOCAL_ONLY === 'true' ? '🔒 Local Only' : '🌐 Cloud Connected'}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Control Bar */}
        <ControlBar
          exercise={exercise}
          isActive={isActive}
          onStartSession={handleStartSession}
          onStopSession={handleStopSession}
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Main Camera Feed */}
          <div className="lg:col-span-2">
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
              <CameraFeed
                ref={videoRef}
                isActive={isCameraActive}
                onCameraActive={setIsCameraActive}
              />
              
              {/* Pose Overlay */}
              {isActive && currentPose && (
                <CoachOverlay
                  ref={canvasRef}
                  pose={currentPose}
                  flags={currentFlags}
                />
              )}
              

            </div>
          </div>

          {/* Right Column - Angle Stack */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <AngleStack
                angles={currentAngles}
                exercise={exercise}
                isActive={isActive}
              />
              
              {/* Summary Chips */}
              <div className="mt-6">
                <SummaryChips
                  reps={currentRep}
                  avgScore={currentScore}
                  flags={currentFlags}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Session Status */}
        {isActive && (
          <div className="mt-8 p-6 bg-white rounded-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Active Session: {exercise}
                </h3>
                <p className="text-gray-600">
                  Reps: {currentRep} | Score: {currentScore}/100
                </p>
              </div>
              <button
                onClick={handleStopSession}
                className="btn-secondary"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
