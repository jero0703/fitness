import React, { useState, useEffect } from "react";
import { X, Dumbbell, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

const categories = [
  "Cardio",
  "Strength",
  "Yoga",
  "HIIT",
  "Pilates",
  "Running",
  "Cycling",
  "Swimming",
  "Other"
];

// Rough calorie burn multipliers per minute for quick estimation
const calorieMultipliers = {
  Cardio: 9.5,
  Strength: 7.0,
  Yoga: 4.5,
  HIIT: 12.0,
  Pilates: 5.5,
  Running: 11.5,
  Cycling: 8.5,
  Swimming: 10.0,
  Other: 6.0
};

const WorkoutModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    workout_name: "",
    category: "Cardio",
    duration: 30,
    calories_burned: 250,
    workout_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        workout_name: initialData.workout_name || "",
        category: initialData.category || "Cardio",
        duration: initialData.duration || 30,
        calories_burned: initialData.calories_burned || 200,
        workout_date: initialData.workout_date || new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        workout_name: "",
        category: "Cardio",
        duration: 30,
        calories_burned: 250,
        workout_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "calories_burned" ? Number(value) : value,
    }));
  };

  const handleEstimateCalories = () => {
    const rate = calorieMultipliers[formData.category] || 7.0;
    const dur = Number(formData.duration) || 30;
    const estimated = Math.round(dur * rate);
    setFormData((prev) => ({ ...prev, calories_burned: estimated }));
    toast.info(`Estimated ${estimated} kcal based on ${formData.category} intensity.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workout_name.trim()) {
      toast.error("Please enter a workout name.");
      return;
    }
    if (formData.duration <= 0) {
      toast.error("Workout duration must be greater than 0 minutes.");
      return;
    }
    if (formData.calories_burned < 0) {
      toast.error("Calories burned cannot be negative.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary-light text-primary">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {initialData ? "Edit Workout" : "Log New Workout"}
              </h3>
              <p className="text-xs text-textMuted">Record your exercises and calorie burn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Workout Name
            </label>
            <input
              type="text"
              name="workout_name"
              required
              placeholder="e.g. Morning 5K Outdoor Run"
              value={formData.workout_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Workout Date
              </label>
              <input
                type="date"
                name="workout_date"
                required
                value={formData.workout_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                min="1"
                max="1440"
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Calories (kcal)
                </label>
                <button
                  type="button"
                  onClick={handleEstimateCalories}
                  className="text-[11px] font-semibold text-primary hover:text-primary-dark flex items-center space-x-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Estimate</span>
                </button>
              </div>
              <input
                type="number"
                name="calories_burned"
                min="0"
                step="0.5"
                required
                value={formData.calories_burned}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/25 transition"
            >
              {submitting ? "Saving..." : initialData ? "Update Workout" : "Save Workout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutModal;
