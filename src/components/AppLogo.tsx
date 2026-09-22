import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-8 h-8 rounded-xl', size = 32 }) => {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden shrink-0 select-none shadow-xs transition-transform hover:scale-105 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
      }}
      title="K Maps Solver"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="33"
          y="39"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontWeight="800"
          fontSize="36"
          fontFamily="system-ui, -apple-system, 'SF Pro Text', monospace, sans-serif"
        >
          0
        </text>
        <text
          x="67"
          y="39"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontWeight="800"
          fontSize="36"
          fontFamily="system-ui, -apple-system, 'SF Pro Text', monospace, sans-serif"
        >
          1
        </text>
        <text
          x="33"
          y="73"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontWeight="800"
          fontSize="36"
          fontFamily="system-ui, -apple-system, 'SF Pro Text', monospace, sans-serif"
        >
          1
        </text>
        <text
          x="67"
          y="73"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontWeight="800"
          fontSize="36"
          fontFamily="system-ui, -apple-system, 'SF Pro Text', monospace, sans-serif"
        >
          0
        </text>
      </svg>
    </div>
  );
};
