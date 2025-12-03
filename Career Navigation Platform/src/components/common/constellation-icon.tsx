import React from 'react';

interface ConstellationIconProps {
  type: 'brain' | 'play' | 'trophy' | 'data' | 'design' | 'code' | 'marketing' | 'finance' | 'hr' | 'consulting';
  className?: string;
}

export function ConstellationIcon({ type, className = '' }: ConstellationIconProps) {
  const icons = {
    brain: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path d="M24 8L28 12L32 8L36 12L32 16L36 20L32 24L28 20L24 24L20 20L16 24L12 20L16 16L12 12L16 8L20 12L24 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="16" r="2" fill="currentColor"/>
        <circle cx="16" cy="20" r="1.5" fill="currentColor"/>
        <circle cx="32" cy="20" r="1.5" fill="currentColor"/>
        <path d="M20 24L18 32M28 24L30 32M24 28L24 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="32" r="1.5" fill="currentColor"/>
        <circle cx="30" cy="32" r="1.5" fill="currentColor"/>
        <circle cx="24" cy="36" r="2" fill="currentColor"/>
      </svg>
    ),
    play: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 16L32 24L20 32V16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <circle cx="36" cy="12" r="2" fill="currentColor"/>
        <circle cx="12" cy="36" r="2" fill="currentColor"/>
        <circle cx="36" cy="36" r="2" fill="currentColor"/>
        <path d="M12 12L18 18M36 12L30 18M12 36L18 30M36 36L30 30" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    trophy: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path d="M18 12V8L24 6L30 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 12H32L30 24H18L16 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 24V32M18 32H30M20 36H28M24 36V40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="18" r="2" fill="currentColor"/>
        <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="36" cy="14" r="1.5" fill="currentColor"/>
        <path d="M12 14L16 16M36 14L32 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    data: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path d="M24 10V38M12 22H36M16 14H32M18 30H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="10" r="2" fill="currentColor"/>
        <circle cx="12" cy="22" r="2" fill="currentColor"/>
        <circle cx="36" cy="22" r="2" fill="currentColor"/>
        <circle cx="16" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="32" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="18" cy="30" r="1.5" fill="currentColor"/>
        <circle cx="30" cy="30" r="1.5" fill="currentColor"/>
        <circle cx="24" cy="38" r="2" fill="currentColor"/>
      </svg>
    ),
    design: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <rect x="12" y="12" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 20H36M20 12V36" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="32" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="32" r="1.5" fill="currentColor"/>
        <circle cx="32" cy="32" r="1.5" fill="currentColor"/>
      </svg>
    ),
    code: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path d="M16 18L10 24L16 30M32 18L38 24L32 30M28 14L20 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="24" r="2" fill="currentColor"/>
        <circle cx="38" cy="24" r="2" fill="currentColor"/>
        <circle cx="16" cy="18" r="1.5" fill="currentColor"/>
        <circle cx="32" cy="18" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="30" r="1.5" fill="currentColor"/>
        <circle cx="32" cy="30" r="1.5" fill="currentColor"/>
      </svg>
    ),
    marketing: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path d="M12 32L18 26L24 30L36 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="32" r="2" fill="currentColor"/>
        <circle cx="18" cy="26" r="2" fill="currentColor"/>
        <circle cx="24" cy="30" r="2" fill="currentColor"/>
        <circle cx="36" cy="18" r="2" fill="currentColor"/>
        <path d="M32 18L36 14L40 18M36 14V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    finance: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M24 16V32M20 20H26C27.1 20 28 20.9 28 22C28 23.1 27.1 24 26 24H22C20.9 24 20 24.9 20 26C20 27.1 20.9 28 22 28H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="36" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="12" cy="36" r="1.5" fill="currentColor"/>
        <circle cx="36" cy="36" r="1.5" fill="currentColor"/>
      </svg>
    ),
    hr: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <circle cx="24" cy="18" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 38C14 32.4772 18.4772 28 24 28C29.5228 28 34 32.4772 34 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="36" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="14" cy="38" r="2" fill="currentColor"/>
        <circle cx="34" cy="38" r="2" fill="currentColor"/>
      </svg>
    ),
    consulting: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <circle cx="18" cy="18" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="32" cy="30" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M23 22L27 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="24" cy="18" r="1.5" fill="currentColor"/>
        <circle cx="38" cy="24" r="1.5" fill="currentColor"/>
        <circle cx="26" cy="36" r="1.5" fill="currentColor"/>
      </svg>
    ),
  };

  return icons[type];
}
