import React from 'react';

export interface SlideCommitProps {
  label?: string;
  doneLabel?: string;
  errorLabel?: string;
  onConfirm?: () => void | Promise<unknown>;
  onDone?: () => void;
  onError?: (error: unknown) => void;
  trackColor?: string;
  handleColor?: string;
  successColor?: string;
  dangerColor?: string;
  width?: number | string;
  height?: number;
  radius?: number;
  speed?: number;
  returnBounce?: number;
  landingDip?: number;
  holdMs?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

declare const SlideCommit: React.ComponentType<SlideCommitProps>;
export default SlideCommit;
