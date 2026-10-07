'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';

export const CRTOverlay: React.FC = () => {
  const crtScanlines = useGameStore((state) => state.crtScanlines);

  if (!crtScanlines) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{
        background: `
          linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
          linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))
        `,
        backgroundSize: '100% 4px, 6px 100%',
        boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.65)',
      }}
    />
  );
};
