import React from 'react';
import { useRecordingStore } from '../../store/recording.store';

export const CountdownOverlay: React.FC = () => {
  const { status, countdown } = useRecordingStore();

  if (status !== 'countdown') return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md pointer-events-none select-none">
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring background */}
        <div className="w-48 h-48 rounded-full border-4 border-accent-purple/30 animate-ping absolute" />
        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-accent-purple to-accent-sky p-1 shadow-glow-purple flex items-center justify-center">
          <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
            <span className="font-mono text-7xl font-extrabold text-white animate-bounce">
              {countdown}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm font-medium tracking-wide uppercase text-accent-sky animate-pulse">
        Get ready to record...
      </p>
    </div>
  );
};
