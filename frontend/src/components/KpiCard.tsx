import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  iconBg: string;
  sparklineColor: string;
  sparklinePoints: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBg,
  sparklineColor,
  sparklinePoints
}) => {
  return (
    <div className="bg-[#171717] border border-[#242424] hover:border-[#383838] rounded-xl p-4 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs text-[#888888] font-medium">{title}</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{value}</span>
            {change && (
              <span className="text-[11px] font-medium text-[#00C784] font-mono">
                {change}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mini SVG Sparkline */}
      <div className="w-24 h-10 flex items-center justify-end pr-1">
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
          <polyline
            fill="none"
            stroke={sparklineColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={sparklinePoints}
          />
        </svg>
      </div>
    </div>
  );
};

