"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, Mail, Sparkles, ArrowRight, User, Phone, Briefcase } from "lucide-react";

export default function SignupPage() {
  const { user, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
          organizationName: organizationName || undefined,
          password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Registration failed. Please try again.");
      }

      // Success! Redirect to login with query param
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Unable to complete registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || (user && !submitting)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] py-24 px-4">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/5 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass-light px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={14} className="text-teal-400" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Partner Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Create <span className="text-gradient">Partner Account</span>
            </h1>
            <p className="text-sm text-gray-400">
              Register a business account to manage collaborations and track metrics.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Contact Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-teal transition-all duration-300"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  WhatsApp / Phone
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    placeholder="+91 99999 99999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-teal transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Email Input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Business Email *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="partner@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-teal transition-all duration-300"
                  />
                </div>
              </div>

              {/* Organization Input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Brand / Company Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cafe XYZ"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-teal transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Password * (Min 12 Chars)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-teal transition-all duration-300"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-teal transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl gradient-purple-teal hover:glow-teal text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  Register Partner Account
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Links Block */}
          <div className="text-center mt-6 pt-4 border-t border-white/5">
            <span className="text-xs text-gray-400">Already have an account? </span>
            <a
              href="/login"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              Log In
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
