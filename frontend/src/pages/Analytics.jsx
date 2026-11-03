import React, { useState, useEffect } from "react";
import { analyticsAPI } from "../services/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Flame,
  PieChart as PieIcon,
  Activity,
  Calendar,
  Clock,
  Dumbbell
} from "lucide-react";
import { toast } from "react-toastify";

const Analytics = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [caloriesData, setCaloriesData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [weeklyRes, monthlyRes, caloriesRes, categoriesRes] = await Promise.all([
        analyticsAPI.getWeekly(),
        analyticsAPI.getMonthly(),
        analyticsAPI.getCalories(14),
        analyticsAPI.getCategories(),
      ]);

      setWeeklyData(weeklyRes.data);
      setMonthlyData(monthlyRes.data);
      setCaloriesData(caloriesRes.data);
      setCategoriesData(categoriesRes.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
      toast.error("Could not fetch analytics records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-xs text-textMuted mt-0.5">
          Deep-dive analysis of your workout habits, calorie expenditure, and category breakdowns
        </p>
      </div>

      {/* Analytics Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-borderSubtle shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-primary">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-textMuted">Weekly Workouts</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{weeklyData?.total_workouts ?? 0}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">{Math.round(weeklyData?.total_calories || 0)} kcal</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-borderSubtle shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-500">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-textMuted">14-Day Energy Output</p>
            <h3 className="text-2xl font-extrabold text-gray-900">
              {Math.round(caloriesData?.total_calories ?? 0)} <span className="text-sm font-normal text-gray-500">kcal</span>
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">Daily calorie burns</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-borderSubtle shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-textMuted">30-Day Total Time</p>
            <h3 className="text-2xl font-extrabold text-gray-900">
              {monthlyData?.total_duration ?? 0} <span className="text-sm font-normal text-gray-500">mins</span>
            </h3>
            <p className="text-[11px] text-blue-600 font-semibold">{monthlyData?.total_workouts ?? 0} sessions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-borderSubtle shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-teal-50 text-secondary">
            <PieIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-textMuted">Categories Trained</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{categoriesData?.categories?.length ?? 0}</h3>
            <p className="text-[11px] text-teal-600 font-semibold">Diverse routine</p>
          </div>
        </div>
      </div>

      {/* Grid of 5 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Weekly Workout Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>1. Weekly Workout Frequency</span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">Number of workout sessions completed each day</p>
            </div>
            <span className="text-xs font-bold text-primary bg-emerald-50 px-2.5 py-1 rounded-full">
              {weeklyData?.total_workouts || 0} total
            </span>
          </div>

          <div className="h-72 w-full">
            {weeklyData?.chart_data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                    formatter={(value) => [`${value} sessions`, "Workouts"]}
                  />
                  <Bar dataKey="workouts" fill="#22C55E" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">No data available.</div>
            )}
          </div>
        </div>

        {/* Chart 2: Monthly Progress Line Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                <span>2. Monthly Progress Trend (30 Days)</span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">Daily workout frequency over the past month</p>
            </div>
            <span className="text-xs font-bold text-secondary bg-teal-50 px-2.5 py-1 rounded-full">
              30-day view
            </span>
          </div>

          <div className="h-72 w-full">
            {monthlyData?.chart_data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748B" }} interval={4} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                    formatter={(value) => [`${value} workouts`, "Sessions"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="#14B8A6"
                    strokeWidth={3}
                    dot={{ fill: "#14B8A6", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">No data available.</div>
            )}
          </div>
        </div>

        {/* Chart 3: Calories Burned Area Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>3. Daily Calories Burned (14-Day Area)</span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">Energy expenditure trajectory across recent days</p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {Math.round(caloriesData?.total_calories || 0)} kcal
            </span>
          </div>

          <div className="h-72 w-full">
            {caloriesData?.chart_data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={caloriesData.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                    formatter={(value) => [`${value} kcal`, "Calories Burned"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#EA580C"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#calorieGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">No data available.</div>
            )}
          </div>
        </div>

        {/* Chart 4: Workout Category Pie Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <PieIcon className="h-4 w-4 text-purple-600" />
                <span>4. Workout Category Distribution</span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">Breakdown of exercises by type</p>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              {categoriesData?.total_workouts || 0} workouts
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {categoriesData?.categories?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {categoriesData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                    formatter={(val, name, item) => [
                      `${val} workouts (${item.payload.percentage}%) · ${Math.round(item.payload.calories)} kcal`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-xs text-textMuted">
                No workouts logged across categories yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 5: Activity Distribution Duration Bar Chart (Full Width) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>5. Activity Distribution (Minutes Trained by Category)</span>
            </h3>
            <p className="text-xs text-textMuted mt-0.5">Total duration dedicated to each fitness discipline</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {categoriesData?.categories?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriesData.categories} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#1F2937", fontWeight: "bold" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                  formatter={(value) => [`${value} minutes`, "Time Spent"]}
                />
                <Bar dataKey="duration" fill="#3B82F6" radius={[0, 8, 8, 0]} maxBarSize={30}>
                  {categoriesData.categories.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-textMuted">
              No duration distribution data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
