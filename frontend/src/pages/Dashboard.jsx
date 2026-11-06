import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  progressAPI,
  workoutsAPI,
  goalsAPI,
  streakAPI,
  plansAPI,
  badgesAPI
} from "../services/api";
import StatCard from "../components/StatCard";
import WorkoutModal from "../components/WorkoutModal";
import PlanModal from "../components/PlanModal";
import AchievementModal from "../components/AchievementModal";
import {
  Dumbbell,
  Flame,
  Clock,
  Target,
  Plus,
  Calendar,
  Award,
  ChevronRight,
  Activity,
  Zap,
  CheckCircle2,
  CalendarCheck,
  BookOpen,
  Trophy,
  Sparkles,
  ShieldCheck,
  Footprints,
  Crown,
  Medal
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

const iconMap = {
  Footprints,
  Dumbbell,
  Trophy,
  Crown,
  Flame,
  Zap,
  ShieldCheck,
  Medal,
  Target,
  CheckCircle2,
  Award,
  Sparkles,
};

const Dashboard = () => {
  const { user } = useAuth();

  // Core Data
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [upcomingPlans, setUpcomingPlans] = useState([]);
  const [badgesData, setBadgesData] = useState({ total_badges: 0, earned_count: 0, badges: [] });

  // Modals
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [
        dailyRes,
        weeklyRes,
        goalsRes,
        workoutsRes,
        streakRes,
        plansRes,
        badgesRes
      ] = await Promise.all([
        progressAPI.getDaily(),
        progressAPI.getWeekly(),
        goalsAPI.getAll(),
        workoutsAPI.getAll({ limit: 5 }),
        streakAPI.get(),
        plansAPI.getUpcoming(4),
        badgesAPI.getAll(),
      ]);

      setDailyData(dailyRes.data);
      setWeeklyData(weeklyRes.data);
      setGoals(goalsRes.data);
      setRecentWorkouts(workoutsRes.data);
      setStreakData(streakRes.data);
      setUpcomingPlans(plansRes.data);
      setBadgesData(badgesRes.data);
    } catch (err) {
      console.error("Failed to load personalized dashboard", err);
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

  const handleCreatePlan = async (planData) => {
    try {
      await plansAPI.create(planData);
      toast.success("Workout scheduled into planner!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed to schedule workout.");
      throw err;
    }
  };

  const handleCompleteUpcomingPlan = async (plan) => {
    try {
      await plansAPI.convert(plan.id, {
        category: "Cardio",
        duration: 30,
        calories_burned: 250.0,
      });
      toast.success(`Completed "${plan.title}"! Logged as workout.`);
      loadDashboardData();
    } catch (err) {
      toast.error("Failed to complete scheduled plan.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Completed</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">In Progress</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">Not Started</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner (Module 12) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-gray-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <Activity className="h-3.5 w-3.5" />
              <span>Personalized Athlete Dashboard • Phase 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-primary">{user?.username}</span>! 👋
            </h1>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              {streakData?.streak_active
                ? `🔥 Incredible discipline! Your ${streakData.current_streak}-day workout streak is active today.`
                : "🏃 Let's keep the momentum going. Record today's session to extend your streak!"}
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setWorkoutModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/30 transition flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Log Workout</span>
            </button>
            <button
              onClick={() => setPlanModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition flex items-center space-x-1.5"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Plan</span>
            </button>
            <Link
              to="/exercises"
              className="px-4 py-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700 transition flex items-center space-x-1.5"
            >
              <BookOpen className="h-4 w-4" />
              <span>Exercise Library</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Metrics & Streak Grid (4 StatCards) */}
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
          subtitle="Energy output today"
        />
        <StatCard
          title="Active Minutes"
          value={dailyData?.total_duration ?? 0}
          unit="minutes"
          icon={Clock}
          color="blue"
          subtitle="Total workout duration"
        />
        {/* Module 10: Streak Counter Card */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Daily Streak</span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Flame className="h-5 w-5 text-yellow-200 animate-pulse" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black">{streakData?.current_streak ?? 0}</span>
              <span className="text-xs font-bold uppercase text-orange-200">Days</span>
            </div>
            <p className="text-xs text-orange-100 mt-1">
              Record: {streakData?.longest_streak ?? 0} days
            </p>
          </div>
          <div className="pt-2 border-t border-white/20 text-[11px] font-semibold text-yellow-100 flex items-center justify-between">
            <span>{streakData?.streak_active ? "✓ Logged today" : "⚡ Workout needed"}</span>
            <span>Next: {streakData?.next_milestone || 3}d</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 8 Cols Left, 4 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming Workouts Section (Module 7 & 12) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Upcoming Workout Plans</h3>
                <p className="text-xs text-textMuted mt-0.5">Workouts scheduled in your calendar</p>
              </div>
              <Link
                to="/calendar"
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {upcomingPlans.length === 0 ? (
              <div className="py-8 text-center text-xs text-textMuted bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <CalendarCheck className="h-6 w-6 text-gray-300 mx-auto mb-1.5" />
                <p className="font-semibold text-gray-600">No workouts scheduled for the upcoming days.</p>
                <button
                  onClick={() => setPlanModalOpen(true)}
                  className="mt-2 text-primary font-bold hover:underline"
                >
                  + Schedule a workout plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {upcomingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between space-y-3 hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                          {plan.scheduled_date}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">Planned</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{plan.title}</h4>
                      {plan.description && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{plan.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCompleteUpcomingPlan(plan)}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Complete & Log</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Activity Bar Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Weekly Energy Expenditure</h3>
                <p className="text-xs text-textMuted mt-0.5">Calories burned over the rolling 7-day period</p>
              </div>
              <Link
                to="/progress"
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
              >
                <span>Comparison & Trends</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="h-60 w-full">
              {weeklyData?.daily_breakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData.daily_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                      formatter={(value) => [`${value} kcal`, "Calories Burned"]}
                    />
                    <Bar dataKey="calories" radius={[8, 8, 0, 0]} maxBarSize={36}>
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
                  No activity records for this period.
                </div>
              )}
            </div>
          </div>

          {/* Recent Workouts Log Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Completed Workouts</h3>
                <p className="text-xs text-textMuted mt-0.5">Your most recent exercise entries</p>
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
              <div className="py-8 text-center text-xs text-textMuted">
                No workouts logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-xl">Workout Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Burned</th>
                      <th className="py-2.5 px-3 rounded-r-xl">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {recentWorkouts.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-2.5 px-3 font-bold text-gray-900">{w.workout_name}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800">
                            {w.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-700">{w.duration}m</td>
                        <td className="py-2.5 px-3 text-gray-700 font-bold">{Math.round(w.calories_burned)} kcal</td>
                        <td className="py-2.5 px-3 text-gray-500">{w.workout_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Active Goals Progress Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Active Goals</h3>
                <p className="text-xs text-textMuted mt-0.5">Target milestones</p>
              </div>
              <Link
                to="/goals"
                className="text-xs font-bold text-secondary hover:text-secondary-dark flex items-center space-x-1"
              >
                <span>All Goals</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No active goals. Set a goal to stay focused!
                </div>
              ) : (
                goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">{goal.goal_type}</span>
                      {getStatusBadge(goal.status)}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-textMuted mb-2">
                      <span>Target: {goal.target_value}</span>
                      <span>{goal.current_value} ({goal.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-secondary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/goals"
              className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:text-primary hover:border-primary transition flex items-center justify-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Manage Goals</span>
            </Link>
          </div>

          {/* Achievement Badges Showcase Card (Module 11 & 12) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Milestone Badges</h3>
                <p className="text-xs text-textMuted mt-0.5">
                  {badgesData.earned_count} of {badgesData.total_badges} unlocked
                </p>
              </div>
              <Link
                to="/badges"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <span>Trophy Room</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Badges Grid Showcase */}
            <div className="grid grid-cols-3 gap-3">
              {badgesData.badges.slice(0, 6).map((badge) => {
                const Icon = iconMap[badge.icon] || Trophy;
                const isEarned = badge.earned;

                return (
                  <div
                    key={badge.id}
                    onClick={() => {
                      if (isEarned) {
                        setSelectedBadge(badge);
                        setBadgeModalOpen(true);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between ${
                      isEarned
                        ? "bg-amber-50/40 border-amber-200 hover:shadow-md cursor-pointer"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                    title={badge.name}
                  >
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center mb-1.5 ${
                        isEarned
                          ? "bg-gradient-to-tr from-amber-400 to-yellow-500 text-white shadow-sm shadow-amber-500/25"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-800 line-clamp-1">
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              to="/badges"
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold text-center shadow-md shadow-amber-500/20 hover:opacity-95 transition"
            >
              Explore All Achievements
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        onSave={handleCreateWorkout}
      />

      <PlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSave={handleCreatePlan}
      />

      <AchievementModal
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        badge={selectedBadge}
      />
    </div>
  );
};

export default Dashboard;
