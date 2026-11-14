import React from 'react';

export interface PromptBarSource {
  key: string;
  name: string;
  description?: string;
  icon?: any;
  attach?: boolean;
}

export interface PromptBarCommand {
  key: string;
  name: string;
  description?: string;
}

export interface PromptBarModel {
  key: string;
  name: string;
  tag?: string;
}

export interface PromptBarProps {
  placeholder?: string;
  sources?: PromptBarSource[];
  commands?: PromptBarCommand[];
  models?: PromptBarModel[];
  defaultModel?: string;
  efforts?: string[];
  defaultEffort?: string;
  effortTitle?: string;
  effortFaster?: string;
  effortSmarter?: string;
  effortHelp?: string;
  noMatchesText?: string;
  onEffortChange?: (effort: string) => void;
  busy?: boolean;
  onSend?: (text: string, options?: any) => void;
  onStop?: () => void;
  onAttach?: (files: File[]) => void;
  onDictate?: () => void;
  background?: string;
  color?: string;
  menuBackground?: string;
  sparkColor?: string;
  sparkBoost?: number;
  width?: number;
  radius?: number;
  maxRows?: number;
  morphDuration?: number;
  squash?: number;
  tilt?: number;
  pressScale?: number;
  className?: string;
}

declare const PromptBar: React.FC<PromptBarProps>;
export default PromptBar;
