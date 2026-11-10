import React from 'react';
import clsx from 'clsx';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  unit?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit = '',
  className
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {(label !== undefined || unit) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-text-muted font-medium">{label}</span>}
          <span className="font-mono text-text-primary text-[11px] bg-secondary px-1.5 py-0.5 rounded border border-card-border/60">
            {value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative flex items-center h-5 w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-purple focus:outline-none"
          style={{
            background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${percentage}%, #20232B ${percentage}%, #20232B 100%)`
          }}
        />
      </div>
    </div>
  );
};
