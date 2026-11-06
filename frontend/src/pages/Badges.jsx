import React, { useState, useEffect } from "react";
import { badgesAPI } from "../services/api";
import AchievementModal from "../components/AchievementModal";
import {
  Award,
  Trophy,
  Flame,
  Zap,
  Target,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Crown,
  Dumbbell,
  Footprints,
  Medal,
  Hand
} from "lucide-react";
import { toast } from "react-toastify";

const iconMap = {
  Footprints,
  Hand,
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

const badgeCategories = ["All", "Workouts", "Streaks", "Goals", "Calories"];

const Badges = () => {
  const [badgesData, setBadgesData] = useState({ total_badges: 0, earned_count: 0, badges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Selected Badge for Popup
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const res = await badgesAPI.getAll();
      setBadgesData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load achievement badges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const handleSyncBadges = async () => {
    try {
      const res = await badgesAPI.check();
      if (res.data && res.data.length > 0) {
        toast.success(`🎉 You unlocked ${res.data.length} new badge${res.data.length > 1 ? "s" : ""}!`);
        setSelectedBadge(res.data[0]);
        setModalOpen(true);
      } else {
        toast.info("Badges up to date! Keep working out to unlock more.");
      }
      loadBadges();
    } catch {
      toast.error("Failed to check achievement milestones.");
    }
  };

  const filteredBadges = badgesData.badges.filter((b) => {
    if (selectedCategory === "All") return true;
    return b.category === selectedCategory;
  });

  const completionPct = badgesData.total_badges > 0
    ? Math.round((badgesData.earned_count / badgesData.total_badges) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-slate-900 to-yellow-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
              <Trophy className="h-3.5 w-3.5" />
              <span>Module 11 • Achievement Badges & Milestones</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trophy Room & Achievements
            </h1>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Earn distinctive badges for workout volume, maintaining daily streaks, completing ambitious goals, and torching calories.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleSyncBadges}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 transition flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Check Milestones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Milestone Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-borderSubtle shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Your Badge Collection</h3>
            <p className="text-xs text-textMuted mt-0.5">
              Unlocked {badgesData.earned_count} of {badgesData.total_badges} achievements ({completionPct}%)
            </p>
          </div>
          <span className="text-sm font-black text-amber-600">
            {completionPct}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-3 rounded-full transition-all duration-700 shadow-sm shadow-amber-500/20"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
          {badgeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-textMuted font-medium">
          Loading achievement records...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => {
            const Icon = iconMap[badge.icon] || Trophy;
            const isEarned = badge.earned;
            const progressPct = Math.round((badge.progress / badge.target) * 100);

            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (isEarned) {
                    setSelectedBadge(badge);
                    setModalOpen(true);
                  }
                }}
                className={`relative rounded-3xl p-6 border transition flex flex-col justify-between ${
                  isEarned
                    ? "bg-gradient-to-b from-white to-amber-50/30 border-amber-200 shadow-sm hover:shadow-md cursor-pointer hover:border-amber-400"
                    : "bg-gray-50/70 border-gray-200 opacity-80"
                }`}
              >
                <div>
                  {/* Top Pill & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isEarned
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {badge.category}
                    </span>
                    {isEarned ? (
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-gray-400">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  {/* Badge Avatar */}
                  <div className="flex items-center justify-center my-3">
                    <div
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transition ${
                        isEarned
                          ? "bg-gradient-to-tr from-amber-400 to-yellow-500 text-white shadow-amber-500/25 ring-4 ring-amber-100"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Badge Title & Description */}
                  <h4 className="text-sm font-bold text-gray-900 text-center mb-1">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-500 text-center leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {/* Bottom Progress or Unlock Date */}
                <div className="mt-5 pt-3 border-t border-gray-100">
                  {isEarned ? (
                    <div className="text-center text-[11px] text-amber-800 font-semibold">
                      Unlocked on {badge.earned_at ? new Date(badge.earned_at).toLocaleDateString() : "Milestone Achieved"}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-1">
                        <span>Progress</span>
                        <span>{badge.progress} / {badge.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, progressPct)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Achievement Popup Modal */}
      <AchievementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        badge={selectedBadge}
      />
    </div>
  );
};

export default Badges;
