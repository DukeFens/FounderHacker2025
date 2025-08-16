'use client';

import React from 'react';
import { Exercise } from '@/types';
import { Angles } from '@/lib/pose/angles';

interface AngleStackProps {
  angles: Angles;
  exercise: Exercise;
  isActive: boolean;
}

export const AngleStack: React.FC<AngleStackProps> = ({ angles, exercise, isActive }) => {
  const getAngleDisplay = (angle: number | undefined, label: string) => {
    if (angle === undefined) return null;
    
    const isHighlighted = isActive && angle > 0;
    const isGood = exercise === 'Squat' 
      ? (label === 'Knee' && angle < 120) || (label === 'Hip' && angle < 90)
      : (label === 'Shoulder' && Math.abs(angle - 90) < 10);
    
    return (
      <div 
        key={label}
        className={`p-4 rounded-2xl transition-all duration-200 ${
          isHighlighted 
            ? 'bg-white shadow-lg scale-105' 
            : 'bg-gray-100'
        }`}
      >
        <div className="text-center">
          <div className={`text-3xl font-bold mb-1 ${
            isGood ? 'text-green-600' : 'text-blue-600'
          }`}>
            {Math.round(angle)}°
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {label}
          </div>
        </div>
        
        {/* Progress indicator */}
        {isHighlighted && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isGood ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (angle / 180) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const getExerciseSpecificAngles = () => {
    if (exercise === 'Squat') {
      return [
        { angle: angles.knee, label: 'Knee' },
        { angle: angles.hip, label: 'Hip' },
        { angle: angles.torso, label: 'Torso' }
      ];
    } else if (exercise === 'ShoulderAbduction') {
      return [
        { angle: angles.shoulder, label: 'Shoulder' },
        { angle: angles.torso, label: 'Torso' }
      ];
    } else if (exercise === 'Pullup') {
      return [
        { angle: angles.armpit, label: 'Armpit' },
        { angle: angles.torso, label: 'Torso' }
      ];
    }
    return [];
  };

  const exerciseAngles = getExerciseSpecificAngles();

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        Joint Angles
      </h3>
      
      <div className="space-y-4">
        {exerciseAngles.map(({ angle, label }) => 
          getAngleDisplay(angle, label)
        )}
        
        {/* No angles available */}
        {exerciseAngles.every(({ angle }) => angle === undefined) && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📐</div>
            <p className="text-sm">
              {isActive ? 'Calculating angles...' : 'Start session to see angles'}
            </p>
          </div>
        )}
      </div>
      
      {/* Exercise info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
        <h4 className="font-semibold text-gray-900 mb-2">{exercise} Guide</h4>
        {exercise === 'Squat' ? (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Target depth: Knee angle &lt; 120°</p>
            <p>• Keep chest up: Torso &lt; 15°</p>
            <p>• Push knees out</p>
          </div>
        ) : exercise === 'Pullup' ? (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Pull up: Armpit angle &lt; 90°</p>
            <p>• Lower down: Armpit angle &gt; 160°</p>
            <p>• Keep body stable</p>
          </div>
        ) : (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Target ROM: 90° ± 10°</p>
            <p>• Lead with elbow</p>
            <p>• Maintain symmetry</p>
          </div>
        )}
      </div>
    </div>
  );
};
