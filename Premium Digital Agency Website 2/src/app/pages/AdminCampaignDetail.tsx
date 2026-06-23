"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { getBackendApiUrl } from "../../lib/backend";
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  Instagram,
  Plus,
  CheckCircle,
  Clock,
  Link,
  Layers,
  Save,
  DollarSign,
  Briefcase,
  AlertCircle,
  Users
} from "lucide-react";

type Deliverable = {
  id: string;
  deliverableType: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  platform: string;
  linkUrl: string | null;
  notes: string | null;
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
  internalNotes: string | null;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  deliverables: Deliverable[];
  ownerId?: string | null;
  owner?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

type AdminCampaignDetailProps = {
  id: string;
};

export function AdminCampaignDetail({ id }: AdminCampaignDetailProps) {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();

  // Campaign states
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Campaign Update states
  const [campaignStatus, setCampaignStatus] = useState("");
  const [updatingCampaign, setUpdatingCampaign] = useState(false);

  // Deliverables states
  const [newDelTitle, setNewDelTitle] = useState("");
  const [newDelType, setNewDelType] = useState("reel");
  const [newDelPlatform, setNewDelPlatform] = useState("instagram");
  const [newDelNotes, setNewDelNotes] = useState("");
  const [addingDeliverable, setAddingDeliverable] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Link Attachment & Inline status update
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  const [tempLinkValue, setTempLinkValue] = useState("");
  const [savingDeliverableId, setSavingDeliverableId] = useState<string | null>(null);

  // Client mapping states
  const [clientUsers, setClientUsers] = useState<{ id: string; email: string; fullName: string }[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [loadingClients, setLoadingClients] = useState(false);
  const [mappingOwner, setMappingOwner] = useState(false);
  const [showMappingPanel, setShowMappingPanel] = useState(false);

  // Instagram connection states
  const [instagramAccount, setInstagramAccount] = useState<any>(null);
  const [loadingInstagram, setLoadingInstagram] = useState(false);
  const [connectingInstagram, setConnectingInstagram] = useState(false);

  // Security Guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && !["super_admin", "admin", "account_manager"].includes(user.defaultRole)) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Helper to parse complex database Decimal types cleanly
  const getSafeBudget = (budget: any): number => {
    if (budget === null || budget === undefined) return 0;
    if (typeof budget === "number") return budget;
    if (typeof budget === "string") {
      const parsed = Number(budget);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof budget === "object") {
      if (budget.value !== undefined) {
        const parsed = Number(budget.value);
        if (!isNaN(parsed)) return parsed;
      }
      
      if (Array.isArray(budget.d) && typeof budget.e === "number") {
        const joinedDigits = budget.d.join("");
        const sign = budget.s || 1;
        const exponent = budget.e;
        
        if (budget.d.length === 1) {
          const val = budget.d[0] * sign;
          if (String(val).length - 1 === exponent || String(val).length === exponent + 1) {
            return val;
          }
        }
        
        const length = joinedDigits.length;
        const val = sign * Number(joinedDigits) * Math.pow(10, exponent - length + 1);
        if (!isNaN(val)) return val;
      }

      if (typeof budget.toString === "function") {
        const str = budget.toString();
        if (str && str !== "[object Object]") {
          const parsed = Number(str);
          if (!isNaN(parsed)) return parsed;
        }
      }
    }
    return 0;
  };

  // Load linked Instagram Account for this campaign's organization
  const loadInstagramAccount = useCallback(async (orgId: string) => {
    setLoadingInstagram(true);
    try {
      const backendUrl = getBackendApiUrl();
      const res = await fetchWithAuth(`${backendUrl}/meta/accounts?orgId=${orgId}`);
      if (res.ok) {
        const list = await res.json();
        if (list && list.length > 0) {
          setInstagramAccount(list[0]);
        } else {
          setInstagramAccount(null);
        }
      }
    } catch (err) {
      console.error("Failed to load Instagram accounts:", err);
    } finally {
      setLoadingInstagram(false);
    }
  }, [fetchWithAuth]);

  // Connect/Link Instagram account
  const handleConnectInstagram = async () => {
    if (!campaign) return;
    setConnectingInstagram(true);
    try {
      const backendUrl = getBackendApiUrl();
      const res = await fetchWithAuth(`${backendUrl}/meta/connect-url?orgId=${campaign.organizationId}`);
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Failed to generate Meta connection URL.");
      }
      if (payload.url) {
        window.location.href = payload.url;
      }
    } catch (err: any) {
      alert(err.message || "Could not start Meta connection flow.");
    } finally {
      setConnectingInstagram(false);
    }
  };

  // Load Campaign Profile
  const loadCampaign = useCallback(async () => {
    setLoadingDetail(true);
    setFetchError(null);
    try {
      const response = await fetchWithAuth(`/api/admin/campaigns/${id}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to retrieve campaign details.");
      }

      setCampaign(payload);
      setCampaignStatus(payload.status);
      if (payload.ownerId) {
        setSelectedOwnerId(payload.ownerId);
      } else {
        setSelectedOwnerId("");
      }

      // Load linked Instagram account details if organization is present
      if (payload.organizationId) {
        loadInstagramAccount(payload.organizationId);
      }
    } catch (err: any) {
      setFetchError(err.message || "Unable to access this campaign profile.");
    } finally {
      setLoadingDetail(false);
    }
  }, [id, fetchWithAuth, loadInstagramAccount]);

  // Load Client Users list for dropdown mapping
  const loadClientUsers = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await fetchWithAuth("/api/admin/users/clients");
      if (res.ok) {
        const list = await res.json();
        setClientUsers(list);
      }
    } catch (err) {
      console.error("Failed to load client users list:", err);
    } finally {
      setLoadingClients(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    if (user && ["super_admin", "admin", "account_manager"].includes(user.defaultRole)) {
      loadCampaign();
      loadClientUsers();
    }
  }, [loadCampaign, loadClientUsers, user]);

  // Handle Client Portal Mapping/Assignment
  const handleMapClientSubmit = async (ownerIdVal: string) => {
    if (!campaign) return;
    setMappingOwner(true);
    try {
      const response = await fetchWithAuth(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: campaign.organizationId,
          name: campaign.name,
          campaignType: campaign.campaignType,
          budget: getSafeBudget(campaign.budget),
          status: campaign.status,
          ownerId: ownerIdVal || null
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || "Failed to map campaign client owner.");
      }

      const updatedCampaign = await response.json();
      setCampaign(updatedCampaign);
      if (updatedCampaign.ownerId) {
        setSelectedOwnerId(updatedCampaign.ownerId);
      } else {
        setSelectedOwnerId("");
      }
      alert(ownerIdVal ? "Client portal access linked successfully!" : "Client portal access unlinked.");
      setShowMappingPanel(false);
    } catch (err: any) {
      alert(err.message || "Failed to update client portal assignment.");
    } finally {
      setMappingOwner(false);
    }
  };

  // Handle Overall Campaign Status Update
  const handleCampaignStatusChange = async (newStatus: string) => {
    if (!campaign) return;
    setCampaignStatus(newStatus);
    setUpdatingCampaign(true);

    try {
      const response = await fetchWithAuth(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: campaign.organizationId,
          name: campaign.name,
          campaignType: campaign.campaignType,
          budget: getSafeBudget(campaign.budget),
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || "Failed to update campaign state.");
      }

      setCampaign((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
      setCampaignStatus(campaign.status); // revert
    } finally {
      setUpdatingCampaign(false);
    }
  };

  // Add new Deliverable
  const handleAddDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setAddingDeliverable(true);

    try {
      const response = await fetchWithAuth(`/api/admin/campaigns/${id}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableType: newDelType,
          title: newDelTitle,
          status: "planned",
          platform: newDelPlatform,
          notes: newDelNotes || undefined
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || "Failed to add deliverable.");
      }

      const createdDel = await response.json();
      setCampaign((prev) =>
        prev
          ? {
              ...prev,
              deliverables: [...prev.deliverables, createdDel],
            }
          : null
      );

      // Reset Form
      setNewDelTitle("");
      setNewDelNotes("");
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to provision deliverable.");
    } finally {
      setAddingDeliverable(false);
    }
  };

  // Update Deliverable Status
  const handleDeliverableStatusChange = async (delId: string, newStatus: string) => {
    if (!campaign) return;
    setSavingDeliverableId(delId);

    try {
      const response = await fetchWithAuth(`/api/admin/campaigns/${id}/deliverables/${delId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || "Failed to update deliverable state.");
      }

      const updatedDel = await response.json();
      setCampaign((prev) =>
        prev
          ? {
              ...prev,
              deliverables: prev.deliverables.map((d) => (d.id === delId ? updatedDel : d)),
            }
          : null
      );
    } catch (err: any) {
      alert(err.message || "Failed to update deliverable status.");
    } finally {
      setSavingDeliverableId(null);
    }
  };

  // Attach Instagram Link
  const handleAttachLink = async (delId: string) => {
    if (!campaign) return;
    setSavingDeliverableId(delId);

    try {
      const response = await fetchWithAuth(`/api/admin/campaigns/${id}/deliverables/${delId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkUrl: tempLinkValue,
          status: "posted" // Auto-update to posted upon link attachment
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || "Failed to attach Instagram link.");
      }

      const updatedDel = await response.json();
      setCampaign((prev) =>
        prev
          ? {
              ...prev,
              deliverables: prev.deliverables.map((d) => (d.id === delId ? updatedDel : d)),
            }
          : null
      );
      
      setActiveLinkId(null);
      setTempLinkValue("");
    } catch (err: any) {
      alert(err.message || "Failed to save link.");
    } finally {
      setSavingDeliverableId(null);
    }
  };

  // Utility calculations
  const getProgressPercentage = () => {
    if (!campaign || campaign.deliverables.length === 0) return 0;
    const completedCount = campaign.deliverables.filter((d) =>
      ["posted", "approved", "completed"].includes(d.status.toLowerCase())
    ).length;
    return Math.round((completedCount / campaign.deliverables.length) * 100);
  };

  if (isLoading || !user || !["super_admin", "admin", "account_manager"].includes(user.defaultRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Opening Campaign Briefcase...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="max-w-md w-full glass rounded-3xl p-8 border border-white/5 text-center">
          <h2 className="text-red-400 text-lg font-bold mb-3">Retrieval Failed</h2>
          <p className="text-sm text-gray-400 mb-6">{fetchError || "Campaign does not exist."}</p>
          <button
            onClick={() => router.push("/admin/inquiries")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 text-black text-xs font-bold transition-all cursor-pointer hover:glow-purple"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-24 relative overflow-hidden">
      {/* Dynamic Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Back Action */}
          <button
            onClick={() => router.push("/admin/inquiries")}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Command Center
          </button>

          {/* Campaign Operations Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-white/5 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 glass-light px-3 py-1.5 rounded-full mb-3">
                <Layers size={12} className="text-teal-400" />
                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Campaign Operations Center</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
                {campaign.name}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Client Brand: <span className="font-semibold text-teal-400">{campaign.organization?.name || "Unassigned"}</span> • Campaign ID: {campaign.id}
              </p>
            </div>

            {/* Campaign Pipeline Status Controller */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="glass px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Campaign Status:</span>
                <div className="relative">
                  {updatingCampaign && (
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                  )}
                  <select
                    value={campaignStatus}
                    onChange={(e) => handleCampaignStatusChange(e.target.value)}
                    disabled={updatingCampaign}
                    className="bg-[#12121a] text-white text-xs font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer appearance-none pr-8"
                  >
                    <option value="draft">📁 Draft</option>
                    <option value="proposed">🤝 Proposed</option>
                    <option value="active">📣 Active</option>
                    <option value="in_progress">⚙️ In Progress</option>
                    <option value="review">👀 Under Review</option>
                    <option value="completed">🏆 Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Highlights Grid column 1-2 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Progress Tracker card */}
              <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle size={14} className="text-teal-400" />
                    Operational Campaign Progress
                  </h3>
                  <span className="text-2xl font-black text-teal-400">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-[#12121a] rounded-full h-3 border border-white/5 p-0.5">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Progress increases as individual deliverables shift to <span className="text-teal-400">Posted</span> or <span className="text-purple-400">Approved</span>.
                </p>
              </div>

              {/* Deliverables Checklist Board */}
              <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-purple-400" />
                    Deliverables Checklist
                  </h3>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-teal-400 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Unit
                  </button>
                </div>

                {/* Expandable Add Deliverable Form */}
                {showAddForm && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAddDeliverableSubmit}
                    className="p-5 rounded-2xl glass-light border border-white/10 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                          Unit Title / Headline
                        </label>
                        <input
                          type="text"
                          required
                          value={newDelTitle}
                          onChange={(e) => setNewDelTitle(e.target.value)}
                          placeholder="e.g. Host Campus Food Walk Reels"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                          Platform type
                        </label>
                        <select
                          value={newDelType}
                          onChange={(e) => setNewDelType(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/5 text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                        >
                          <option value="reel">Instagram Reel</option>
                          <option value="story">Instagram Story</option>
                          <option value="carousel">Instagram Carousel</option>
                          <option value="event_coverage">Live Event Coverage</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                        Operational Briefing Notes
                      </label>
                      <textarea
                        value={newDelNotes}
                        onChange={(e) => setNewDelNotes(e.target.value)}
                        placeholder="e.g. Focus on campus cafe student discount loops, add location geotag tags..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none transition-all"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/5 text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingDeliverable}
                        className="px-5 py-2.5 rounded-xl bg-teal-500 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {addingDeliverable ? "Adding..." : "Provision Deliverable"}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Deliverables List */}
                {campaign.deliverables.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-400">No deliverables pre-provisioned. Use "Add Unit" to set custom reels.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaign.deliverables.map((del) => (
                      <div
                        key={del.id}
                        className="p-5 rounded-2xl glass-light border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-all group relative overflow-hidden"
                      >
                        {savingDeliverableId === del.id && (
                          <div className="absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-teal-500"></div>
                          </div>
                        )}

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-white text-sm">
                              {del.title}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              {del.deliverableType}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {del.platform}
                            </span>
                          </div>

                          {del.notes && (
                            <p className="text-xs text-gray-500 italic max-w-lg">
                              "{del.notes}"
                            </p>
                          )}

                          {/* IG URL Attachment Panel */}
                          {activeLinkId === del.id ? (
                            <div className="flex items-center gap-2 mt-3 w-full max-w-md animate-in fade-in slide-in-from-top-1 duration-200">
                              <input
                                type="text"
                                value={tempLinkValue}
                                onChange={(e) => setTempLinkValue(e.target.value)}
                                placeholder="Paste Instagram Reel / Post URL..."
                                className="flex-1 px-3 py-1.5 bg-[#0a0a0f] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                              <button
                                onClick={() => handleAttachLink(del.id)}
                                className="px-3 py-1.5 rounded-lg bg-teal-500 text-black text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Save size={12} />
                                Attach
                              </button>
                              <button
                                onClick={() => {
                                  setActiveLinkId(null);
                                  setTempLinkValue("");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-400 hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                              {del.linkUrl ? (
                                <a
                                  href={del.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1.5 bg-pink-500/5 px-2.5 py-1 rounded-lg border border-pink-500/10 transition-colors"
                                >
                                  <Instagram size={12} className="text-pink-500" />
                                  Instagram Link
                                </a>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveLinkId(del.id);
                                    setTempLinkValue("");
                                  }}
                                  className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 bg-teal-500/5 px-2.5 py-1 rounded-lg border border-teal-500/10 cursor-pointer transition-all"
                                >
                                  <Link size={12} />
                                  Attach Content Link
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Deliverable Status Selectors */}
                        <div className="flex items-center gap-2">
                          <select
                            value={del.status.toLowerCase()}
                            onChange={(e) => handleDeliverableStatusChange(del.id, e.target.value)}
                            className="bg-[#0a0a0f] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/5 focus:outline-none cursor-pointer"
                          >
                            <option value="planned">📋 Planned</option>
                            <option value="shooting">🎥 Shooting</option>
                            <option value="editing">✂️ Editing</option>
                            <option value="ready">✅ Ready</option>
                            <option value="posted">📣 Posted</option>
                            <option value="approved">🏆 Approved</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Metadata Side Card Column 3 */}
            <div className="lg:col-span-1 space-y-6">
              {/* Campaign Quick Specs */}
              <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3">
                  Collaboration Specifications
                </h3>

                <div className="space-y-4">
                  {/* Budget band */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Negotiated Budget</span>
                      <span className="text-sm font-extrabold text-white">₹{getSafeBudget(campaign.budget).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Objective */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Primary Objective</span>
                      <span className="text-sm font-semibold text-white capitalize">{campaign.objective || "Brand Reach"}</span>
                    </div>
                  </div>

                  {/* Timeline Dates */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Active Duration</span>
                      <span className="text-xs font-semibold text-white">
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "TBD"} -{" "}
                        {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Portal Access Card */}
              <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users size={14} className="text-teal-400" />
                    Client Portal Access
                  </span>
                  {campaign.owner && (
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20 font-extrabold uppercase tracking-wider animate-pulse">
                      Active
                    </span>
                  )}
                </h3>

                {campaign.owner && !showMappingPanel ? (
                  <div className="space-y-4">
                    {/* Display current owner */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center font-bold text-black text-sm uppercase">
                          {campaign.owner.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate">{campaign.owner.fullName}</h4>
                          <p className="text-[10px] text-gray-400 truncate">{campaign.owner.email}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">Access Tier</span>
                        <span className="text-teal-400 font-bold">Client Portal Dashboard</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOwnerId(campaign.ownerId || "");
                        setShowMappingPanel(true);
                      }}
                      className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs text-gray-300 font-bold transition-all cursor-pointer text-center hover:bg-white/10"
                    >
                      Change Assigned Owner
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Display unmapped warning or mapping panel */}
                    {!campaign.owner && (
                      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-300 text-xs leading-relaxed">
                        <div className="flex gap-2 items-start font-medium">
                          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <span>
                            Client Portal is currently unmapped. Assign a registered client user to activate portal updates.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Select Registered Client User
                      </label>
                      <select
                        value={selectedOwnerId}
                        onChange={(e) => setSelectedOwnerId(e.target.value)}
                        className="w-full bg-[#0a0a0f] text-xs text-white px-3.5 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
                        disabled={loadingClients || mappingOwner}
                      >
                        <option value="">-- Select Client User --</option>
                        {clientUsers.map((cu) => (
                          <option key={cu.id} value={cu.id}>
                            {cu.fullName} ({cu.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMapClientSubmit(selectedOwnerId)}
                        disabled={mappingOwner}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-black text-xs font-bold transition-all cursor-pointer hover:shadow-lg hover:shadow-teal-500/10 disabled:opacity-50 text-center"
                      >
                        {mappingOwner ? "Updating Portal..." : campaign.owner ? "Update Owner" : "Assign Portal Owner"}
                      </button>

                      {campaign.owner && (
                        <button
                          onClick={() => {
                            setShowMappingPanel(false);
                            setSelectedOwnerId(campaign.ownerId || "");
                          }}
                          className="py-3 px-4 rounded-xl border border-white/10 bg-[#0a0a0f] text-xs text-gray-400 font-bold hover:text-white transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram/Meta Connection Card */}
              <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Instagram size={14} className="text-pink-500" />
                    Instagram Insights Link
                  </span>
                  {instagramAccount && (
                    <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-extrabold uppercase tracking-wider">
                      Linked
                    </span>
                  )}
                </h3>

                {loadingInstagram ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : instagramAccount ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                        {instagramAccount.profilePictureUrl ? (
                          <img
                            src={instagramAccount.profilePictureUrl}
                            alt={instagramAccount.username}
                            className="w-10 h-10 rounded-full border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm uppercase">
                            {instagramAccount.username.substring(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate">@{instagramAccount.username}</h4>
                          <p className="text-[10px] text-gray-400 truncate">{instagramAccount.displayName || "Instagram Creator"}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">Followers</span>
                        <span className="text-pink-400 font-bold">{instagramAccount.followersCount?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">Linked Facebook Page</span>
                        <span className="text-gray-300 font-semibold truncate max-w-[120px]">{instagramAccount.pageName || "Linked Page"}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleConnectInstagram}
                      disabled={connectingInstagram}
                      className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs text-gray-300 font-bold transition-all cursor-pointer text-center hover:bg-white/10"
                    >
                      {connectingInstagram ? "Reconnecting..." : "Reconnect Instagram Profile"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-pink-500/5 border border-pink-500/15 text-pink-300 text-xs leading-relaxed">
                      <div className="flex gap-2 items-start font-medium">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        <span>
                          No Instagram profile linked to this client's organization. Connect page to sync campaign views, reach, and organic reels.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleConnectInstagram}
                      disabled={connectingInstagram}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold transition-all cursor-pointer hover:shadow-lg hover:shadow-pink-500/10 disabled:opacity-50 text-center flex items-center justify-center gap-2"
                    >
                      <Instagram size={14} />
                      {connectingInstagram ? "Initializing..." : "Link Instagram Profile"}
                    </button>
                  </div>
                )}
              </div>

              {/* Briefing Deck Card */}
              <div className="glass rounded-3xl p-6 border border-white/5">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
                  Collaboration Goals Brief
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {campaign.brief || "No brief was compiled for this collaboration."}
                </p>
              </div>

              {/* Internal Operations Notes Card */}
              <div className="glass rounded-3xl p-6 border border-white/5">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
                  Internal Ops Notes
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {campaign.internalNotes || "No internal CRM notes linked to campaign briefcase."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
