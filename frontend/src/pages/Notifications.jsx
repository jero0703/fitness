import React, { useState, useEffect } from "react";
import { notificationsAPI } from "../services/api";
import {
  Bell,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Sparkles,
  Calendar,
  AlertCircle,
  Inbox
} from "lucide-react";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      toast.info("Marked as read.");
    } catch (err) {
      toast.error("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error("Failed to update notifications.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.info("Notification removed.");
    } catch (err) {
      toast.error("Failed to delete notification.");
    }
  };

  const handleTriggerReminders = async () => {
    try {
      const res = await notificationsAPI.triggerReminders();
      toast.success(res.data.message || "Reminders checked!");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to trigger reminder check.");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-textMuted mt-0.5">
            Workout reminders, milestone alerts, and goal updates
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleTriggerReminders}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-primary text-xs font-bold rounded-xl transition flex items-center space-x-1.5 border border-emerald-100 shadow-sm"
            title="Check daily workout reminder and goal alerts"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simulate Reminders</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filter === "all"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-textMuted hover:text-gray-900"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            filter === "unread"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-textMuted hover:text-gray-900"
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-borderSubtle">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-textMuted">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-borderSubtle p-8">
          <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl inline-flex mb-3">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No notifications</h3>
          <p className="text-xs text-textMuted mt-1 max-w-sm mx-auto">
            {filter === "unread"
              ? "You have read all your notifications!"
              : "You haven't received any notifications yet. Workouts and goal events will trigger alerts here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between space-x-4 ${
                !notif.is_read
                  ? "bg-white border-primary/30 shadow-sm ring-1 ring-primary/20"
                  : "bg-white/80 border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    !notif.is_read
                      ? "bg-emerald-50 text-primary border border-emerald-100"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(notif.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1 shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-emerald-50 transition"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
