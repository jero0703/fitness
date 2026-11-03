import React from "react";

const StatCard = ({ title, value, unit, icon: Icon, color = "primary", subtitle, trend }) => {
  const colorMap = {
    primary: "bg-emerald-50 text-primary border-emerald-100",
    secondary: "bg-teal-50 text-secondary border-teal-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-borderSubtle shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-textMuted">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.primary}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold text-textMain tracking-tight">
          {value !== undefined && value !== null ? value : "—"}
        </span>
        {unit && <span className="text-sm font-medium text-textMuted">{unit}</span>}
      </div>
      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-textMuted">
          <span>{subtitle}</span>
          {trend && (
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
