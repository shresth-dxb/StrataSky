'use client';

import React from 'react';
import { Satellite, Droplets, Sprout } from 'lucide-react';

export type AppIconType = 'satellite' | 'water' | 'farming';

export interface AppIconProps {
  type: AppIconType;
  className?: string;
  style?: React.CSSProperties;
}

export function AppIcon({ type, className = '', style }: AppIconProps) {
  let background = '';
  let IconComponent = Satellite;
  let label = '';

  switch (type) {
    case 'satellite':
      background = 'linear-gradient(135deg, #1C1C1E, #2C2C2E)';
      IconComponent = Satellite;
      label = 'Satellite';
      break;
    case 'water':
      background = 'linear-gradient(135deg, #0A84FF, #005EBA)';
      IconComponent = Droplets;
      label = 'Water';
      break;
    case 'farming':
      background = 'linear-gradient(135deg, #34C759, #248A3D)';
      IconComponent = Sprout;
      label = 'Farming';
      break;
  }

  return (
    <span
      role="img"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.1em',
        height: '1.1em',
        borderRadius: '0.25em',
        verticalAlign: '-0.15em',
        margin: '0 0.12em',
        boxShadow:
          '0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)',
        background,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      className={`select-none transition-transform duration-200 hover:scale-105 ${className}`}
    >
      <IconComponent
        strokeWidth={2.2}
        style={{
          width: '58%',
          height: '58%',
          color: '#FFFFFF',
        }}
      />
    </span>
  );
}

export default AppIcon;
