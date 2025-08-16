import { PoseEngine, PoseResult } from '@/types';

export class MockEngine implements PoseEngine {
  private video: HTMLVideoElement | null = null;
  private animationId: number | null = null;
  private mockDataIndex = 0;

  async init(video: HTMLVideoElement): Promise<void> {
    this.video = video;
    this.startMockAnimation();
  }

  async estimate(): Promise<PoseResult | null> {
    // Return mock pose data that cycles through different poses
    const mockPoses = [
      // Standing pose
      {
        keypoints: [
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
        ],
        fps: 30
      },
      // Squat pose
      {
        keypoints: [
          { name: 'nose', x: 0.5, y: 0.3, z: 0, score: 0.9 },
          { name: 'left_shoulder', x: 0.4, y: 0.4, z: 0, score: 0.8 },
          { name: 'right_shoulder', x: 0.6, y: 0.4, z: 0, score: 0.8 },
          { name: 'left_elbow', x: 0.3, y: 0.6, z: 0, score: 0.7 },
          { name: 'right_elbow', x: 0.7, y: 0.6, z: 0, score: 0.7 },
          { name: 'left_hip', x: 0.4, y: 0.7, z: 0, score: 0.8 },
          { name: 'right_hip', x: 0.6, y: 0.7, z: 0, score: 0.8 },
          { name: 'left_knee', x: 0.4, y: 0.9, z: 0, score: 0.7 },
          { name: 'right_knee', x: 0.6, y: 0.9, z: 0, score: 0.7 },
          { name: 'left_ankle', x: 0.4, y: 0.95, z: 0, score: 0.6 },
          { name: 'right_ankle', x: 0.6, y: 0.95, z: 0, score: 0.6 }
        ],
        fps: 30
      },
      // Shoulder abduction pose
      {
        keypoints: [
          { name: 'nose', x: 0.5, y: 0.2, z: 0, score: 0.9 },
          { name: 'left_shoulder', x: 0.4, y: 0.3, z: 0, score: 0.8 },
          { name: 'right_shoulder', x: 0.6, y: 0.3, z: 0, score: 0.8 },
          { name: 'left_elbow', x: 0.4, y: 0.2, z: 0, score: 0.7 },
          { name: 'right_elbow', x: 0.6, y: 0.2, z: 0, score: 0.7 },
          { name: 'left_hip', x: 0.4, y: 0.6, z: 0, score: 0.8 },
          { name: 'right_hip', x: 0.6, y: 0.6, z: 0, score: 0.8 },
          { name: 'left_knee', x: 0.4, y: 0.8, z: 0, score: 0.7 },
          { name: 'right_knee', x: 0.6, y: 0.8, z: 0, score: 0.7 },
          { name: 'left_ankle', x: 0.4, y: 0.95, z: 0, score: 0.6 },
          { name: 'right_ankle', x: 0.6, y: 0.95, z: 0, score: 0.6 }
        ],
        fps: 30
      }
    ];

    return mockPoses[this.mockDataIndex % mockPoses.length];
  }

  private startMockAnimation(): void {
    const animate = () => {
      this.mockDataIndex++;
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.video = null;
  }
}
