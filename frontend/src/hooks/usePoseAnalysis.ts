import { useCallback, useRef, useState } from 'react';
import { flaskApi, FlaskApiAdapter } from '@/lib/adapters/flask-api';

export interface PoseAnalysisResult {
  haspose: boolean;
  reps: number;
  angle: number;
  stage: string;
  feedback: string;
  processedFrame?: string;
}

export interface PoseAnalysisOptions {
  exerciseType: string;
  intervalMs: number;
  enabled: boolean;
}

export const usePoseAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<PoseAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const analyzeFrame = useCallback(async (exerciseType: string): Promise<PoseAnalysisResult | null> => {
    if (!videoRef.current) {
      throw new Error('Video element not available');
    }

    try {
      const frame = FlaskApiAdapter.encodeFrameToBase64(videoRef.current);
      const apiResponse = await flaskApi.analyzeFrame({ 
        frame,
        exercise_type: exerciseType.toLowerCase()
      });

      const result: PoseAnalysisResult = {
        haspose: apiResponse.has_pose || false,
        reps: apiResponse.reps || 0,
        angle: apiResponse.armpit_angle || 0,
        stage: apiResponse.stage || 'unknown',
        feedback: apiResponse.feedback || 'No feedback',
        processedFrame: apiResponse.processed_frame
      };

      setLastResult(result);
      setError(null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Pose analysis error:', err);
      return null;
    }
  }, []);

  const startAnalysis = useCallback((options: PoseAnalysisOptions, video: HTMLVideoElement) => {
    if (!video) {
      console.error('Video element required for pose analysis');
      return;
    }

    videoRef.current = video;
    setIsAnalyzing(true);
    setError(null);

    const runAnalysis = async () => {
      if (options.enabled) {
        await analyzeFrame(options.exerciseType);
      }
    };

    // Initial analysis
    runAnalysis();

    // Set up interval
    intervalRef.current = setInterval(runAnalysis, options.intervalMs);
  }, [analyzeFrame]);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    videoRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    lastResult,
    error,
    startAnalysis,
    stopAnalysis,
    resetState
  };
};
