import React from 'react';
import clsx from 'clsx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled
}) => {
  return (
    <label className={clsx('flex items-center justify-between cursor-pointer group py-1', disabled && 'opacity-50 pointer-events-none')}>
      <div className="flex flex-col pr-3">
        {label && <span className="text-xs font-medium text-text-primary group-hover:text-white transition-colors">{label}</span>}
        {description && <span className="text-[11px] text-text-subtle">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-purple/40',
          checked ? 'bg-accent-purple' : 'bg-secondary border border-card-border'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  );
};
