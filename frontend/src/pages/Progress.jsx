import React, { useState, useEffect } from "react";
import { progressAPI, comparisonAPI } from "../services/api";
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
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  CalendarDays
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell
} from "recharts";
import { toast } from "react-toastify";

const Progress = () => {
  const [activeTab, setActiveTab] = useState("comparison"); // "comparison" or "daily"

  // Daily Progress State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);

  // Comparison State (Module 9)
  const [comparisonPeriod, setComparisonPeriod] = useState("weekly"); // "weekly" or "monthly"
  const [weeklyComp, setWeeklyComp] = useState(null);
  const [monthlyComp, setMonthlyComp] = useState(null);
  const [compLoading, setCompLoading] = useState(true);

  // Load Daily Data
  const fetchDailyProgress = async () => {
    try {
      setDailyLoading(true);
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
      console.error(err);
      toast.error("Failed to load daily progress.");
    } finally {
      setDailyLoading(false);
    }
  };

  // Load Comparison Data
  const fetchComparisonData = async () => {
    try {
      setCompLoading(true);
      const [wRes, mRes] = await Promise.all([
        comparisonAPI.getWeekly(),
        comparisonAPI.getMonthly(),
      ]);
      setWeeklyComp(wRes.data);
      setMonthlyComp(mRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load progress comparison.");
    } finally {
      setCompLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyProgress();
  }, [selectedDate]);

  useEffect(() => {
    fetchComparisonData();
  }, []);

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

  const currentComp = comparisonPeriod === "weekly" ? weeklyComp : monthlyComp;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Module 9 • Progress & Performance Comparison</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Progress & Comparison Insights
            </h1>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Compare your workout volume, calorie burn, and endurance over time to spot trends and celebrate consistent gains.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1.5 bg-gray-800/80 rounded-2xl border border-gray-700 shrink-0">
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === "comparison"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Performance Comparison</span>
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === "daily"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Daily Log Aggregate</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MODULE 9 - PROGRESS COMPARISON                     */}
      {/* ========================================================= */}
      {activeTab === "comparison" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Comparison Period Toggle & Period Label */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-borderSubtle shadow-sm">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {currentComp?.period_label || "Performance Comparison"}
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Side-by-side analysis of workout volume and calorie expenditure
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setComparisonPeriod("weekly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  comparisonPeriod === "weekly"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                This Week vs Last Week
              </button>
              <button
                onClick={() => setComparisonPeriod("monthly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  comparisonPeriod === "monthly"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Past 30 Days vs Prior 30 Days
              </button>
            </div>
          </div>

          {/* Comparison Metrics Grid */}
          {compLoading ? (
            <div className="py-12 text-center text-xs text-textMuted font-medium">
              Calculating comparison statistics...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {currentComp?.metrics?.map((m, idx) => {
                const isPositive = m.difference >= 0;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 border border-borderSubtle shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{m.name}</span>
                        <span
                          className={`inline-flex items-center text-xs font-black px-2 py-0.5 rounded-full ${
                            isPositive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          )}
                          {isPositive ? `+${m.percentage_change}%` : `${m.percentage_change}%`}
                        </span>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-gray-900">{m.current}</span>
                        <span className="text-xs text-gray-400 font-semibold">
                          vs {m.previous} (prev)
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                      Delta: <strong className={isPositive ? "text-emerald-700" : "text-red-600"}>
                        {m.difference > 0 ? `+${m.difference}` : m.difference}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Side-by-Side Comparison Charts & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Side-by-Side Bar Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {comparisonPeriod === "weekly" ? "Day-by-Day Calorie Burn Comparison" : "Weekly Breakdown Comparison"}
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">
                    Current period (Emerald) vs Previous period (Slate)
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                {comparisonPeriod === "weekly" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyComp?.daily_comparison || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                        formatter={(val, name) => [`${val} kcal`, name === "current_calories" ? "This Week" : "Last Week"]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        formatter={(value) => (value === "current_calories" ? "This Week" : "Last Week")}
                      />
                      <Bar dataKey="current_calories" name="current_calories" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="previous_calories" name="previous_calories" fill="#94A3B8" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyComp?.weekly_breakdown || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                        formatter={(val, name) => [`${val} kcal`, name === "current_calories" ? "Past 30 Days" : "Prior 30 Days"]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        formatter={(value) => (value === "current_calories" ? "Past 30 Days" : "Prior 30 Days")}
                      />
                      <Bar dataKey="current_calories" name="current_calories" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="previous_calories" name="previous_calories" fill="#94A3B8" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Smart Progress Insights Card (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Improvement Trends & Insights</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  Performance Observations
                </h3>

                <div className="space-y-3.5">
                  {currentComp?.insights?.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-700 leading-relaxed font-medium"
                    >
                      {insight}
                    </div>
                  ))}
                  {(!currentComp?.insights || currentComp.insights.length === 0) && (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Log more workouts over consecutive weeks to generate deep comparative insights.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <span className="text-[11px] text-textMuted font-semibold block">
                  Keep maintaining daily consistency to set new weekly records!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DAILY LOG AGGREGATE (Phase 1 Baseline)             */}
      {/* ========================================================= */}
      {activeTab === "daily" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Date Selector Navigation */}
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-borderSubtle shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevDay}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
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
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs font-bold text-gray-700">Target: {selectedDate}</span>
          </div>

          {/* Daily Aggregate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Daily Workouts"
              value={dailyData?.total_workouts ?? 0}
              unit="sessions"
              icon={Dumbbell}
              color="primary"
            />
            <StatCard
              title="Daily Energy Burned"
              value={dailyData?.total_calories ? Math.round(dailyData.total_calories) : 0}
              unit="kcal"
              icon={Flame}
              color="orange"
            />
            <StatCard
              title="Daily Duration"
              value={dailyData?.total_duration ?? 0}
              unit="minutes"
              icon={Clock}
              color="blue"
            />
            <StatCard
              title="Rolling 7-Day Total"
              value={weeklyData?.total_workouts ?? 0}
              unit="sessions"
              icon={TrendingUp}
              color="secondary"
            />
          </div>

          {/* Daily Log Workouts List */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Workouts Recorded on {selectedDate}
            </h3>
            {(!dailyData?.recent_workouts || dailyData.recent_workouts.length === 0) ? (
              <div className="py-12 text-center text-xs text-textMuted bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No workouts recorded on {selectedDate}.
              </div>
            ) : (
              <div className="space-y-3">
                {dailyData.recent_workouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-emerald-100 text-primary">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{w.workout_name}</h4>
                        <span className="text-[11px] text-gray-500">{w.category} • {w.duration} mins</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-700">{Math.round(w.calories_burned)} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
