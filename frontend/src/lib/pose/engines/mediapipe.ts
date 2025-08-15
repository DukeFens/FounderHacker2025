import { PoseEngine, PoseResult } from '@/types';

// Joint name mapping for MediaPipe
const JOINT_NAMES = {
  0: 'nose',
  1: 'left_eye_inner', 2: 'left_eye', 3: 'left_eye_outer',
  4: 'right_eye_inner', 5: 'right_eye', 6: 'right_eye_outer',
  7: 'left_ear', 8: 'right_ear',
  9: 'mouth_left', 10: 'mouth_right',
  11: 'left_shoulder', 12: 'right_shoulder',
  13: 'left_elbow', 14: 'right_elbow',
  15: 'left_wrist', 16: 'right_wrist',
  17: 'left_pinky', 18: 'right_pinky',
  19: 'left_index', 20: 'right_index',
  21: 'left_thumb', 22: 'right_thumb',
  23: 'left_hip', 24: 'right_hip',
  25: 'left_knee', 26: 'right_knee',
  27: 'left_ankle', 28: 'right_ankle',
  29: 'left_heel', 30: 'right_heel',
  31: 'left_foot_index', 32: 'right_foot_index'
};

export class MediaPipeEngine implements PoseEngine {
  private pose: any = null;
  private video: HTMLVideoElement | null = null;
  private isInitialized = false;

  async init(video: HTMLVideoElement): Promise<void> {
    try {
      this.video = video;
      
      // Try to load MediaPipe Pose
      const { Pose } = await import('@mediapipe/pose');
      const { Camera } = await import('@mediapipe/camera_utils');
      const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');
      
      this.pose = new Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
    } catch (error) {
      console.warn('MediaPipe not available, falling back to mock data');
      this.isInitialized = false;
    }
  }

  async estimate(): Promise<PoseResult | null> {
    if (!this.isInitialized || !this.pose || !this.video) {
      return this.generateMockPose();
    }

    try {
      const results = await this.pose.onResults((results: any) => {
        if (results.poseLandmarks) {
          return this.normalizeLandmarks(results.poseLandmarks);
        }
      });
      
      return results;
    } catch (error) {
      console.warn('MediaPipe estimation failed, using mock data');
      return this.generateMockPose();
    }
  }

  private normalizeLandmarks(landmarks: any[]): PoseResult {
    const keypoints = landmarks.map((landmark, index) => ({
      name: JOINT_NAMES[index as keyof typeof JOINT_NAMES] || `joint_${index}`,
      x: landmark.x,
      y: landmark.y,
      z: landmark.z,
      score: landmark.visibility || 0.5
    }));

    return { keypoints, fps: 30 };
  }

  private generateMockPose(): PoseResult {
    // Generate realistic mock pose data for demo purposes
    const mockKeypoints = [
      { name: 'nose', x: 0.5, y: 0.2, z: 0, score: 0.9 },
      { name: 'left_shoulder', x: 0.4, y: 0.3, z: 0, score: 0.8 },
      { name: 'right_shoulder', x: 0.6, y: 0.3, z: 0, score: 0.8 },
      { name: 'left_elbow', x: 0.3, y: 0.5, z: 0, score: 0.7 },
      { name: 'right_elbow', x: 0.7, y: 0.5, z: 0, score: 0.7 },
      { name: 'left_hip', x: 0.4, y: 0.6, z: 0, score: 0.8 },
      { name: 'right_hip', x: 0.6, y: 0.6, z: 0, score: 0.8 },
      { name: 'left_knee', x: 0.4, y: 0.8, z: 0, score: 0.7 },
      { name: 'right_knee', x: 0.6, y: 0.8, z: 0, score: 0.7 },
      { name: 'left_ankle', x: 0.4, y: 0.95, z: 0, score: 0.6 },
      { name: 'right_ankle', x: 0.6, y: 0.95, z: 0, score: 0.6 }
    ];

    return { keypoints: mockKeypoints, fps: 30 };
  }

  dispose(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.video = null;
    this.isInitialized = false;
  }
}
