"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, Users, Heart, Eye, DollarSign, Calendar, Download,
  Car, GraduationCap, Flame, ShoppingBag, CheckCircle, Layers, Instagram, ArrowRight, Clock, Link, AlertCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

type Deliverable = {
  id: string;
  deliverableType: string;
  title: string;
  status: string;
  platform: string;
  linkUrl: string | null;
  notes: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
};

type CampaignDetail = {
  id: string;
  name: string;
  campaignType: string;
  status: string;
  objective: string | null;
  budget: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  brief: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  deliverables: Deliverable[];
};

export function Dashboard() {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();

  const [activeCampaigns, setActiveCampaigns] = useState<CampaignDetail[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [viewMode, setViewMode] = useState<"campaign" | "analytics">("campaign");

  // Security guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Load Client Campaigns and deliverables details
  const loadClientCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const response = await fetchWithAuth("/api/admin/campaigns");
      if (!response.ok) {
        throw new Error("Failed to load campaigns.");
      }
      const list = await response.json();
      
      // Load full details including deliverables checklist for each campaign
      const detailed = await Promise.all(
        list.map(async (c: any) => {
          const detailRes = await fetchWithAuth(`/api/admin/campaigns/${c.id}`);
          if (detailRes.ok) {
            return detailRes.json();
          }
          return null;
        })
      );
      
      setActiveCampaigns(detailed.filter(Boolean));
    } catch (err) {
      console.error("Dashboard campaign fetch error:", err);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    if (!user) return;

    // Initial load
    loadClientCampaigns();

    // Setup live polling every 8 seconds
    const intervalId = setInterval(() => {
      loadClientCampaigns();
    }, 8000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadClientCampaigns, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Authenticating session context...</p>
        </div>
      </div>
    );
  }
  // Mock data for charts
  const followerGrowth = [
    { month: "Oct", followers: 1200, engagement: 4.1 },
    { month: "Nov", followers: 4500, engagement: 5.5 },
    { month: "Dec", followers: 9200, engagement: 6.2 },
    { month: "Jan", followers: 14000, engagement: 7.8 },
    { month: "Feb", followers: 18500, engagement: 8.1 },
    { month: "Mar", followers: 23500, engagement: 8.9 },
  ];

  const contentPerformance = [
    { type: "Reels", posts: 45, avgViews: 125000, avgEngagement: 9.2 },
    { type: "Carousels", posts: 30, avgViews: 45000, avgEngagement: 6.5 },
    { type: "Single Posts", posts: 25, avgViews: 28000, avgEngagement: 4.8 },
    { type: "Stories", posts: 120, avgViews: 18000, avgEngagement: 3.2 },
  ];

  const reachData = [
    { week: "Week 1", reach: 950000, impressions: 1280000 },
    { week: "Week 2", reach: 1020000, impressions: 1450000 },
    { week: "Week 3", reach: 1080000, impressions: 1520000 },
    { week: "Week 4", reach: 1150000, impressions: 1680000 },
  ];

  const audienceDemographics = [
    { name: "18-24", value: 28 },
    { name: "25-34", value: 42 },
    { name: "35-44", value: 20 },
    { name: "45+", value: 10 },
  ];

  const COLORS = ["#a855f7", "#14b8a6", "#fbbf24", "#f472b6"];

  const categoryImpact = [
    {
      title: "Automobile Promotions",
      metric: "1.8M+ Views",
      growth: "+280% Showroom Traffic",
      details: "Cinematic test-drives, ride reels, and dealership walkthroughs for KIA, Suzuki, Jawa, Honda BigWing, Ather & Harley-Davidson.",
      icon: Car,
      color: "text-teal-400",
      bgGlow: "rgba(20, 184, 166, 0.15)",
    },
    {
      title: "Education Campaigns",
      metric: "450K+ Reached",
      growth: "+320 New Enrollments",
      details: "Regional center launches, walk-throughs, student discount code promos, and motivational reels for Physics Wallah & Aakash Institute.",
      icon: GraduationCap,
      color: "text-yellow-400",
      bgGlow: "rgba(250, 204, 21, 0.15)",
    },
    {
      title: "Cafe & Restaurant Reviews",
      metric: "920K+ Impressions",
      growth: "+250% Weekend Footfall",
      details: "Mouth-watering aesthetic food reviews, cafe ambiance tours, and customized coupon code activations for Swiggy, China Town & Bong Pizza.",
      icon: Flame,
      color: "text-orange-400",
      bgGlow: "rgba(249, 115, 22, 0.15)",
    },
    {
      title: "Local Retail & Lifestyle",
      metric: "1.1M+ Reach",
      growth: "+190% Seasonal Sales",
      details: "Grand opening coverage, product showcase carousels, and festival shopping lookbooks for Apple Resellers, Mobile Bazar & Fashion Avenue.",
      icon: ShoppingBag,
      color: "text-pink-400",
      bgGlow: "rgba(244, 114, 182, 0.15)",
    },
  ];

  const stats = [
    {
      label: "Total Followers",
      value: "23.5K",
      change: "+233%",
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Engagement Rate",
      value: "8.9%",
      change: "+114%",
      icon: Heart,
      color: "text-pink-400",
    },
    {
      label: "Monthly Reach",
      value: "4.2M",
      change: "+190%",
      icon: Eye,
      color: "text-teal-400",
    },
    {
      label: "Paid Collabs",
      value: "600+",
      change: "+85%",
      icon: DollarSign,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="inline-block px-4 py-2 rounded-full glass-light mb-4">
                  Campaign Analytics Preview
                </div>
                <h1 className="text-4xl md:text-6xl mb-2">
                  Your Growth <span className="text-gradient">Dashboard</span>
                </h1>
                <p className="text-xl text-gray-400">
                  Real-time analytics and performance tracking
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <button className="px-6 py-3 rounded-full glass-light hover:glass transition-all flex items-center gap-2">
                  <Calendar size={18} />
                  Last 30 Days
                </button>
                <button className="px-6 py-3 rounded-full gradient-purple-teal hover:glow-purple transition-all flex items-center gap-2">
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>

            {activeCampaigns.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-2 glass-light p-1.5 rounded-full border border-white/5 shadow-lg">
                  <button
                    onClick={() => setViewMode("campaign")}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      viewMode === "campaign"
                        ? "gradient-purple-teal text-white shadow"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Layers size={14} />
                    Campaign Status
                  </button>
                  <button
                    onClick={() => setViewMode("analytics")}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      viewMode === "analytics"
                        ? "gradient-purple-teal text-white shadow"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <TrendingUp size={14} />
                    Creator Analytics
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {activeCampaigns.length > 0 && viewMode === "campaign" ? (
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
              {activeCampaigns.map((campaign) => {
                const totalDels = campaign.deliverables.length;
                const completedDels = campaign.deliverables.filter((d) =>
                  ["posted", "approved", "completed"].includes(d.status.toLowerCase())
                ).length;
                const percentage = totalDels > 0 ? Math.round((completedDels / totalDels) * 100) : 0;

                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-6">
                      <div className="w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-2.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest">
                            <Layers size={10} />
                            Active Partnership Campaign
                          </div>
                          
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12121a]/60 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider shadow-inner">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Sync Active
                          </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white">{campaign.name}</h2>
                        <p className="text-xs text-gray-400 mt-1">
                          Objective: <span className="font-semibold text-gray-300 capitalize">{campaign.objective || "Brand Reach"}</span>
                        </p>
                      </div>

                      <div className="text-right w-full md:w-auto">
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Execution Progress</span>
                        <span className="text-3xl font-black text-teal-400">{percentage}%</span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="w-full bg-[#12121a] rounded-full h-3 border border-white/5 p-0.5">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-2">
                        <span>{completedDels} of {totalDels} Deliverables Delivered</span>
                        <span>{percentage}% Completed</span>
                      </div>
                    </div>

                    {/* Real-Time Production Feed */}
                    <div className="mb-8 p-5 bg-[#12121a]/60 border border-white/5 rounded-2xl relative overflow-hidden text-left">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                          </span>
                          Real-Time Production Feed
                        </h4>
                        <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 animate-pulse">
                          Auto-Refreshing
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Box 1: Production Pipeline */}
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-400 block mb-1">Production Stage</span>
                          <span className="text-lg font-black text-white">
                            {campaign.deliverables.filter(d => ["shooting", "editing", "planned"].includes(d.status.toLowerCase())).length} Units
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-1">In filming or editing suite</span>
                        </div>

                        {/* Box 2: Pre-Release Queue */}
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-yellow-400 block mb-1">Pre-Release Ready</span>
                          <span className="text-lg font-black text-white">
                            {campaign.deliverables.filter(d => d.status.toLowerCase() === "ready").length} Units
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-1">Approved & queued for upload</span>
                        </div>

                        {/* Box 3: Live Campaigns */}
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-pink-400 block mb-1">Live Campaigns</span>
                          <span className="text-lg font-black text-white">
                            {campaign.deliverables.filter(d => ["posted", "approved", "completed"].includes(d.status.toLowerCase())).length} Units
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-1">Active content on Instagram</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-purple-400" />
                        Campaign Deliverables Checklist
                      </h3>

                      {campaign.deliverables.length === 0 ? (
                        <div className="p-6 text-center bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-xs text-gray-400">Our production crew is preparing your scheduled deliverables checklist.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {campaign.deliverables.map((del) => {
                            const isDone = ["posted", "approved", "completed"].includes(del.status.toLowerCase());
                            return (
                              <div
                                key={del.id}
                                className="p-4 rounded-xl glass-light border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`mt-0.5 p-1 rounded-lg ${isDone ? "bg-teal-500/10 text-teal-400" : "bg-white/5 text-gray-500"}`}>
                                    <CheckCircle size={16} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm font-bold ${isDone ? "text-gray-300 line-through decoration-gray-600" : "text-white"}`}>
                                        {del.title}
                                      </span>
                                      <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                        {del.deliverableType}
                                      </span>
                                    </div>
                                    {del.notes && <p className="text-xs text-gray-500 mt-1">"{del.notes}"</p>}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                                  <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-full border ${
                                    isDone
                                      ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                                      : del.status.toLowerCase() === "planned"
                                      ? "bg-gray-500/10 border-gray-500/20 text-gray-400"
                                      : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                  }`}>
                                    {del.status}
                                  </span>

                                  {del.linkUrl ? (
                                    <a
                                      href={del.linkUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 text-[10px] font-extrabold uppercase tracking-wider transition-all"
                                    >
                                      <Instagram size={12} />
                                      View Live Content
                                    </a>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-gray-500 italic flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                      <Clock size={12} />
                                      In Production
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Stats Cards */}
          <section className="pb-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl glass-light flex items-center justify-center ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-3xl mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Category Campaign Impact Section */}
          <section className="pb-12 relative overflow-hidden">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="text-2xl md:text-4xl mb-2 font-bold">
                  Category <span className="text-gradient">Campaign Impact</span>
                </h2>
                <p className="text-gray-400">
                  Aggregated results and promotional efficiency by business category
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {categoryImpact.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[250px] transition-all duration-300 group cursor-default"
                    >
                      <div
                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-125"
                        style={{
                          backgroundColor:
                            item.color === "text-teal-400"
                              ? "rgba(20, 184, 166, 0.15)"
                              : item.color === "text-yellow-400"
                              ? "rgba(250, 204, 21, 0.15)"
                              : item.color === "text-orange-400"
                              ? "rgba(249, 115, 22, 0.15)"
                              : "rgba(244, 114, 182, 0.15)",
                        }}
                      />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent size={20} />
                          </div>
                          <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/10">
                            {item.growth}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.details}</p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Aggregated Metrics</span>
                        <span className={`text-lg font-extrabold ${item.color}`}>{item.metric}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className="pb-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl mb-1">Follower Growth & Engagement</h3>
                      <p className="text-sm text-gray-400">6-month performance trend</p>
                    </div>
                    <TrendingUp size={24} className="text-green-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={followerGrowth}>
                      <defs>
                        <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(26, 26, 36, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="followers"
                        stroke="#a855f7"
                        fillOpacity={1}
                        fill="url(#colorFollowers)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl mb-1">Reach & Impressions</h3>
                      <p className="text-sm text-gray-400">Weekly breakdown</p>
                    </div>
                    <Eye size={24} className="text-teal-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reachData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(26, 26, 36, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="reach" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="impressions" fill="#a855f7" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl mb-1">Content Performance</h3>
                      <p className="text-sm text-gray-400">By content type</p>
                    </div>
                    <Heart size={24} className="text-pink-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contentPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis type="number" stroke="#999" />
                      <YAxis dataKey="type" type="category" stroke="#999" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(26, 26, 36, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="avgViews" fill="#fbbf24" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl mb-1">Audience Demographics</h3>
                      <p className="text-sm text-gray-400">Age distribution</p>
                    </div>
                    <Users size={24} className="text-purple-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={audienceDemographics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {audienceDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(26, 26, 36, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Recent Posts */}
          <section className="pb-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-xl mb-6">Top Performing Posts (Last 30 Days)</h3>
                <div className="space-y-4">
                  {[
                    {
                      type: "Reel",
                      caption: "Exploring the best Street Food in Kharagpur 🍲🔥",
                      views: "245K",
                      likes: "18.5K",
                      comments: "342",
                      engagement: "9.2%",
                    },
                    {
                      type: "Meme",
                      caption: "Kharagpur local train struggles be like... 😂🚇",
                      views: "185K",
                      likes: "22.1K",
                      comments: "890",
                      engagement: "12.4%",
                    },
                    {
                      type: "Reel",
                      caption: "Local Brand Spotlight: Paschim Midnapore's new Cafe! ☕✨",
                      views: "198K",
                      likes: "14.8K",
                      comments: "267",
                      engagement: "8.6%",
                    },
                  ].map((post, index) => (
                    <div
                      key={index}
                      className="glass-light rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full glass text-xs">{post.type}</span>
                          <span className="text-sm text-gray-300">{post.caption}</span>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">Views</div>
                          <div>{post.views}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">Likes</div>
                          <div>{post.likes}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">Comments</div>
                          <div>{post.comments}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">Engagement</div>
                          <div className="text-green-400">{post.engagement}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA */}
          <section className="pb-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center"
              >
                <h2 className="text-4xl mb-4">
                  Partner With <span className="text-gradient">The Kharagpur Wala</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  All our brand partners get detailed campaign analytics and real-time performance reports.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-purple-teal hover:glow-purple transition-all"
                >
                  Collaborate Now
                  <TrendingUp size={20} />
                </a>
              </motion.div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
