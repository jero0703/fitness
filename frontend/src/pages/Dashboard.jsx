import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { progressAPI, workoutsAPI, goalsAPI } from "../services/api";
import StatCard from "../components/StatCard";
import WorkoutModal from "../components/WorkoutModal";
import {
  Dumbbell,
  Flame,
  Clock,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Activity
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

const Dashboard = () => {
  const { user } = useAuth();

  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [dailyRes, weeklyRes, goalsRes, workoutsRes] = await Promise.all([
        progressAPI.getDaily(),
        progressAPI.getWeekly(),
        goalsAPI.getAll(),
        workoutsAPI.getAll({ limit: 5 }),
      ]);

      setDailyData(dailyRes.data);
      setWeeklyData(weeklyRes.data);
      setGoals(goalsRes.data);
      setRecentWorkouts(workoutsRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Could not fetch latest fitness metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateWorkout = async (workoutData) => {
    try {
      await workoutsAPI.create(workoutData);
      toast.success("Workout recorded successfully!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed to save workout.");
      throw err;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Completed</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">In Progress</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Not Started</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <Activity className="h-3.5 w-3.5" />
              <span>Daily Fitness Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to crush your goals, {user?.username}?
            </h1>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Track your daily exercises, maintain workout streaks, and visualize your progress with live analytics.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setWorkoutModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/30 transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Quick Add Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Workouts Today"
          value={dailyData?.total_workouts ?? 0}
          unit="sessions"
          icon={Dumbbell}
          color="primary"
          subtitle="Daily target: 1-2 sessions"
        />
        <StatCard
          title="Calories Burned"
          value={dailyData?.total_calories ? Math.round(dailyData.total_calories) : 0}
          unit="kcal"
          icon={Flame}
          color="orange"
          subtitle="Today's energy output"
        />
        <StatCard
          title="Workout Duration"
          value={dailyData?.total_duration ?? 0}
          unit="minutes"
          icon={Clock}
          color="blue"
          subtitle="Total active exercise time"
        />
        <StatCard
          title="Weekly Workouts"
          value={weeklyData?.total_workouts ?? 0}
          unit="workouts"
          icon={TrendingUp}
          color="secondary"
          subtitle={`${Math.round(weeklyData?.total_calories || 0)} kcal this week`}
        />
      </div>

      {/* Main Charts & Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity Bar Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Weekly Activity Overview</h3>
              <p className="text-xs text-textMuted mt-0.5">Calories burned over the past 7 days</p>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
            >
              <span>Detailed Analytics</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {weeklyData?.daily_breakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.daily_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value) => [`${value} kcal`, "Calories Burned"]}
                    labelFormatter={(label, item) => `${label} (${item[0]?.payload?.date || ""})`}
                  />
                  <Bar dataKey="calories" radius={[8, 8, 0, 0]} maxBarSize={40}>
                    {weeklyData.daily_breakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.calories > 0 ? "#22C55E" : "#E2E8F0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">
                No activity records for this period. Log a workout to see your chart!
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-textMuted">
            <span>Rolling 7-Day Window: {weeklyData?.start_date} to {weeklyData?.end_date}</span>
            <span className="font-semibold text-gray-800">Total: {Math.round(weeklyData?.total_calories || 0)} kcal</span>
          </div>
        </div>

        {/* Fitness Goals Progress Card (1 column) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Active Goals</h3>
              <p className="text-xs text-textMuted mt-0.5">Track milestone progress</p>
            </div>
            <Link
              to="/goals"
              className="text-xs font-bold text-secondary hover:text-secondary-dark flex items-center space-x-1"
            >
              <span>All Goals</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 bg-teal-50 text-secondary rounded-2xl mb-2">
                  <Target className="h-6 w-6" />
                </div>
                <p className="text-xs font-medium text-gray-600">No active fitness goals yet.</p>
                <Link
                  to="/goals"
                  className="mt-3 text-xs font-bold text-secondary hover:underline"
                >
                  + Create your first goal
                </Link>
              </div>
            ) : (
              goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-900">{goal.goal_type}</span>
                    {getStatusBadge(goal.status)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-textMuted mb-2">
                    <span>Target: {goal.target_value}</span>
                    <span>Current: {goal.current_value} ({goal.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[10px] text-gray-400 text-right">
                    Deadline: {goal.deadline}
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/goals"
            className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:text-primary hover:border-primary transition flex items-center justify-center space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manage All Goals</span>
          </Link>
        </div>
      </div>

      {/* Recent Workouts Table Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Workout Sessions</h3>
            <p className="text-xs text-textMuted mt-0.5">Your most recently completed fitness logs</p>
          </div>
          <Link
            to="/workouts"
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
          >
            <span>View Full Log</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="p-3 bg-emerald-50 text-primary rounded-2xl inline-flex mb-3">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">No workouts logged yet</h4>
            <p className="text-xs text-textMuted mt-1 max-w-sm mx-auto">
              Get started by recording your first exercise session to trigger daily and weekly progress stats.
            </p>
            <button
              onClick={() => setWorkoutModalOpen(true)}
              className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-hover transition"
            >
              Record First Workout
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Workout Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Calories Burned</th>
                  <th className="py-3 px-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {recentWorkouts.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-primary shrink-0">
                        <Dumbbell className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate max-w-[200px]">{w.workout_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-secondary border border-teal-100">
                        {w.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{w.duration} mins</td>
                    <td className="py-3 px-4 text-gray-700 font-semibold">{Math.round(w.calories_burned)} kcal</td>
                    <td className="py-3 px-4 text-gray-500">{w.workout_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Workout Modal */}
      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        onSave={handleCreateWorkout}
      />
    </div>
  );
};

export default Dashboard;
