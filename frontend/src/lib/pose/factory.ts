import { PoseEngine } from './engine';
import { MediaPipeEngine } from './engines/mediapipe';
import { MockEngine } from './engines/mock';

export function createPoseEngine(kind = process.env.NEXT_PUBLIC_POSE_ENGINE || 'mediapipe'): PoseEngine {
  switch (kind) {
    case 'mediapipe':
      try {
        return new MediaPipeEngine();
      } catch (error) {
        console.warn('MediaPipe failed to load, falling back to mock engine');
        return new MockEngine();
      }
    case 'mock':
      return new MockEngine();
    default:
      return new MockEngine();
  }
}
