import React, { useState, useEffect } from "react";
import { exercisesAPI, workoutsAPI, plansAPI } from "../services/api";
import WorkoutModal from "../components/WorkoutModal";
import PlanModal from "../components/PlanModal";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Clock,
  Flame,
  Dumbbell,
  Calendar,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";
import { toast } from "react-toastify";

const categories = ["All", "Cardio", "Strength", "Yoga", "HIIT", "Pilates"];

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Action Modals
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [prefilledWorkout, setPrefilledWorkout] = useState(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [prefilledPlan, setPrefilledPlan] = useState(null);

  // Custom Exercise Modal
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "",
    category: "Cardio",
    duration: 30,
    calories_burned: 200,
    difficulty: "Intermediate",
    description: "",
  });

  const loadExercises = async () => {
    try {
      setLoading(true);
      const res = await exercisesAPI.getAll({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        limit: 100,
      });
      setExercises(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exercise library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadExercises();
  };

  const handleLogWorkout = (exercise) => {
    setPrefilledWorkout({
      workout_name: exercise.name,
      category: exercise.category,
      duration: exercise.duration,
      calories_burned: exercise.calories_burned || Math.round(exercise.duration * 8),
      workout_date: new Date().toISOString().split("T")[0],
    });
    setWorkoutModalOpen(true);
  };

  const handleSchedulePlan = (exercise) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPrefilledPlan({
      title: exercise.name,
      description: `${exercise.category} session • ${exercise.duration} mins • ${exercise.description || ""}`,
      scheduled_date: tomorrow.toISOString().split("T")[0],
      status: "PLANNED",
    });
    setPlanModalOpen(true);
  };

  const handleSaveWorkout = async (data) => {
    await workoutsAPI.create(data);
    toast.success(`Recorded workout: "${data.workout_name}"!`);
  };

  const handleSavePlan = async (data) => {
    await plansAPI.create(data);
    toast.success(`Scheduled plan: "${data.title}"!`);
  };

  const handleCreateCustomExercise = async (e) => {
    e.preventDefault();
    try {
      await exercisesAPI.create(customForm);
      toast.success("New exercise added to library!");
      setCustomModalOpen(false);
      setCustomForm({
        name: "",
        category: "Cardio",
        duration: 30,
        calories_burned: 200,
        difficulty: "Intermediate",
        description: "",
      });
      loadExercises();
    } catch (err) {
      toast.error("Failed to create custom exercise.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-3 border border-teal-500/30">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Module 8 • Predefined Exercise Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Predefined Exercise Library
            </h1>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Browse curated workouts across Cardio, Strength, Yoga, and HIIT. Quickly log them to your workouts or schedule them into your calendar.
            </p>
          </div>
          <div>
            <button
              onClick={() => setCustomModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-secondary hover:bg-secondary-hover text-white text-sm font-bold shadow-lg shadow-secondary/30 transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Exercise</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-borderSubtle shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise or target..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          </form>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-textMuted font-medium">
          Loading exercise catalog...
        </div>
      ) : exercises.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gray-100">
          <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No exercises found</p>
          <p className="text-xs text-textMuted mt-1">Try searching for a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-white rounded-3xl p-6 border border-borderSubtle shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Category & Difficulty Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {ex.category}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {ex.difficulty || "Intermediate"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {ex.name}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                  {ex.description || "Standard structured movement routine."}
                </p>

                {/* Duration & Calories Badges */}
                <div className="flex items-center space-x-3 mb-5">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{ex.duration} mins</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-xs font-bold text-orange-800">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span>~{Math.round(ex.calories_burned || ex.duration * 8)} kcal</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLogWorkout(ex)}
                  className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-primary/20"
                >
                  <Dumbbell className="h-3.5 w-3.5" />
                  <span>Log Workout</span>
                </button>
                <button
                  onClick={() => handleSchedulePlan(ex)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:border-secondary hover:text-secondary text-gray-700 text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Workout Modal */}
      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        onSave={handleSaveWorkout}
        initialData={prefilledWorkout}
      />

      {/* Schedule Plan Modal */}
      <PlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSave={handleSavePlan}
        initialData={prefilledPlan}
      />

      {/* Custom Exercise Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add Custom Exercise</h3>
              <button onClick={() => setCustomModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateCustomExercise} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Exercise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kettlebell Halo"
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={customForm.duration}
                    onChange={(e) => setCustomForm({ ...customForm, duration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Instructions / Description</label>
                <textarea
                  rows={3}
                  placeholder="Steps, technique notes, and target muscle groups..."
                  value={customForm.description}
                  onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl resize-none"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-secondary text-white font-bold rounded-xl shadow-md"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
