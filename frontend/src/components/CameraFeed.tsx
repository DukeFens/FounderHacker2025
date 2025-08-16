'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { Camera, Video, VideoOff } from 'lucide-react';

interface CameraFeedProps {
  isActive: boolean;
  onCameraActive: (active: boolean) => void;
}

export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  ({ isActive, onCameraActive }, ref) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
      // Get available camera devices
      const getDevices = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setDevices(videoDevices);
          if (videoDevices.length > 0) {
            setSelectedDevice(videoDevices[0].deviceId);
          }
        } catch (err) {
          console.error('Failed to enumerate devices:', err);
        }
      };

      getDevices();
    }, []);

    useEffect(() => {
      if (isActive && selectedDevice) {
        startCamera();
      } else {
        stopCamera();
      }
    }, [isActive, selectedDevice]);

    const startCamera = async () => {
      try {
        setError('');
        
        // First, request permissions explicitly
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        if (permissions.state === 'denied') {
          setError('Camera access denied. Please allow camera permissions in your browser settings.');
          onCameraActive(false);
          return;
        }
        
        const constraints = {
          video: {
            deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        if (ref && 'current' in ref && ref.current) {
          ref.current.srcObject = mediaStream;
          ref.current.play();
        }
        
        onCameraActive(true);
      } catch (err: any) {
        console.error('Camera access failed:', err);
        
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else {
          setError('Failed to access camera. Please try again.');
        }
        
        onCameraActive(false);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      onCameraActive(false);
    };

    const handleDeviceChange = (deviceId: string) => {
      setSelectedDevice(deviceId);
    };

    return (
      <div className="relative">
        {/* Video Element */}
        <video
          ref={ref}
          className="w-full h-auto max-h-[70vh] object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Camera Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          {/* Device Selector */}
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-white" />
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="bg-black/50 text-white text-sm rounded-lg px-3 py-1 border border-white/20"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
          
          {/* Camera Status */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <div className="flex items-center gap-2 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm">
                <Video className="w-4 h-4" />
                Live
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-500/80 text-white px-3 py-1 rounded-full text-sm">
                <VideoOff className="w-4 h-4" />
                Offline
              </div>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <VideoOff className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-semibold mb-2">Camera Unavailable</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Camera Permission Prompt */}
        {!isActive && !error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <Camera className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
              <p className="text-gray-300 mb-4">
                Allow camera access to start live posture coaching
              </p>
              <button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Enable Camera
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CameraFeed.displayName = 'CameraFeed';
