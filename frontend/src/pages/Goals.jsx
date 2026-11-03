import React, { useState, useEffect } from "react";
import { goalsAPI } from "../services/api";
import GoalModal from "../components/GoalModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  Award,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { toast } from "react-toastify";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalsAPI.getAll();
      setGoals(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSaveGoal = async (formData) => {
    if (editingGoal) {
      await goalsAPI.update(editingGoal.id, formData);
      toast.success("Goal updated successfully!");
    } else {
      await goalsAPI.create(formData);
      toast.success("Goal created successfully!");
    }
    fetchGoals();
  };

  const handleQuickAddProgress = async (goal, increment) => {
    try {
      const updatedVal = Math.max(0, Number((goal.current_value + increment).toFixed(1)));
      await goalsAPI.update(goal.id, { current_value: updatedVal });
      fetchGoals();
      if (updatedVal >= goal.target_value) {
        toast.success(`🎉 You completed the ${goal.goal_type} goal!`);
      } else {
        toast.info(`Updated progress to ${updatedVal}/${goal.target_value}`);
      }
    } catch (err) {
      toast.error("Failed to update progress.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    setDeleting(true);
    try {
      await goalsAPI.delete(goalToDelete.id);
      toast.success("Goal deleted successfully.");
      setDeleteModalOpen(false);
      setGoalToDelete(null);
      fetchGoals();
    } catch (err) {
      toast.error("Failed to delete goal.");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (goal) => {
    switch (goal.status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3" />
            <span>Overdue</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
            <Clock className="h-3 w-3" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            <span>Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fitness Goals</h1>
          <p className="text-xs text-textMuted mt-0.5">
            Set ambitious targets, track milestones, and celebrate achievements
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover text-white text-xs font-bold shadow-md shadow-secondary/25 transition flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-borderSubtle">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
          <p className="text-xs text-textMuted">Loading fitness goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-borderSubtle p-8">
          <div className="p-4 bg-teal-50 text-secondary rounded-2xl inline-flex mb-3">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No fitness goals yet</h3>
          <p className="text-xs text-textMuted mt-1 max-w-sm mx-auto">
            Setting clear targets like weight loss, weekly workouts, or steps boosts consistency.
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setModalOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-secondary text-white text-xs font-bold rounded-xl hover:bg-secondary-hover shadow-sm transition"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-3xl p-6 border border-borderSubtle shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-teal-50 text-secondary border border-teal-100">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{goal.goal_type}</h3>
                      <p className="text-[11px] text-gray-400">Created: {new Date(goal.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {getStatusBadge(goal)}
                </div>

                {/* Target vs Current Numbers */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-4 text-center">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Target</span>
                    <span className="text-base font-extrabold text-gray-900">{goal.target_value}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Current</span>
                    <span className="text-base font-extrabold text-secondary">{goal.current_value}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-600">Completion</span>
                    <span className="text-secondary">{goal.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        goal.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : goal.status === "OVERDUE"
                          ? "bg-red-500"
                          : "bg-secondary"
                      }`}
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Add Progress Bar */}
                {goal.status !== "COMPLETED" && (
                  <div className="flex items-center space-x-2 py-2 border-t border-b border-gray-100 mb-4">
                    <span className="text-[11px] font-semibold text-gray-500">Quick adjust:</span>
                    <button
                      onClick={() => handleQuickAddProgress(goal, -1)}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                      title="Decrease by 1"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleQuickAddProgress(goal, 1)}
                      className="px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-xs font-bold text-secondary"
                      title="Add 1"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleQuickAddProgress(goal, 5)}
                      className="px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-xs font-bold text-secondary"
                      title="Add 5"
                    >
                      +5
                    </button>
                  </div>
                )}
              </div>

              {/* Footer info & actions */}
              <div className="pt-2 flex items-center justify-between text-xs text-textMuted">
                <div className="flex items-center space-x-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>Due: {goal.deadline}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    title="Edit Goal"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setGoalToDelete(goal);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Create/Edit Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Fitness Goal"
        message={`Are you sure you want to delete your goal "${goalToDelete?.goal_type}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setGoalToDelete(null);
        }}
        loading={deleting}
      />
    </div>
  );
};

export default Goals;
