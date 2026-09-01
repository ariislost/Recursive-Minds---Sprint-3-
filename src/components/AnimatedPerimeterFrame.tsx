import React from 'react';

interface AnimatedPerimeterFrameProps {
  progress?: number; // Optional progress (0-100). If not provided, it will animate continuously
  isContinuous?: boolean;
}

export const AnimatedPerimeterFrame: React.FC<AnimatedPerimeterFrameProps> = ({
  progress,
  isContinuous = false,
}) => {
  return (
    <div className="fixed inset-2 sm:inset-3 pointer-events-none z-30">
      <svg
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle background track */}
        <rect
          x="2"
          y="2"
          width="calc(100% - 4px)"
          height="calc(100% - 4px)"
          rx="18"
          ry="18"
          fill="none"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth="1"
        />

        {/* Continuous Animated perimeter stroke (for login/loading/logging-out transitions) */}
        {isContinuous ? (
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="18"
            ry="18"
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
            pathLength="100"
            className="animate-perimeter-flow drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          />
        ) : typeof progress === 'number' ? (
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="18"
            ry="18"
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.5"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            strokeLinecap="round"
            className="transition-all duration-75 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          />
        ) : (
          /* Static perimeter frame for logged-in state: clean, stable, non-intrusive */
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="18"
            ry="18"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
          />
        )}
      </svg>
    </div>
  );
};

