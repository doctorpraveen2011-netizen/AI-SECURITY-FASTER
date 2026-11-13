import React from 'react';

export const Brain3D: React.FC = () => {
  return (
    <div className="relative w-44 h-28 flex items-center justify-center overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/20 to-orange-600/10 rounded-full blur-xl animate-pulse" />

      {/* Cybernetic Wireframe Brain SVG matching screenshot */}
      <svg
        viewBox="0 0 200 120"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(255,138,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA826" />
            <stop offset="50%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hemispheres Contour */}
        <path
          d="M100 20 C70 15, 30 25, 25 55 C20 80, 45 105, 80 105 C90 105, 95 98, 100 95 C105 98, 110 105, 120 105 C155 105, 180 80, 175 55 C170 25, 130 15, 100 20 Z"
          stroke="url(#brainGrad)"
          strokeWidth="1.8"
          strokeDasharray="4 2"
          opacity="0.85"
        />

        {/* Central Cerebral Fissure */}
        <path
          d="M100 22 C96 35, 104 50, 98 65 C102 78, 97 88, 100 95"
          stroke="#FFB347"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Left Lobes Neural Circuits */}
        <path
          d="M35 50 C45 35, 70 35, 85 45 M30 65 C45 60, 65 70, 80 62 M40 85 C55 80, 75 92, 92 88"
          stroke="url(#brainGrad)"
          strokeWidth="1.2"
          opacity="0.75"
        />
        <path
          d="M50 35 C55 55, 60 75, 65 95 M75 30 C78 50, 82 70, 88 95"
          stroke="#FF8A00"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          opacity="0.6"
        />

        {/* Right Lobes Neural Circuits */}
        <path
          d="M165 50 C155 35, 130 35, 115 45 M170 65 C155 60, 135 70, 120 62 M160 85 C145 80, 125 92, 108 88"
          stroke="url(#brainGrad)"
          strokeWidth="1.2"
          opacity="0.75"
        />
        <path
          d="M150 35 C145 55, 140 75, 135 95 M125 30 C122 50, 118 70, 112 95"
          stroke="#FF8A00"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          opacity="0.6"
        />

        {/* Synaptic Nodes */}
        <circle cx="85" cy="45" r="2.5" fill="#FFE2B3" className="animate-ping" />
        <circle cx="115" cy="45" r="2.5" fill="#FFE2B3" className="animate-ping" style={{ animationDelay: '0.5s' }} />
        <circle cx="65" cy="62" r="2" fill="#FFA826" />
        <circle cx="135" cy="62" r="2" fill="#FFA826" />
        <circle cx="98" cy="65" r="2.5" fill="#FFFFFF" />
        <circle cx="48" cy="78" r="2" fill="#FF8A00" />
        <circle cx="152" cy="78" r="2" fill="#FF8A00" />
      </svg>
    </div>
  );
};

