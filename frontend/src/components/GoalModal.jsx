import React, { useState, useEffect } from "react";
import { X, Target } from "lucide-react";
import { toast } from "react-toastify";

const goalTypes = [
  { label: "Weight Loss (kg/lbs)", value: "Weight Loss" },
  { label: "Muscle Gain (kg/lbs)", value: "Muscle Gain" },
  { label: "Daily Steps (steps)", value: "Steps" },
  { label: "Running Distance (km)", value: "Running" },
  { label: "Cycling Distance (km)", value: "Cycling" },
  { label: "Weekly Workouts (count)", value: "Workouts" },
  { label: "Calories Burn Target (kcal)", value: "Calorie Burn" },
];

const GoalModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    goal_type: "Weight Loss",
    target_value: 5,
    current_value: 0,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        goal_type: initialData.goal_type || "Weight Loss",
        target_value: initialData.target_value || 5,
        current_value: initialData.current_value || 0,
        deadline: initialData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        goal_type: "Weight Loss",
        target_value: 5,
        current_value: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "target_value" || name === "current_value" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.target_value <= 0) {
      toast.error("Target value must be greater than 0.");
      return;
    }
    if (formData.current_value < 0) {
      toast.error("Current value cannot be negative.");
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
            <div className="p-2.5 rounded-xl bg-teal-50 text-secondary border border-teal-100">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {initialData ? "Edit Fitness Goal" : "Set New Fitness Goal"}
              </h3>
              <p className="text-xs text-textMuted">Stay focused and track milestones</p>
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
              Goal Type
            </label>
            <select
              name="goal_type"
              value={formData.goal_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm font-medium text-gray-800 bg-white"
            >
              {goalTypes.map((gt) => (
                <option key={gt.value} value={gt.value}>
                  {gt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Value
              </label>
              <input
                type="number"
                name="target_value"
                step="any"
                min="0.1"
                required
                value={formData.target_value}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm font-medium text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Current Value
              </label>
              <input
                type="number"
                name="current_value"
                step="any"
                min="0"
                required
                value={formData.current_value}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm font-medium text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Target Completion Deadline
            </label>
            <input
              type="date"
              name="deadline"
              required
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm font-medium text-gray-800"
            />
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
              className="px-5 py-2.5 text-sm font-semibold text-white bg-secondary hover:bg-secondary-hover rounded-xl shadow-md shadow-secondary/25 transition"
            >
              {submitting ? "Saving..." : initialData ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
