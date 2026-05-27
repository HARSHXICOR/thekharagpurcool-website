"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, Mail, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Check for successful registration banner trigger
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registered") === "true") {
        setShowSuccessBanner(true);
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass-light px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Client Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Welcome <span className="text-gradient">Back</span>
            </h1>
            <p className="text-sm text-gray-400">
              Log in to manage your campaigns and inspect real-time performance.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {showSuccessBanner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-2xl text-xs font-semibold text-center"
              >
                Registration successful! You can now log in with your credentials.
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-light border border-white/5 focus:border-purple-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-purple transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Forgot password? Please contact promotionthekharagpurwala@gmail.com for direct account manager assistance.");
                  }}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold tracking-wider uppercase transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-light border border-white/5 focus:border-purple-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-purple transition-all duration-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl gradient-purple-teal hover:glow-purple text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-xs text-gray-400">Don&apos;t have a partner account? </span>
            <a
              href="/signup"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              Sign Up Now
            </a>
          </div>

          {/* Quick Sandbox Login Toggles */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block text-center mb-4">
              Authorized Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail("marketing@cafemocha.in");
                  setPassword("password12345");
                }}
                className="px-3 py-2 rounded-xl glass-light hover:glass border border-white/5 hover:border-teal-500/20 text-[10px] font-semibold text-gray-400 hover:text-teal-400 text-center transition-all cursor-pointer"
              >
                Cafe Mocha Client
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("superadmin@tgw.in");
                  setPassword("password12345");
                }}
                className="px-3 py-2 rounded-xl glass-light hover:glass border border-white/5 hover:border-purple-500/20 text-[10px] font-semibold text-gray-400 hover:text-purple-400 text-center transition-all cursor-pointer"
              >
                Super Admin Operator
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
