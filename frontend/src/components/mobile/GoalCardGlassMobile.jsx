// components/GoalCardGlassMobile.jsx
import React from "react";

const formatMoney = (n) =>
  "₱" + n.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ".00";

const GoalCardGlassMobile = ({ goal }) => {
  const remaining = goal.total - goal.amount;
  const progressCurrent = goal.amount;
  const progressTotal = goal.total;
  const percent = Math.min(Math.max(progressCurrent / progressTotal, 0), 1);
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div className="w-full max-w-xs rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 p-5 shadow-2xl flex gap-4">
      <div className="flex-shrink-0 flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            strokeOpacity={0.2}
            strokeWidth={stroke}
            stroke="white"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke="#d4d543"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          <text
            x="50%"
            y="45%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={14}
            fontWeight="600"
            fill="white"
          >
            {goal.percentage}%
          </text>
          <text
            x="50%"
            y="60%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={10}
            fill="white"
          >
            {goal.status}
          </text>
        </svg>
      </div>
      <div className="flex-1 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold">{goal.title}</h2>
          <p className="text-xs">{goal.daysLeft}</p>
        </div>
        <div className="mt-2 text-sm">
          <div className="flex justify-between">
            <span className="opacity-80">Saved:</span>
            <span className="font-medium">{formatMoney(goal.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-80">Target:</span>
            <span className="font-medium">{formatMoney(goal.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-80">Remaining:</span>
            <span className="font-medium">
              {formatMoney(remaining > 0 ? remaining : 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCardGlassMobile;
