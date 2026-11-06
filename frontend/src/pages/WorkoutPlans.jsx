import React, { useState, useEffect } from "react";
import { plansAPI, workoutsAPI } from "../services/api";
import PlanModal from "../components/PlanModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Dumbbell,
  Trash2,
  Edit,
  ArrowRight,
  Filter
} from "lucide-react";
import { toast } from "react-toastify";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Modal State
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // Status Filter for List
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PLANNED, COMPLETED

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, workoutsRes] = await Promise.all([
        plansAPI.getAll({ limit: 200 }),
        workoutsAPI.getAll({ limit: 200 }),
      ]);
      setPlans(plansRes.data);
      setWorkouts(workoutsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load workout plans and calendar data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePlan = async (planData) => {
    try {
      if (editingPlan) {
        await plansAPI.update(editingPlan.id, planData);
        toast.success("Workout plan updated successfully!");
      } else {
        await plansAPI.create(planData);
        toast.success("Workout plan scheduled successfully!");
      }
      loadData();
    } catch (err) {
      toast.error("Failed to save workout plan.");
      throw err;
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      await plansAPI.delete(planToDelete.id);
      toast.success("Workout plan removed.");
      setDeleteModalOpen(false);
      setPlanToDelete(null);
      loadData();
    } catch (err) {
      toast.error("Failed to delete workout plan.");
    }
  };

  const handleConvertToWorkout = async (plan) => {
    try {
      await plansAPI.convert(plan.id, {
        category: "Cardio",
        duration: 30,
        calories_burned: 250.0,
      });
      toast.success(`Completed "${plan.title}"! Logged as completed workout.`);
      loadData();
    } catch (err) {
      toast.error("Failed to convert plan to workout.");
    }
  };

  // Calendar helper computations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
  };

  // Build calendar matrix
  const calendarDays = [];
  // Pad previous month days
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      dateStr: null,
      dayNum: prevMonthDaysCount - i,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      dateStr: formattedDate,
      dayNum: d,
      isCurrentMonth: true,
    });
  }
  // Pad next month days to complete 35 or 42 grid
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      dateStr: null,
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  // Filter plans based on selected tab/filter
  const filteredPlans = plans.filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  });

  // Plans and workouts on selected date
  const selectedDatePlans = plans.filter((p) => p.scheduled_date === selectedDate);
  const selectedDateWorkouts = workouts.filter((w) => w.workout_date === selectedDate);

  const monthLabel = currentMonthDate.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Module 7 • Workout Plans & Scheduling</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Workout Planner & Calendar
            </h1>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Organize upcoming workout sessions in advance, schedule rest days, and visualize your weekly training schedule.
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                setEditingPlan(null);
                setPlanModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/30 transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule New Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar View on Left, Daily Details & Upcoming on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Calendar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm flex flex-col justify-between">
          <div>
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{monthLabel}</h3>
                <p className="text-xs text-textMuted">Click on any date to inspect or schedule plans</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Today
                </button>
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {daysOfWeek.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[64px] sm:min-h-[76px] p-1.5 rounded-2xl bg-gray-50/50 text-gray-300 text-xs font-semibold select-none"
                    >
                      <span>{cell.dayNum}</span>
                    </div>
                  );
                }

                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDate;
                const dayPlans = plans.filter((p) => p.scheduled_date === cell.dateStr);
                const dayWorkouts = workouts.filter((w) => w.workout_date === cell.dateStr);

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`group relative min-h-[64px] sm:min-h-[76px] p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-50/80 border-primary shadow-sm ring-2 ring-primary/20"
                        : isToday
                        ? "bg-teal-50/40 border-teal-300"
                        : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-primary font-black"
                            : isToday
                            ? "text-teal-700 font-extrabold"
                            : "text-gray-700"
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                      {isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" title="Today" />
                      )}
                    </div>

                    {/* Indicator dots / pills */}
                    <div className="mt-1 space-y-1">
                      {dayPlans.length > 0 && (
                        <div
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate ${
                            dayPlans[0].status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-teal-100 text-teal-800"
                          }`}
                          title={dayPlans.map((p) => p.title).join(", ")}
                        >
                          📋 {dayPlans.length} plan{dayPlans.length > 1 ? "s" : ""}
                        </div>
                      )}
                      {dayWorkouts.length > 0 && (
                        <div
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 truncate"
                          title={dayWorkouts.map((w) => w.workout_name).join(", ")}
                        >
                          💪 {dayWorkouts.length} done
                        </div>
                      )}
                    </div>

                    {/* Quick Add on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(cell.dateStr);
                        setEditingPlan(null);
                        setPlanModalOpen(true);
                      }}
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-primary text-white rounded-lg shadow transition"
                      title="Schedule on this date"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-textMuted">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span>Planned</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Completed</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Logged Workout</span>
              </span>
            </div>
            <span className="font-semibold text-gray-700">Selected: {selectedDate}</span>
          </div>
        </div>

        {/* Right Column: Day Focus & Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Date Focus Card */}
          <div className="bg-white rounded-3xl p-6 border border-borderSubtle shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Day Focus</span>
                <h4 className="text-base font-bold text-gray-900">{selectedDate}</h4>
              </div>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setPlanModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Plan</span>
              </button>
            </div>

            {/* Plans on this day */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scheduled Workouts</h5>
              {selectedDatePlans.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No workouts scheduled for this date.
                </div>
              ) : (
                selectedDatePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h6 className="text-sm font-bold text-gray-900">{plan.title}</h6>
                        {plan.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{plan.description}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plan.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                      {plan.status !== "COMPLETED" ? (
                        <button
                          onClick={() => handleConvertToWorkout(plan)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mark Done & Log</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Completed</span>
                        </span>
                      )}

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingPlan(plan);
                            setPlanModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPlanToDelete(plan);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Logged workouts on this day */}
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">Recorded Workouts</h5>
              {selectedDateWorkouts.length === 0 ? (
                <div className="py-3 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No completed workouts logged on this date.
                </div>
              ) : (
                selectedDateWorkouts.map((w) => (
                  <div key={w.id} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                        <Dumbbell className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{w.workout_name}</span>
                        <span className="text-gray-500 text-[11px]">{w.category} • {w.duration} mins</span>
                      </div>
                    </div>
                    <span className="font-bold text-amber-900">{Math.round(w.calories_burned)} kcal</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming & All Workout Plans Table Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">All Scheduled Plans</h3>
            <p className="text-xs text-textMuted mt-0.5">Filter by status or convert plans into completed workouts</p>
          </div>
          <div className="flex items-center space-x-2">
            {["ALL", "PLANNED", "COMPLETED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "ALL" ? "All Plans" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="py-12 text-center text-xs text-textMuted">
            No workout plans match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Workout Plan</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredPlans.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>
                        <span>{p.title}</span>
                        {p.description && (
                          <p className="text-[11px] text-gray-500 font-normal line-clamp-1">{p.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-semibold">{p.scheduled_date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {p.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleConvertToWorkout(p)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Complete</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingPlan(p);
                          setPlanModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg"
                        title="Edit Plan"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setPlanToDelete(p);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg"
                        title="Delete Plan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <PlanModal
        isOpen={planModalOpen}
        onClose={() => {
          setPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        initialData={editingPlan}
        selectedDate={selectedDate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPlanToDelete(null);
        }}
        onConfirm={handleDeletePlan}
        title="Delete Workout Plan"
        message={`Are you sure you want to remove "${planToDelete?.title}"?`}
      />
    </div>
  );
};

export default WorkoutPlans;
