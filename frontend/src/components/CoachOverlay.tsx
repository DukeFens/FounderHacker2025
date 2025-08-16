'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { PoseResult } from '@/types';

interface CoachOverlayProps {
  pose: PoseResult;
  flags: string[];
}

export const CoachOverlay = forwardRef<HTMLCanvasElement, CoachOverlayProps>(
  ({ pose, flags }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
      if (!pose || !pose.keypoints) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match video
      const video = canvas.parentElement?.querySelector('video');
      if (video) {
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw skeleton
      drawSkeleton(ctx, pose.keypoints, canvas.width, canvas.height);
      
      // Draw joint markers
      drawJoints(ctx, pose.keypoints, canvas.width, canvas.height);
      
      // Draw flags if any (disabled to clear warnings)
      // if (flags.length > 0) {
      //   drawFlags(ctx, flags, canvas.width, canvas.height);
      // }

      // Continue animation
      animationRef.current = requestAnimationFrame(() => {
        // This will trigger the effect again
      });

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [pose, flags]);

    const drawSkeleton = (
      ctx: CanvasRenderingContext2D,
      keypoints: any[],
      width: number,
      height: number
    ) => {
      ctx.strokeStyle = '#00ff00';  // Bright green
      ctx.lineWidth = 4;  // Thicker lines
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#00ff00';  // Glow effect
      ctx.shadowBlur = 6;

      // Define skeleton connections
      const connections = [
        // Head to shoulders
        ['nose', 'left_shoulder'],
        ['nose', 'right_shoulder'],
        // Shoulders to elbows
        ['left_shoulder', 'left_elbow'],
        ['right_shoulder', 'right_elbow'],
        // Elbows to wrists
        ['left_elbow', 'left_wrist'],
        ['right_elbow', 'right_wrist'],
        // Shoulders to hips
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        // Hips to knees
        ['left_hip', 'left_knee'],
        ['right_hip', 'right_knee'],
        // Knees to ankles
        ['left_knee', 'left_ankle'],
        ['right_knee', 'right_ankle'],
        // Shoulder to shoulder
        ['left_shoulder', 'right_shoulder'],
        // Hip to hip
        ['left_hip', 'right_hip']
      ];

      connections.forEach(([start, end]) => {
        const startPoint = keypoints.find(kp => kp.name === start);
        const endPoint = keypoints.find(kp => kp.name === end);

        if (startPoint && endPoint && startPoint.score && endPoint.score) {
          if (startPoint.score > 0.5 && endPoint.score > 0.5) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x * width, startPoint.y * height);
            ctx.lineTo(endPoint.x * width, endPoint.y * height);
            ctx.stroke();
          }
        }
      });
    };

    const drawJoints = (
      ctx: CanvasRenderingContext2D,
      keypoints: any[],
      width: number,
      height: number
    ) => {
      keypoints.forEach(keypoint => {
        if (keypoint.score && keypoint.score > 0.5) {
          const x = keypoint.x * width;
          const y = keypoint.y * height;
          
          // Draw joint circle - bigger and brighter
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);  // Bigger radius
          ctx.fillStyle = '#00ff00';
          ctx.fill();
          
          // Draw glow effect - more prominent
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);  // Bigger glow
          ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';  // More opaque
          ctx.fill();
        }
      });
    };

    const drawFlags = (
      ctx: CanvasRenderingContext2D,
      flags: string[],
      width: number,
      height: number
    ) => {
      if (flags.length === 0) return;

      // Find a good position for the flag (near the head/shoulders)
      const headPoint = pose.keypoints.find(kp => kp.name === 'nose');
      if (!headPoint) return;

      const x = headPoint.x * width;
      const y = (headPoint.y * height) - 50; // Above the head

      // Draw flag background
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.fillRect(x - 60, y - 20, 120, 40);

      // Draw flag text
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(flags[0], x, y);

      // Draw arrow pointing down
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x - 10, y + 30);
      ctx.lineTo(x + 10, y + 30);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.fill();
    };

    return (
      <canvas
        ref={ref || canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />
    );
  }
);

CoachOverlay.displayName = 'CoachOverlay';
