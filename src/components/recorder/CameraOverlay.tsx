import React, { useEffect, useRef } from 'react';
import { useRecordingStore } from '../../store/recording.store';
import { recordingService } from '../../services/recording.service';
import clsx from 'clsx';

export const CameraOverlay: React.FC = () => {
  const {
    status,
    options,
    cameraPosition,
    setCameraPosition,
    cameraSize,
    cameraShape
  } = useRecordingStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (options.includeCamera && (status === 'recording' || status === 'paused')) {
      const stream = recordingService.getCameraStream();
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [options.includeCamera, status]);

  if (!options.includeCamera || (status !== 'recording' && status !== 'paused')) {
    return null;
  }

  const sizes = {
    sm: 'w-28 h-28',
    md: 'w-40 h-40',
    lg: 'w-56 h-56'
  };

  const shapes = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    square: 'rounded-lg'
  };

  return (
    <div
      style={{ right: `${cameraPosition.x}px`, bottom: `${cameraPosition.y}px` }}
      className={clsx(
        'fixed z-40 overflow-hidden shadow-2xl border-2 border-white/20 select-none bg-black',
        sizes[cameraSize],
        shapes[cameraShape]
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover -scale-x-100" // mirrored selfie
      />
    </div>
  );
};
