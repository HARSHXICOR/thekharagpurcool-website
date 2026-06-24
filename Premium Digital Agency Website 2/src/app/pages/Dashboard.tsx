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
import { getBackendApiUrl } from "../../lib/backend";

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
    industry?: string | null;
  };
  deliverables: Deliverable[];
  metrics?: any[];
};

export function Dashboard() {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();

  const [activeCampaigns, setActiveCampaigns] = useState<CampaignDetail[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [viewMode, setViewMode] = useState<"campaign" | "analytics">("campaign");

  // Live Meta/Instagram analytics states
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [instagramAccount, setInstagramAccount] = useState<any>(null);
  const [instagramMedia, setInstagramMedia] = useState<any[]>([]);
  const [selectedDemoTab, setSelectedDemoTab] = useState<"age" | "gender" | "country" | "city">("age");
  const [followerGrowthData, setFollowerGrowthData] = useState<any[]>([]);
  const [instagramDemographics, setInstagramDemographics] = useState<any>({
    age: [],
    gender: [],
    country: [],
    city: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [connectingInstagram, setConnectingInstagram] = useState(false);

  const handleConnectInstagram = async () => {
    if (!organizations || organizations.length === 0) return;
    setConnectingInstagram(true);
    try {
      const orgId = selectedOrgId || organizations[0].organization.id;
      const backendUrl = getBackendApiUrl();
      const res = await fetchWithAuth(`${backendUrl}/meta/connect-url?orgId=${orgId}`);
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Failed to generate Meta connection URL.");
      }
      if (payload.url) {
        window.location.href = payload.url;
      }
    } catch (err: any) {
      console.error("Failed to connect Instagram:", err);
    } finally {
      setConnectingInstagram(false);
    }
  };


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
      const url = "/api/admin/campaigns";
      const response = await fetchWithAuth(url);
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

  // Load live Meta/Instagram sync data
  const loadCreatorAnalytics = useCallback(async (orgIdOverride?: string) => {
    setLoadingAnalytics(true);
    try {
      const orgRes = await fetchWithAuth("/api/organizations/me");
      if (orgRes.ok) {
        const orgs = await orgRes.json();
        setOrganizations(orgs);
        if (orgs && orgs.length > 0) {
          // Look for an organization that has 'the_kharagpur_wala_' connected
          let defaultOrg = orgs[0];
          const kharagpurWalaOrg = orgs.find((o: any) => 
            o.organization.instagramAccounts?.some((acc: any) => acc.username === 'the_kharagpur_wala_')
          );
          
          if (kharagpurWalaOrg) {
            defaultOrg = kharagpurWalaOrg;
          } else {
            // Otherwise, fall back to any organization with a connected Instagram account
            const connectedOrg = orgs.find((o: any) => 
              o.organization.instagramAccounts && o.organization.instagramAccounts.length > 0
            );
            if (connectedOrg) {
              defaultOrg = connectedOrg;
            }
          }

          const targetOrgId = orgIdOverride || selectedOrgId || defaultOrg.organization.id;
          const finalOrgId = orgs.some((o: any) => o.organization.id === targetOrgId)
            ? targetOrgId
            : defaultOrg.organization.id;

          if (finalOrgId !== selectedOrgId) {
            setSelectedOrgId(finalOrgId);
          }

          const accountsRes = await fetchWithAuth(`/api/meta/accounts?orgId=${finalOrgId}`);
          if (accountsRes.ok) {
            const accountsList = await accountsRes.json();
            if (accountsList && accountsList.length > 0) {
              const activeAccount = accountsList.find((acc: any) => acc.username === 'the_kharagpur_wala_') || accountsList[0];
              setInstagramAccount(activeAccount);

              // Load media
              const mediaRes = await fetchWithAuth(`/api/meta/accounts/${activeAccount.id}/media`);
              if (mediaRes.ok) {
                const mediaList = await mediaRes.json();
                setInstagramMedia(mediaList || []);
              }

              // Load demographics
              const demoRes = await fetchWithAuth(`/api/meta/accounts/${activeAccount.id}/demographics`);
              if (demoRes.ok) {
                const demoData = await demoRes.json();
                setInstagramDemographics(demoData);
              }

              // Load follower growth
              const growthRes = await fetchWithAuth(`/api/meta/accounts/${activeAccount.id}/follower-growth`);
              if (growthRes.ok) {
                const growthData = await growthRes.json();
                setFollowerGrowthData(growthData || []);
              }
            } else {
              setInstagramAccount(null);
              setInstagramMedia([]);
              setFollowerGrowthData([]);
              setInstagramDemographics({
                age: [],
                gender: [],
                country: [],
                city: [],
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Dashboard analytics fetch error:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [fetchWithAuth, selectedOrgId]);

  useEffect(() => {
    if (!user) return;

    // Initial load
    loadClientCampaigns();
    loadCreatorAnalytics();

    // Setup live polling
    const campaignInterval = setInterval(() => {
      loadClientCampaigns();
    }, 8000);

    const analyticsInterval = setInterval(() => {
      loadCreatorAnalytics();
    }, 30000); // 30s polling for analytics

    return () => {
      clearInterval(campaignInterval);
      clearInterval(analyticsInterval);
    };
  }, [loadClientCampaigns, loadCreatorAnalytics, user]);

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

  // Dynamic calculations & formatters
  let engagementRateVal = 0;
  if (instagramAccount && instagramAccount.followersCount > 0 && instagramMedia && instagramMedia.length > 0) {
    const totalLikesAndComments = instagramMedia.reduce(
      (sum, item) => sum + (item.likeCount || 0) + (item.commentsCount || 0),
      0
    );
    const avgLikesAndCommentsPerPost = totalLikesAndComments / instagramMedia.length;
    engagementRateVal = (avgLikesAndCommentsPerPost / instagramAccount.followersCount) * 100;
  }

  let totalReach = 0;
  if (instagramMedia && instagramMedia.length > 0) {
    instagramMedia.forEach((post) => {
      const metric = post.mediaMetrics && post.mediaMetrics.length > 0 ? post.mediaMetrics[0] : null;
      totalReach += metric?.reach || (post.likeCount ? post.likeCount * 5 : 0);
    });
  }

  const followerGrowth = followerGrowthData.length > 0
    ? followerGrowthData
    : [];

  const getContentPerformance = () => {
    if (instagramMedia && instagramMedia.length > 0) {
      const groups: Record<string, { posts: number; totalViews: number; totalLikes: number; totalComments: number }> = {
        "Reels": { posts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 },
        "Carousels": { posts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 },
        "Single Posts": { posts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 },
        "Stories": { posts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 },
      };

      instagramMedia.forEach((post) => {
        const type = post.mediaType;
        let category = "Single Posts";
        if (type === "REEL") category = "Reels";
        else if (type === "CAROUSEL_ALBUM") category = "Carousels";
        else if (type === "STORY") category = "Stories";
        else if (type === "VIDEO") category = "Reels";

        const metric = post.mediaMetrics && post.mediaMetrics.length > 0 ? post.mediaMetrics[0] : null;
        const views = metric?.views || metric?.plays || (post.likeCount ? post.likeCount * 12 : 0) || 0;
        
        groups[category].posts += 1;
        groups[category].totalViews += views;
        groups[category].totalLikes += (post.likeCount || 0);
        groups[category].totalComments += (post.commentsCount || 0);
      });

      return Object.keys(groups).map((key) => {
        const g = groups[key];
        const avgViews = g.posts > 0 ? Math.round(g.totalViews / g.posts) : 0;
        const avgLikesAndComments = g.posts > 0 ? (g.totalLikes + g.totalComments) / g.posts : 0;
        const followers = instagramAccount?.followersCount || 0;
        const avgEngagement = followers > 0 ? (avgLikesAndComments / followers) * 100 : 0;

        return {
          type: key,
          posts: g.posts,
          avgViews: avgViews || 0,
          avgEngagement: Number(avgEngagement.toFixed(1)) || 0,
        };
      });
    }
    return [];
  };

  const contentPerformance = getContentPerformance();

  const reachData = instagramMedia && instagramMedia.length > 0
    ? [...instagramMedia].slice(0, 5).reverse().map((post, index) => {
        const metric = post.mediaMetrics && post.mediaMetrics.length > 0 ? post.mediaMetrics[0] : null;
        const likes = post.likeCount || 0;
        const fallbackReach = metric?.reach || (likes * 5) || 0;
        const fallbackImpressions = metric?.impressions || (likes * 7) || 0;
        const label = post.caption ? (post.caption.substring(0, 10) + "...") : `Post ${index + 1}`;
        return {
          week: label,
          reach: fallbackReach,
          impressions: fallbackImpressions,
        };
      })
    : [];

  const COLORS = ["#a855f7", "#14b8a6", "#fbbf24", "#f472b6"];

  const getCategoryImpact = () => {
    const categories = {
      Automobile: {
        title: "Automobile Promotions",
        count: 0,
        reach: 0,
        impressions: 0,
        footfall: 0,
        icon: Car,
        color: "text-teal-400",
        bgGlow: "rgba(20, 184, 166, 0.15)",
        details: "Cinematic test-drives, ride reels, and dealership walkthroughs for TVS, KIA, Suzuki, Jawa, Honda BigWing & Harley-Davidson."
      },
      Education: {
        title: "Education Campaigns",
        count: 0,
        reach: 0,
        impressions: 0,
        footfall: 0,
        icon: GraduationCap,
        color: "text-yellow-400",
        bgGlow: "rgba(250, 204, 21, 0.15)",
        details: "Regional center launches, walk-throughs, student discount code promos, and motivational reels for Physics Wallah & Aakash Institute."
      },
      Food: {
        title: "Cafe & Restaurant Reviews",
        count: 0,
        reach: 0,
        impressions: 0,
        footfall: 0,
        icon: Flame,
        color: "text-orange-400",
        bgGlow: "rgba(249, 115, 22, 0.15)",
        details: "Mouth-watering aesthetic food reviews, cafe ambiance tours, and customized coupon code activations for Swiggy, China Town & Bong Pizza."
      },
      Retail: {
        title: "Local Retail & Lifestyle",
        count: 0,
        reach: 0,
        impressions: 0,
        footfall: 0,
        icon: ShoppingBag,
        color: "text-pink-400",
        bgGlow: "rgba(244, 114, 182, 0.15)",
        details: "Grand opening coverage, product showcase carousels, and festival shopping lookbooks for Apple Resellers, Mobile Bazar & Fashion Avenue."
      }
    };

    activeCampaigns.forEach((campaign) => {
      const industry = (campaign.organization?.industry || "").toLowerCase();
      let catKey: keyof typeof categories = "Retail";
      if (industry.includes("auto") || industry.includes("car") || industry.includes("bike")) {
        catKey = "Automobile";
      } else if (industry.includes("edu") || industry.includes("teach") || industry.includes("coaching") || industry.includes("school")) {
        catKey = "Education";
      } else if (industry.includes("restaurant") || industry.includes("cafe") || industry.includes("food") || industry.includes("beverage")) {
        catKey = "Food";
      }

      categories[catKey].count += 1;

      if (campaign.metrics && campaign.metrics.length > 0) {
        campaign.metrics.forEach((metric: any) => {
          categories[catKey].reach += metric.reach || 0;
          categories[catKey].impressions += metric.impressions || 0;
          categories[catKey].footfall += metric.footfallEstimate || 0;
        });
      }
    });

    return Object.values(categories).map((cat) => {
      let metricLabel = `${cat.count} Campaign${cat.count !== 1 ? "s" : ""}`;
      let growthLabel = "No active campaigns";

      if (cat.count > 0) {
        if (cat.reach > 0) {
          metricLabel = `${formatNumber(cat.reach)} Reach`;
        } else if (cat.impressions > 0) {
          metricLabel = `${formatNumber(cat.impressions)} Impressions`;
        }
        
        if (cat.footfall > 0) {
          growthLabel = `+${Math.round(cat.footfall)} Visitors`;
        } else {
          growthLabel = `${cat.count} Active Collab${cat.count !== 1 ? "s" : ""}`;
        }
      } else {
        metricLabel = "0 Campaigns";
        growthLabel = "No active campaigns";
      }

      return {
        title: cat.title,
        metric: metricLabel,
        growth: growthLabel,
        details: cat.details,
        icon: cat.icon,
        color: cat.color,
        bgGlow: cat.bgGlow
      };
    });
  };

  const categoryImpact = getCategoryImpact();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const stats = [
    {
      label: "Total Followers",
      value: instagramAccount ? formatNumber(instagramAccount.followersCount || 0) : "0",
      change: instagramAccount ? "Live" : "Offline",
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Engagement Rate",
      value: instagramAccount ? engagementRateVal.toFixed(1) + "%" : "0.0%",
      change: instagramAccount ? "Live" : "Offline",
      icon: Heart,
      color: "text-pink-400",
    },
    {
      label: "Monthly Reach",
      value: instagramAccount && totalReach > 0 ? formatNumber(totalReach) : "0",
      change: instagramAccount ? "Live" : "Offline",
      icon: Eye,
      color: "text-teal-400",
    },
    {
      label: "Paid Collabs",
      value: activeCampaigns.length.toString(),
      change: instagramAccount ? "Live" : "Offline",
      icon: DollarSign,
      color: "text-yellow-400",
    },
  ];

  const getTopPosts = () => {
    if (instagramMedia && instagramMedia.length > 0) {
      const sorted = [...instagramMedia].sort((a, b) => {
        const scoreA = (a.likeCount || 0) + (a.commentsCount || 0);
        const scoreB = (b.likeCount || 0) + (b.commentsCount || 0);
        return scoreB - scoreA;
      });

      return sorted.slice(0, 3).map((post) => {
        const likes = post.likeCount || 0;
        const comments = post.commentsCount || 0;
        const followers = instagramAccount?.followersCount || 0;
        const postEngagement = followers > 0 ? ((likes + comments) / followers) * 100 : 0;

        const metric = post.mediaMetrics && post.mediaMetrics.length > 0 ? post.mediaMetrics[0] : null;
        const viewsVal = metric?.views || metric?.plays || (likes * 12) || 0;

        let typeLabel = "Post";
        if (post.mediaType === "REEL") typeLabel = "Reel";
        else if (post.mediaType === "CAROUSEL_ALBUM") typeLabel = "Carousel";
        else if (post.mediaType === "STORY") typeLabel = "Story";

        return {
          type: typeLabel,
          caption: post.caption || "No caption",
          views: formatNumber(viewsVal),
          likes: formatNumber(likes),
          comments: comments.toString(),
          engagement: postEngagement.toFixed(1) + "%",
        };
      });
    }

    return [];
  };

  const getFreshnessLabel = () => {
    if (!instagramAccount?.lastSuccessfulSyncAt) return "";
    const lastSync = new Date(instagramAccount.lastSuccessfulSyncAt);
    const diffMs = Date.now() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  const renderSyncStatus = () => {
    if (!instagramAccount) {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold shadow-lg max-w-2xl text-center sm:text-left">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-purple-400 animate-pulse flex-shrink-0" />
            <span>No Instagram profile connected. Connect your Instagram profile to sync live creator metrics.</span>
          </div>
          {organizations && organizations.length > 0 && (
            <button
              onClick={handleConnectInstagram}
              disabled={connectingInstagram}
              className="px-4 py-1.5 rounded-full gradient-purple-teal hover:glow-purple text-[10px] font-bold uppercase tracking-wider text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Instagram size={12} />
              {connectingInstagram ? "Connecting..." : "Connect Instagram"}
            </button>
          )}
        </div>
      );
    }

    const freshness = getFreshnessLabel();
    const status = instagramAccount.syncStatus || "LIVE";

    if (status === "SYNCING") {
      return (
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
          </span>
          <span>Syncing New Data for <strong>@{instagramAccount.username}</strong>...</span>
        </div>
      );
    }

    if (status === "PARTIAL") {
      return (
        <div className="inline-flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <span>Partial Instagram Sync: <strong>@{instagramAccount.username}</strong> {freshness && `(Synced ${freshness})`}</span>
          </div>
          <span className="text-[10px] text-gray-500 italic">Certain demographics or insights are restricted by follower thresholds.</span>
        </div>
      );
    }

    if (status === "ERROR") {
      return (
        <div className="inline-flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 animate-pulse"></span>
            </span>
            <span>Sync Error: <strong>@{instagramAccount.username}</strong></span>
          </div>
          {instagramAccount.lastSyncError && (
            <span className="text-[10px] text-red-400/80 font-mono bg-red-500/5 px-3 py-1 rounded-lg border border-red-500/10 max-w-md text-center">
              Error: {instagramAccount.lastSyncError}
            </span>
          )}
        </div>
      );
    }

    // Default LIVE
    return (
      <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold shadow-lg">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
        </span>
        <span>Live Instagram Sync Active: <strong>@{instagramAccount.username}</strong> {freshness && `(Synced ${freshness})`}</span>
      </div>
    );
  };

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
              {/* Live Sync Status Banner */}
              <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex-grow flex justify-center sm:justify-start">
                  {renderSyncStatus()}
                </div>
              </div>

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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl mb-1">Audience Demographics</h3>
                      <p className="text-sm text-gray-400 capitalize">{selectedDemoTab} distribution</p>
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="flex gap-2 bg-[#12121a] p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => setSelectedDemoTab("age")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedDemoTab === "age" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        Age
                      </button>
                      <button
                        onClick={() => setSelectedDemoTab("gender")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedDemoTab === "gender" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        Gender
                      </button>
                      {(!instagramAccount || instagramAccount.supportsCountryBreakdown) && (
                        <button
                          onClick={() => setSelectedDemoTab("country")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedDemoTab === "country" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          Country
                        </button>
                      )}
                      {(!instagramAccount || instagramAccount.supportsCityBreakdown) && (
                        <button
                          onClick={() => setSelectedDemoTab("city")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedDemoTab === "city" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          City
                        </button>
                      )}
                    </div>
                  </div>

                  {instagramAccount && !instagramAccount.supportsDemographics ? (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 bg-black/20 rounded-xl border border-white/5 animate-in fade-in duration-350">
                      <Users size={40} className="text-gray-600 mb-3" />
                      <p className="text-sm font-semibold text-gray-400">Audience Demographics Restricted</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">Meta requires a professional account with at least 100 followers to disclose demographics insights.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      {selectedDemoTab === "age" || selectedDemoTab === "gender" ? (
                        <PieChart>
                          <Pie
                            data={instagramDemographics[selectedDemoTab] || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(instagramDemographics[selectedDemoTab] || []).map((entry: any, index: number) => (
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
                      ) : (
                        <BarChart data={instagramDemographics[selectedDemoTab] || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="#999" unit="%" />
                          <YAxis dataKey="name" type="category" stroke="#999" width={100} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(26, 26, 36, 0.9)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  )}
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
                  {getTopPosts().length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 italic">
                      No posts found or Instagram account not synced.
                    </div>
                  ) : (
                    getTopPosts().map((post, index) => (
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
                    ))
                  )}
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
