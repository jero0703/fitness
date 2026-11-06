import React from "react";
import { X, Award, Trophy, Flame, Zap, Target, Star, CheckCircle2, Footprints, Dumbbell, Crown, ShieldCheck } from "lucide-react";

const iconMap = {
  Footprints,
  Dumbbell,
  Trophy,
  Crown,
  Flame,
  Zap,
  ShieldCheck,
  Target,
  CheckCircle2,
  Award,
  Star,
};

const AchievementModal = ({ isOpen, onClose, badge }) => {
  if (!isOpen || !badge) return null;

  const IconComponent = iconMap[badge.icon] || Trophy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden text-center p-7 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Glowing Badge Avatar */}
        <div className="relative mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-xl shadow-amber-500/30 flex items-center justify-center text-white ring-4 ring-amber-100">
            <IconComponent className="h-10 w-10 text-white drop-shadow-md" />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-wider border border-amber-200 mb-2">
          Milestone Unlocked! 🎉
        </span>

        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {badge.name}
        </h3>

        <p className="mt-2 text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
          {badge.description}
        </p>

        <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-around text-xs">
          <div>
            <span className="block text-[10px] text-gray-400 font-semibold uppercase">Category</span>
            <span className="font-bold text-gray-800">{badge.category || "Milestone"}</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <span className="block text-[10px] text-gray-400 font-semibold uppercase">Target</span>
            <span className="font-bold text-primary">{badge.criteria_threshold || badge.target}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 transition"
        >
          Awesome! Keep Moving
        </button>
      </div>
    </div>
  );
};

export default AchievementModal;
