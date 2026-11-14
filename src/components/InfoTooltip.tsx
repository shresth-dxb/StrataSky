'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  text: string;
  className?: string;
  ariaLabel?: string;
}

export default function InfoTooltip({
  text,
  className = '',
  ariaLabel = 'Metric information',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: true,
  });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 250;
    const margin = 12;

    // Center horizontally on trigger button, clamp inside viewport
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < margin) {
      left = margin;
    } else if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - margin - tooltipWidth;
    }

    // Determine vertical placement: prefer above trigger unless too close to top
    const estimatedHeight = 90;
    const placeAbove = rect.top >= estimatedHeight + margin;
    const top = placeAbove ? rect.top - 8 : rect.bottom + 8;

    setCoords({ top, left, placeAbove });
  }, []);

  const handleOpen = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    calculatePosition();
    setIsOpen(true);
  };

  const handleClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click or window resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    function handleDocClick(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      calculatePosition();
    }

    document.addEventListener('mousedown', handleDocClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, calculatePosition]);

  const tooltipElement =
    isOpen && mounted
      ? createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={() => {
              if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            }}
            onMouseLeave={handleClose}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: coords.placeAbove ? 'translateY(-100%)' : 'none',
              width: '250px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5EA',
              borderRadius: '14px',
              padding: '12px 14px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
              zIndex: 9999,
              color: '#3A3A3C',
              fontSize: '12px',
              lineHeight: '1.45',
              fontWeight: 400,
              pointerEvents: 'auto',
              textAlign: 'start',
              transition: 'opacity 0.18s ease-out, transform 0.18s ease-out',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
            }}
            role="tooltip"
          >
            {text}
          </div>,
          document.body
        )
      : null;

  return (
    <span
      className="inline-flex items-center align-middle"
      style={{ verticalAlign: 'middle', lineHeight: 1 }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
        aria-label={ariaLabel}
        style={{
          width: '16px',
          height: '16px',
          border: '1px solid #D1D1D6',
          borderRadius: '9999px',
          color: '#86868B',
          fontSize: '11px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: '#FFFFFF',
          padding: 0,
          lineHeight: '1',
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
        className={`hover:border-[#86868B] hover:text-[#111111] hover:bg-[#F2F2F7] transition-all duration-150 ml-1 shrink-0 ${className}`}
      >
        ?
      </button>
      {tooltipElement}
    </span>
  );
}
