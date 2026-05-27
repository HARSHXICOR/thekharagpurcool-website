"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search, Filter, Calendar, ArrowRight, Instagram, Mail, Phone, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

type InquiryItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string | null;
  instagramHandle: string | null;
  budgetBand: string;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
  service?: { name: string; slug: string } | null;
};

export function AdminInquiries() {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();

  // Search & Filtering State
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Security Authorization Guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && !["super_admin", "admin", "account_manager"].includes(user.defaultRole)) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Load Inquiries Index
  const loadInquiries = useCallback(async () => {
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const url = new URL("/api/admin/inquiries", window.location.origin);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", "8");

      const response = await fetchWithAuth(url.toString());
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to load lead list.");
      }

      setInquiries(payload.data || []);
      setTotalPages(payload.totalPages || 1);
      setTotalItems(payload.total || 0);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to pull admin inquiries index.");
    } finally {
      setLoadingList(false);
    }
  }, [page, statusFilter, searchQuery, fetchWithAuth]);

  // Trigger loading list on filter updates
  useEffect(() => {
    if (user && ["super_admin", "admin", "account_manager"].includes(user.defaultRole)) {
      loadInquiries();
    }
  }, [loadInquiries, user]);

  // Status Styling Mappers
  const getStatusBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case "contacted":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "negotiating":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      case "confirmed":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      case "running":
        return "bg-teal-500/10 border-teal-500/20 text-teal-300";
      case "completed":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "rejected":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-400";
    }
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    } catch {
      return "Recently";
    }
  };

  const cleanInstagramHandle = (handle: string | null) => {
    if (!handle) return "";
    return handle.startsWith("@") ? handle.substring(1) : handle;
  };

  if (isLoading || !user || !["super_admin", "admin", "account_manager"].includes(user.defaultRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header and Background Glows */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 glass-light px-3 py-1.5 rounded-full mb-4">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">CRM Command Console</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2">
                  Creator <span className="text-gradient">Inquiries</span>
                </h1>
                <p className="text-sm md:text-base text-gray-400">
                  Track collaboration leads, qualify partnership budgets, and manage your pipeline.
                </p>
              </div>

              <div className="glass px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 text-xs font-semibold text-gray-400">
                <span>Total Leads Received:</span>
                <span className="text-lg font-bold text-white">{totalItems}</span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="glass rounded-2xl p-4 border border-white/5 shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Real-time search bar */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search brand, name or handle..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1); // Reset page to 1
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-light border border-white/5 focus:border-purple-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:glow-purple transition-all duration-300"
                />
              </div>

              {/* Filtering Selection */}
              <div className="flex gap-3 w-full md:w-auto justify-end">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                    <Filter size={14} />
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-8 py-3 rounded-xl glass-light border border-white/5 text-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold mb-6 text-center">
                {errorMsg}
              </div>
            )}

            {/* Lead Lists Grid */}
            {loadingList ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center border border-white/5">
                <p className="text-gray-400 mb-2">No matching inquiries found.</p>
                <p className="text-xs text-gray-600">Try modifying your search queries or status filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005 }}
                    className="glass rounded-2xl p-5 border border-white/5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 group"
                  >
                    {/* Inquiry Meta Column */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-extrabold text-white text-lg group-hover:text-purple-300 transition-colors">
                          {inquiry.companyName || inquiry.name}
                        </span>
                        {inquiry.companyName && (
                          <span className="text-xs text-gray-500 font-medium">
                            (Contact: {inquiry.name})
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${getStatusBadgeStyles(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {inquiry.instagramHandle && (
                          <a
                            href={`https://instagram.com/${cleanInstagramHandle(inquiry.instagramHandle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-pink-400 transition-colors"
                          >
                            <Instagram size={14} className="text-pink-500" />
                            {inquiry.instagramHandle}
                          </a>
                        )}

                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-500" />
                          Received {getRelativeTime(inquiry.createdAt)}
                        </span>

                        <span className="flex items-center gap-1">
                          💰 Budget: <span className="font-semibold text-gray-300 capitalize">{inquiry.budgetBand}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 justify-between md:justify-end">
                      <div className="text-xs text-gray-500 italic hidden lg:block max-w-[200px] truncate">
                        "{inquiry.message || "No message provided."}"
                      </div>
                      
                      <button
                        onClick={() => router.push(`/admin/inquiries/${inquiry.id}`)}
                        className="px-5 py-2.5 rounded-xl glass-light hover:glass text-xs font-bold text-teal-400 hover:text-teal-300 border border-white/5 hover:border-teal-500/20 transition-all flex items-center gap-2 cursor-pointer group/btn"
                      >
                        Inspect Lead
                        <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Pagination Toolbar */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8 pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2.5 rounded-xl glass-light border border-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:glass text-sm transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-4 py-2.5 rounded-xl glass-light border border-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:glass text-sm transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
