import React, { useState, useEffect } from "react";
import { progressAPI } from "../services/api";
import StatCard from "../components/StatCard";
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Activity,
  Award
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import { toast } from "react-toastify";

const Progress = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const now = new Date(selectedDate);
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        progressAPI.getDaily(selectedDate),
        progressAPI.getWeekly(selectedDate),
        progressAPI.getMonthly(now.getFullYear(), now.getMonth() + 1),
      ]);

      setDailyData(dailyRes.data);
      setWeeklyData(weeklyRes.data);
      setMonthlyData(monthlyRes.data);
    } catch (err) {
      console.error("Progress fetch error:", err);
      toast.error("Failed to load progress records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  if (loading && !dailyData) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-semibold text-textMuted">Loading Daily Progress Records...</p>
      </div>
    );
  }

  const recentWorkoutsList = dailyData?.recent_workouts || [];
  const weeklyBreakdown = weeklyData?.daily_breakdown || [];
  const monthlyBreakdown = monthlyData?.weekly_breakdown || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Date Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Daily Progress Tracking</h1>
          <p className="text-xs text-textMuted mt-0.5">
            Synchronized aggregates derived directly from your workout logs
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-borderSubtle shadow-sm">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition"
            title="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-1.5 px-2">
            <Calendar className="h-4 w-4 text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-transparent focus:outline-none"
            />
          </div>
          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition"
            title="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={handleSetToday}
            className="px-2.5 py-1 text-[11px] font-bold text-primary bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Daily Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Daily Workouts"
          value={dailyData?.total_workouts ?? 0}
          unit="sessions"
          icon={Dumbbell}
          color="primary"
          subtitle={`Selected: ${selectedDate}`}
        />
        <StatCard
          title="Daily Calories"
          value={dailyData?.total_calories ? Math.round(dailyData.total_calories) : 0}
          unit="kcal"
          icon={Flame}
          color="orange"
          subtitle="Energy expended"
        />
        <StatCard
          title="Daily Active Duration"
          value={dailyData?.total_duration ?? 0}
          unit="minutes"
          icon={Clock}
          color="blue"
          subtitle="Total workout duration"
        />
        <StatCard
          title="Weekly Activity"
          value={weeklyData?.total_workouts ?? 0}
          unit="workouts"
          icon={TrendingUp}
          color="secondary"
          subtitle={`${Math.round(weeklyData?.total_calories || 0)} kcal total`}
        />
      </div>

      {/* 7-Day Rolling Activity Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">7-Day Activity Breakdown</h3>
            <p className="text-xs text-textMuted mt-0.5">
              Window: {weeklyData?.start_date || "—"} to {weeklyData?.end_date || "—"}
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold text-textMuted">
            <span className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>Calories (kcal)</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {weeklyBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                  formatter={(value) => [`${value} kcal`, "Calories Burned"]}
                  labelFormatter={(label, item) => `${label} - ${item[0]?.payload?.date || ""}`}
                />
                <Bar dataKey="calories" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  {weeklyBreakdown.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.date === selectedDate ? "#10B981" : "#22C55E"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-textMuted">
              No activity records available for this period.
            </div>
          )}
        </div>
      </div>

      {/* Two columns: Day's Workouts & Monthly Week-by-Week Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selected Day's Workout Sessions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Workouts on {selectedDate}</h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-primary">
                {recentWorkoutsList.length} logged
              </span>
            </div>

            {recentWorkoutsList.length === 0 ? (
              <div className="py-12 text-center">
                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl inline-flex mb-2">
                  <Activity className="h-6 w-6" />
                </div>
                <p className="text-xs font-medium text-gray-600">No workout sessions logged for this day.</p>
                <p className="text-[11px] text-textMuted mt-1">
                  Log a workout in the Workouts tab to automatically update this summary.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkoutsList.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-primary">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{w.workout_name}</h4>
                        <span className="text-[10px] font-semibold text-secondary">{w.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-800">{Math.round(w.calories_burned)} kcal</p>
                      <p className="text-[11px] text-textMuted">{w.duration} mins</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Summary & Week-by-Week Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">
                Monthly Performance ({monthlyData ? `${monthlyData.month}/${monthlyData.year}` : ""})
              </h3>
              <span className="text-xs font-bold text-secondary">
                {monthlyData?.total_workouts || 0} total workouts
              </span>
            </div>

            {monthlyBreakdown.length === 0 ? (
              <div className="py-12 text-center text-xs text-textMuted">
                No monthly breakdown data available yet.
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyBreakdown.map((wk, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">{wk.week}</span>
                      <span className="text-xs font-bold text-primary">{Math.round(wk.calories)} kcal</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-textMuted">
                      <span>{wk.start_date} to {wk.end_date}</span>
                      <span>{wk.workouts} workouts · {wk.duration} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-textMuted">
            <span>Month's Total Calories:</span>
            <span className="text-sm font-extrabold text-gray-900">
              {Math.round(monthlyData?.total_calories || 0)} kcal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
