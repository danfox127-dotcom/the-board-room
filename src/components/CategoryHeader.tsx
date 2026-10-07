'use client';

import React from 'react';
import { Category } from '@/types/game';

interface CategoryHeaderProps {
  category: Category;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category }) => {
  return (
    <div className="relative flex min-h-[90px] flex-col items-center justify-center rounded border-2 border-yellow-500/80 bg-gradient-to-b from-[#091092] via-[#050B74] to-[#02054D] p-2 text-center shadow-md transition hover:border-yellow-400">
      <h3
        className="text-xs font-black uppercase tracking-wider text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-sm md:text-base leading-tight"
        style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
      >
        {category.title}
      </h3>

      {category.era && (
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-amber-400/70">
          {category.era}
        </span>
      )}
    </div>
  );
};
