"use client";

import React from 'react';
import clsx from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  disabled = false,
  className
}) => {
  return (
    <div className={clsx("shrink-0 flex items-center", className)}>
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          className="toggle-input" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="toggle-label" />
      </label>
    </div>
  );
};
