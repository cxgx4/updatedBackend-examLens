import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexMathProps {
  math: string;
  block?: boolean;
}

export const KatexMath: React.FC<KatexMathProps> = ({ math, block = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX rendering error:', e);
      return math;
    }
  }, [math, block]);

  return (
    <span 
      className={block ? 'block overflow-x-auto my-2 py-1' : 'inline'}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};
