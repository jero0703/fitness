import React, { useState, useEffect } from "react";
import { X, Calendar, CheckCircle2 } from "lucide-react";

const PlanModal = ({ isOpen, onClose, onSave, initialData = null, selectedDate = null }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState("PLANNED");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setScheduledDate(initialData.scheduled_date || "");
      setStatus(initialData.status || "PLANNED");
    } else {
      setTitle("");
      setDescription("");
      if (selectedDate) {
        setScheduledDate(selectedDate);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduledDate(tomorrow.toISOString().split("T")[0]);
      }
      setStatus("PLANNED");
    }
    setError("");
  }, [initialData, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a workout title.");
      return;
    }
    if (!scheduledDate) {
      setError("Please pick a scheduled date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        scheduled_date: scheduledDate,
        status: status || "PLANNED",
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to save workout plan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center space-x-2.5">
            <Calendar className="h-5 w-5" />
            <h3 className="text-base font-bold">
              {initialData ? "Edit Workout Plan" : "Schedule Workout Plan"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Workout Title *
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5K Speed Intervals, Chest & Triceps"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Scheduled Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description / Planned Exercises
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Warm up 5 mins, 4x 800m at race pace, cool down walk"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition resize-none"
            />
          </div>

          {initialData && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              >
                <option value="PLANNED">Planned</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{submitting ? "Saving..." : initialData ? "Save Changes" : "Schedule Workout"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
