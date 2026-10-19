import React from 'react';
import { motion } from 'framer-motion';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  count?: number | string;
  icon?: React.ElementType;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1.5 bg-grey-card rounded-pill border border-border/60 ${className}`}
    >
      {options.map((opt) => {
        const isActive = value === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center justify-center gap-2 rounded-pill font-medium transition-colors z-10 ${
              size === 'sm' ? 'px-4 py-1.5 text-xs' : 'px-5 py-2 text-sm'
            } ${
              isActive
                ? 'text-ink font-semibold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="segmentedPillActive"
                className="absolute inset-0 bg-white rounded-pill shadow-sm -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            {Icon && (
              <Icon
                size={size === 'sm' ? 14 : 16}
                className={isActive ? 'text-primary' : 'text-ink-faint'}
              />
            )}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-pill ${
                  isActive
                    ? 'bg-primary-tint text-primary-text font-bold'
                    : 'bg-border/60 text-ink-soft'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
