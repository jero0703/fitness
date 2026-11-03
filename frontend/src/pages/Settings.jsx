import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Shield,
  Bell,
  Sliders,
  LogOut,
  Database,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { toast } from "react-toastify";

const Settings = () => {
  const { user, logout } = useAuth();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);
  const [measurementUnit, setMeasurementUnit] = useState("metric");

  const handleSavePreferences = (e) => {
    e.preventDefault();
    toast.success("Preferences saved successfully!");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account & Settings</h1>
        <p className="text-xs text-textMuted mt-0.5">
          Manage your personal profile, alert preferences, and app options
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderSubtle shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-extrabold text-2xl text-white shadow-lg shadow-primary/25 shrink-0">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.username}</h2>
            <p className="text-xs text-textMuted mt-0.5 flex items-center space-x-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{user?.email}</span>
            </p>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-primary border border-emerald-100">
              <CheckCircle2 className="h-3 w-3" />
              <span>Active FitTrack Athlete</span>
            </div>
          </div>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-6 pt-4 sm:pt-0 text-xs text-textMuted space-y-1">
          <p className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}</span>
          </p>
          <p className="flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5 text-gray-400" />
            <span>Auth: JWT Bearer Token</span>
          </p>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderSubtle shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Notification Preferences</h3>
            <p className="text-xs text-textMuted mt-0.5">Configure when and how you receive alerts</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">Daily Workout Reminders</p>
              <p className="text-[11px] text-textMuted mt-0.5">
                Receive notifications when you haven't recorded a workout for the day
              </p>
            </div>
            <input
              type="checkbox"
              checked={dailyReminder}
              onChange={(e) => setDailyReminder(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">Goal Milestone & Deadline Alerts</p>
              <p className="text-[11px] text-textMuted mt-0.5">
                Alerts when fitness goals are completed or approaching their deadline
              </p>
            </div>
            <input
              type="checkbox"
              checked={goalAlerts}
              onChange={(e) => setGoalAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">Measurement Standard</p>
              <p className="text-[11px] text-textMuted mt-0.5">Select preferred units of measurement</p>
            </div>
            <select
              value={measurementUnit}
              onChange={(e) => setMeasurementUnit(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white"
            >
              <option value="metric">Metric (kg, km, kcal)</option>
              <option value="imperial">Imperial (lbs, miles, kcal)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Backend & Database Connection Diagnostics */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderSubtle shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-teal-50 text-secondary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">System Information</h3>
            <p className="text-xs text-textMuted mt-0.5">Connected backend services and configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 font-semibold block">Backend API URL</span>
            <span className="font-bold text-gray-800">http://127.0.0.1:8000</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 font-semibold block">Target Database</span>
            <span className="font-bold text-gray-800">MySQL (fittrack_db)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 font-semibold block">API Documentation</span>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-primary hover:underline"
            >
              http://127.0.0.1:8000/docs
            </a>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 font-semibold block">Security Standard</span>
            <span className="font-bold text-gray-800">Bcrypt + JWT (HS256)</span>
          </div>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
