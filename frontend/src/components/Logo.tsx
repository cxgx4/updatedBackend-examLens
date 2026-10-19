import React from 'react';

interface LogoProps {
  variant?: 'default' | 'white' | 'on-orange';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-lg', badge: 'w-7 h-7 rounded-xl' },
    md: { img: 'w-9 h-9', text: 'text-xl', badge: 'w-9 h-9 rounded-2xl' },
    lg: { img: 'w-12 h-12', text: 'text-2xl', badge: 'w-12 h-12 rounded-3xl' },
  };

  const isWhite = variant === 'white';
  const isOnOrange = variant === 'on-orange';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {isOnOrange ? (
        <div className={`flex items-center justify-center bg-primary text-white shadow-warm ${sizeMap[size].badge}`}>
          <img
            src="/brand/logo-mark-white.svg"
            alt="ExamLens Mark"
            className="w-3/5 h-3/5 object-contain"
          />
        </div>
      ) : (
        <div className={`flex items-center justify-center ${sizeMap[size].badge}`}>
          <img
            src={isWhite ? '/brand/logo-mark-white.svg' : '/brand/logo-mark.svg'}
            alt="ExamLens Mark"
            className={`${sizeMap[size].img} object-contain transition-transform duration-200 hover:scale-105`}
          />
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-sans font-bold tracking-tight ${
              isWhite ? 'text-white' : 'text-ink'
            } ${sizeMap[size].text}`}
          >
            ExamLens
          </span>
        </div>
      )}
    </div>
  );
};
