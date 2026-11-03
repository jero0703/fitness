import React, { useState, useEffect } from "react";
import { workoutsAPI } from "../services/api";
import WorkoutModal from "../components/WorkoutModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  Flame,
  Clock,
  ArrowUpDown
} from "lucide-react";
import { toast } from "react-toastify";

const categories = [
  "All",
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

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await workoutsAPI.getAll(params);
      setWorkouts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load workout logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [selectedCategory, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkouts();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setStartDate("");
    setEndDate("");
  };

  const handleSaveWorkout = async (formData) => {
    if (editingWorkout) {
      await workoutsAPI.update(editingWorkout.id, formData);
      toast.success("Workout updated successfully!");
    } else {
      await workoutsAPI.create(formData);
      toast.success("Workout created successfully!");
    }
    fetchWorkouts();
  };

  const handleOpenEdit = (workout) => {
    setEditingWorkout(workout);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingWorkout(null);
    setModalOpen(true);
  };

  const handleOpenDelete = (workout) => {
    setWorkoutToDelete(workout);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workoutToDelete) return;
    setDeleting(true);
    try {
      await workoutsAPI.delete(workoutToDelete.id);
      toast.success("Workout deleted successfully.");
      setDeleteModalOpen(false);
      setWorkoutToDelete(null);
      fetchWorkouts();
    } catch (err) {
      toast.error("Failed to delete workout.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Workout Management</h1>
          <p className="text-xs text-textMuted mt-0.5">
            Log, filter, and review all your exercise records
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 transition flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Log New Workout</span>
        </button>
      </div>

      {/* Filters and Search Bar Card */}
      <div className="bg-white rounded-2xl p-5 border border-borderSubtle shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search by name */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by workout name (e.g., Morning Run)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-gray-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center space-x-1.5">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start Date"
                className="py-2 px-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End Date"
                className="py-2 px-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
            >
              Filter
            </button>
            {(search || selectedCategory !== "All" || startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Workouts List / Table */}
      <div className="bg-white rounded-3xl border border-borderSubtle shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs text-textMuted">Loading workouts...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="p-4 bg-emerald-50 text-primary rounded-2xl inline-flex mb-3">
              <Dumbbell className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No workouts found</h3>
            <p className="text-xs text-textMuted mt-1 max-w-sm mx-auto">
              {search || selectedCategory !== "All" || startDate
                ? "No workouts matched your search or filters. Try adjusting your parameters."
                : "You haven't recorded any workouts yet. Click below to add your first one!"}
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition"
            >
              Log New Workout
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-6">Workout Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Calories Burned</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {workouts.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/60 transition group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-primary shrink-0 group-hover:scale-105 transition-transform">
                          <Dumbbell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{w.workout_name}</p>
                          <p className="text-[11px] text-gray-400">ID: #{w.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-secondary border border-teal-100">
                        {w.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{w.duration} mins</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5 font-bold text-gray-800">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span>{Math.round(w.calories_burned)} kcal</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-medium">
                      {w.workout_date}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                          title="Edit Workout"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(w)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Workout"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Workout Create / Edit Modal */}
      <WorkoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveWorkout}
        initialData={editingWorkout}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Workout"
        message={`Are you sure you want to delete "${workoutToDelete?.workout_name}"? This will also update your daily progress records.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setWorkoutToDelete(null);
        }}
        loading={deleting}
      />
    </div>
  );
};

export default Workouts;
