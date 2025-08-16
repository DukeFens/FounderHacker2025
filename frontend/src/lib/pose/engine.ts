import { PoseResult } from '@/types';

export interface PoseEngine {
  init(video: HTMLVideoElement): Promise<void>;
  estimate(): Promise<PoseResult | null>; // called in rAF loop
  dispose(): void;
}
