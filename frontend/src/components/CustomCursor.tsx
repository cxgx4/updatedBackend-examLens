import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices or reduced motion
    if (window.matchMedia('(pointer: coarse)').matches || 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement;
      const isInteractive = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('clickable')
      );
      setIsPointer(!!isInteractive);
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Precision Center Dot */}
      <div
        className="fixed pointer-events-none z-50 w-1.5 h-1.5 bg-[#FF3B30] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      {/* Outer Tactical Reticle Ring */}
      <div
        className={`fixed pointer-events-none z-50 border -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out ${
          isPointer
            ? 'w-7 h-7 border-[#FF3B30] bg-[#FF3B30]/10 scale-110'
            : 'w-4 h-4 border-slate-500/50 scale-100'
        }`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
    </>
  );
};
