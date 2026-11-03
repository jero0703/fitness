import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Flame, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const registeredEmail = location.state?.registeredEmail || "";
  const registrationSuccess = location.state?.registrationSuccess || false;
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Update email if redirected from register
  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemo = () => {
    setEmail("alex@fittrack.com");
    setPassword("Secret123!");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary items-center justify-center shadow-lg shadow-primary/25 mb-4">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome to FitTrack
          </h1>
          <p className="text-sm text-textMuted mt-1.5">
            Log in to manage your workouts, track progress & goals
          </p>
        </div>

        {/* Successful Registration Banner */}
        {registrationSuccess && (
          <div className="mb-6 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center space-x-3 text-emerald-800 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Account created successfully!</span> Please enter your password to sign in to your dashboard.
            </div>
          </div>
        )}

        {/* Demo Account Quick Fill Pill (shown if not redirected from fresh registration) */}
        {!registrationSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div className="text-xs text-emerald-800">
              <span className="font-bold">Testing out?</span> Click to auto-fill sample credentials.
            </div>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition shrink-0"
            >
              Auto Fill
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-dark transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus={!!registrationSuccess}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition duration-150 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Sign In to FitTrack</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-textMuted">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
