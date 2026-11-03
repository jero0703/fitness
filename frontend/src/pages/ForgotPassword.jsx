import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary items-center justify-center shadow-lg shadow-primary/25 mb-4">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-textMuted mt-1.5">
            Enter your registered email address to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 text-primary mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Request Sent</h3>
            <p className="text-xs text-textMuted mt-2 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, password reset instructions will be sent.
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 text-left border border-gray-100">
              <strong>Notice:</strong> FitTrack email delivery service requires an SMTP gateway configured in production. For testing or local access, please log in with your credentials or register a new local account.
            </div>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center space-x-2 text-sm font-bold text-primary hover:text-primary-dark transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Your Email Address
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
                  placeholder="alex@fittrack.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-800 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition duration-150 flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send Instructions</span>
            </button>

            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-textMuted hover:text-gray-900 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
