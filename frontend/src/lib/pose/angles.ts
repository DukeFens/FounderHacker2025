import { Keypoint } from '@/types';

export interface Angles {
  hip?: number;
  knee?: number;
  shoulder?: number;
  torso?: number;
}

export function calculateAngles(keypoints: Keypoint[]): Angles {
  const angles: Angles = {};
  
  // Helper function to find keypoint by name
  const findKeypoint = (name: string): Keypoint | null => {
    return keypoints.find(kp => kp.name === name) || null;
  };

  // Calculate hip angle (hip-knee-ankle)
  const leftHip = findKeypoint('left_hip');
  const leftKnee = findKeypoint('left_knee');
  const leftAnkle = findKeypoint('left_ankle');
  
  if (leftHip && leftKnee && leftAnkle) {
    angles.hip = calculateAngle(leftHip, leftKnee, leftAnkle);
  }

  // Calculate knee angle (hip-knee-ankle)
  if (leftHip && leftKnee && leftAnkle) {
    angles.knee = calculateAngle(leftHip, leftKnee, leftAnkle);
  }

  // Calculate shoulder angle (shoulder-elbow-wrist)
  const leftShoulder = findKeypoint('left_shoulder');
  const leftElbow = findKeypoint('left_elbow');
  const leftWrist = findKeypoint('left_wrist');
  
  if (leftShoulder && leftElbow && leftWrist) {
    angles.shoulder = calculateAngle(leftShoulder, leftElbow, leftWrist);
  }

  // Calculate torso angle (shoulder-hip-vertical)
  const rightShoulder = findKeypoint('right_shoulder');
  const rightHip = findKeypoint('right_hip');
  
  if (rightShoulder && rightHip) {
    angles.torso = calculateTorsoAngle(rightShoulder, rightHip);
  }

  return angles;
}

function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const cb = { x: b.x - c.x, y: b.y - c.y };
  
  const dot = ab.x * cb.x + ab.y * cb.y;
  const cross = ab.x * cb.y - ab.y * cb.x;
  
  const angle = Math.atan2(cross, dot);
  return Math.abs(angle * 180 / Math.PI);
}

function calculateTorsoAngle(shoulder: Keypoint, hip: Keypoint): number {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  
  // Calculate angle from vertical
  const angle = Math.atan2(dx, dy) * 180 / Math.PI;
  return Math.abs(angle);
}
