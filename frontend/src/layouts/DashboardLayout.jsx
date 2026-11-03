import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI } from "../services/api";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Target,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Calendar,
  Flame,
  ChevronRight
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Workouts", path: "/workouts", icon: Dumbbell },
  { name: "Progress", path: "/progress", icon: TrendingUp },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Fetch unread notifications count
  const fetchNotifications = async () => {
    try {
      const countRes = await notificationsAPI.getUnreadCount();
      setUnreadCount(countRes.data.unread_count);

      const listRes = await notificationsAPI.getAll(5);
      setRecentNotifications(listRes.data);
    } catch (err) {
      console.error("Failed to fetch notification count", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll for realtime alert feel
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">FitTrack</span>
                <span className="block text-[10px] tracking-wider uppercase font-semibold text-primary">Pro Fitness</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25 font-semibold"
                      : "text-gray-300 hover:bg-gray-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.name === "Notifications" && unreadCount > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white text-primary" : "bg-primary text-white"
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout in Sidebar */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 mb-3">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-borderSubtle flex items-center justify-between px-4 sm:px-8 z-30 shrink-0">
          {/* Left section: Hamburger & Greeting */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-textMain hidden sm:block">
                Welcome back, <span className="text-primary">{user?.username || "Athlete"}</span>! 👋
              </h2>
              <div className="flex items-center text-xs text-textMuted sm:hidden font-medium">
                <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
                {currentDateFormatted}
              </div>
            </div>
          </div>

          {/* Right section: Date, Notification Dropdown & Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-xs font-semibold text-textMuted bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {currentDateFormatted}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:text-primary-dark font-medium transition"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {recentNotifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-textMuted">
                          No notifications yet. You're all caught up!
                        </div>
                      ) : (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start space-x-3 ${
                              !notif.is_read ? "bg-emerald-50/40" : ""
                            }`}
                            onClick={() => {
                              navigate("/notifications");
                              setDropdownOpen(false);
                            }}
                          >
                            <div className="h-2 w-2 rounded-full mt-2 shrink-0 bg-primary" style={{ opacity: notif.is_read ? 0 : 1 }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{notif.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="p-1 hover:text-primary text-gray-400"
                                title="Mark as read"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <Link
                      to="/notifications"
                      onClick={() => setDropdownOpen(false)}
                      className="block py-2.5 text-center text-xs font-bold text-primary hover:bg-emerald-50 border-t border-gray-100 transition"
                    >
                      View all notifications <ChevronRight className="inline h-3 w-3 ml-0.5" />
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <Link
              to="/settings"
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              title="Profile Settings"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs shadow-sm">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:inline">{user?.username}</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
