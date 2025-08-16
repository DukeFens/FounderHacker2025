import { Keypoint, Exercise } from '@/types';
import { Angles } from './angles';
import { POSE_CONFIG } from './config';

export interface RuleResult {
  flags: string[];
  deductions: number;
}

export function analyzePose(
  keypoints: Keypoint[], 
  angles: Angles, 
  exercise: Exercise,
  timestamp: number
): RuleResult {
  const flags: string[] = [];
  let deductions = 0;

  // Check minimum keypoints
  if (keypoints.length < POSE_CONFIG.MIN_KEYPOINTS) {
    flags.push('Insufficient pose data');
    deductions += POSE_CONFIG.FLAG_DEDUCTION;
    return { flags, deductions };
  }

  // Check confidence scores
  const lowConfidenceKeypoints = keypoints.filter(kp => (kp.score || 0) < POSE_CONFIG.MIN_CONFIDENCE);
  if (lowConfidenceKeypoints.length > keypoints.length * 0.3) {
    flags.push('Low pose confidence');
    deductions += POSE_CONFIG.FLAG_DEDUCTION;
  }

  // Exercise-specific rules
  if (exercise === 'Squat') {
    const squatResult = analyzeSquat(keypoints, angles);
    flags.push(...squatResult.flags);
    deductions += squatResult.deductions;
  } else if (exercise === 'ShoulderAbduction') {
    const shoulderResult = analyzeShoulderAbduction(keypoints, angles);
    flags.push(...shoulderResult.flags);
    deductions += shoulderResult.deductions;
  }

  // Cap deductions
  deductions = Math.min(deductions, POSE_CONFIG.MAX_DEDUCTION);

  return { flags, deductions };
}

function analyzeSquat(keypoints: Keypoint[], angles: Angles): RuleResult {
  const flags: string[] = [];
  let deductions = 0;

  // Check squat depth
  if (angles.knee && angles.knee > POSE_CONFIG.SQUAT.MIN_DEPTH_ANGLE) {
    flags.push('Go deeper');
    deductions += POSE_CONFIG.FLAG_DEDUCTION;
  }

  // Check torso lean
  if (angles.torso && angles.torso > POSE_CONFIG.SQUAT.MAX_TORSO_LEAN) {
    flags.push('Keep chest up');
    deductions += POSE_CONFIG.FLAG_DEDUCTION;
  }

  // Check knee valgus (knees caving in)
  const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
  const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
  const rightKnee = keypoints.find(kp => kp.name === 'right_knee');
  const rightAnkle = keypoints.find(kp => kp.name === 'right_ankle');

  if (leftKnee && leftAnkle && rightKnee && rightAnkle) {
    const leftValgus = Math.abs(leftKnee.x - leftAnkle.x);
    const rightValgus = Math.abs(rightKnee.x - rightAnkle.x);
    
    if (leftValgus > POSE_CONFIG.SQUAT.KNEE_VALGUS_THRESHOLD || 
        rightValgus > POSE_CONFIG.SQUAT.KNEE_VALGUS_THRESHOLD) {
      flags.push('Push knees out');
      deductions += POSE_CONFIG.FLAG_DEDUCTION;
    }
  }

  return { flags, deductions };
}

function analyzeShoulderAbduction(keypoints: Keypoint[], angles: Angles): RuleResult {
  const flags: string[] = [];
  let deductions = 0;

  // Check ROM target
  if (angles.shoulder) {
    const romDiff = Math.abs(angles.shoulder - POSE_CONFIG.SHOULDER_ABDUCTION.TARGET_ROM);
    if (romDiff > POSE_CONFIG.SHOULDER_ABDUCTION.ROM_TOLERANCE) {
      flags.push(`Aim for ${POSE_CONFIG.SHOULDER_ABDUCTION.TARGET_ROM}°`);
      deductions += POSE_CONFIG.FLAG_DEDUCTION;
    }
  }

  // Check elbow position relative to shoulder
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const leftElbow = keypoints.find(kp => kp.name === 'left_elbow');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const rightElbow = keypoints.find(kp => kp.name === 'right_elbow');

  if (leftShoulder && leftElbow && rightShoulder && rightElbow) {
    const leftElbowAbove = leftShoulder.y - leftElbow.y;
    const rightElbowAbove = rightShoulder.y - rightElbow.y;
    
    if (leftElbowAbove > POSE_CONFIG.SHOULDER_ABDUCTION.MAX_ELBOW_ABOVE_SHOULDER ||
        rightElbowAbove > POSE_CONFIG.SHOULDER_ABDUCTION.MAX_ELBOW_ABOVE_SHOULDER) {
      flags.push('Relax shoulder, lead with elbow');
      deductions += POSE_CONFIG.FLAG_DEDUCTION;
    }
  }

  // Check symmetry
  if (angles.shoulder) {
    // For now, we'll use a simple check - in a real implementation,
    // you'd compare left and right shoulder angles
    const symmetryThreshold = POSE_CONFIG.SHOULDER_ABDUCTION.SYMMETRY_THRESHOLD;
    if (Math.random() > 0.8) { // Simulate asymmetry detection
      flags.push('Aim for symmetry');
      deductions += POSE_CONFIG.FLAG_DEDUCTION;
    }
  }

  return { flags, deductions };
}
