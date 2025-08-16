import { SessionSummary, SessionDetail, Comment, Appointment, PresignedUpload, ID } from '@/types';

// Flask API configuration
const FLASK_API_BASE_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000/api';

export interface FlaskApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface PoseAnalysisResponse {
  feedback: string;
  reps: number;
  armpit_angle: number;
  stage: string;
  processed_frame?: string;
  pose_landmarks?: Array<{
    name: string;
    x: number;
    y: number;
    z: number;
    score: number;
  }>;
  clean_frame?: string;
  has_pose?: boolean;
}

export interface GeminiFeedbackResponse {
  advice: string;
  confidence: number;
  exercise_type: string;
}

export interface RepUpdateResponse {
  success: boolean;
  reps: number;
  stage: string;
  exercise_type: string;
}

export interface ResetCounterResponse {
  success: boolean;
  message: string;
}

class FlaskApiAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = FLASK_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.makeRequest('health');
  }

  // Pose analysis
  async analyzePose(data: {
    landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
    stage: string;
    armpit_angle: number;
    frame: string; // base64 encoded image
  }): Promise<PoseAnalysisResponse> {
    return this.makeRequest('analyze-pose', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get Gemini AI feedback
  async getGeminiFeedback(data: {
    frame: string; // base64 encoded image
    landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
    issue: string;
    exercise_type: string;
  }): Promise<GeminiFeedbackResponse> {
    return this.makeRequest('get-gemini-feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update rep count
  async updateReps(data: {
    reps: number;
    stage: string;
    exercise_type: string;
  }): Promise<RepUpdateResponse> {
    return this.makeRequest('update-reps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reset counter
  async resetCounter(): Promise<ResetCounterResponse> {
    return this.makeRequest('reset-counter', {
      method: 'POST',
    });
  }

  // Analyze single frame
  async analyzeFrame(data: {
    frame: string; // base64 encoded image
    exercise_type?: string; // Add exercise type parameter
  }): Promise<PoseAnalysisResponse> {
    return this.makeRequest('analyze-frame', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utility function to encode frame to base64
  static encodeFrameToBase64(frame: ImageData | HTMLCanvasElement | HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    if (frame instanceof ImageData) {
      canvas.width = frame.width;
      canvas.height = frame.height;
      ctx.putImageData(frame, 0, 0);
    } else if (frame instanceof HTMLCanvasElement) {
      canvas.width = frame.width;
      canvas.height = frame.height;
      ctx.drawImage(frame, 0, 0);
    } else if (frame instanceof HTMLVideoElement) {
      canvas.width = frame.videoWidth;
      canvas.height = frame.videoHeight;
      ctx.drawImage(frame, 0, 0);
    } else {
      throw new Error('Unsupported frame type');
    }

    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]; // Remove data URL prefix
  }
}

// Create and export the Flask API adapter
export const flaskApi = new FlaskApiAdapter();

// Export the class for custom instances
export { FlaskApiAdapter };
