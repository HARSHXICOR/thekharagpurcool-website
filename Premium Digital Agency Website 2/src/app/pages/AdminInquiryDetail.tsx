"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Sparkles, ArrowLeft, Instagram, Mail, Phone, Calendar, MessageCircle, Info, Bookmark, Save } from "lucide-react";

type InquiryDetail = {
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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  service?: { name: string; slug: string } | null;
  organizationId?: string | null;
  organization?: { id: string; name: string; slug: string } | null;
  campaigns?: { id: string; name: string }[] | null;
};

type AdminInquiryDetailProps = {
  id: string;
};

export function AdminInquiryDetail({ id }: AdminInquiryDetailProps) {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();

  // Inquiry states
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Status updates
  const [statusValue, setStatusValue] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Notes persistence
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Campaign conversion modal states
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignBudget, setCampaignBudget] = useState(15000);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDeliverables, setSelectedDeliverables] = useState({
    reel: true,
    story: true,
    post: true,
  });
  const [converting, setConverting] = useState(false);

  // Client mapping states
  const [clientUsers, setClientUsers] = useState<{ id: string; email: string; fullName: string }[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [loadingClients, setLoadingClients] = useState(false);

  // Helper to open the conversion modal with sensible defaults
  const openConversionModal = async () => {
    if (!inquiry) return;
    setCampaignName(inquiry.companyName ? `${inquiry.companyName} Campaign` : `${inquiry.name} Brand Campaign`);
    
    let defaultBudget = 15000;
    if (inquiry.budgetBand === "starter") defaultBudget = 5000;
    else if (inquiry.budgetBand === "growth") defaultBudget = 15000;
    else if (inquiry.budgetBand === "scale") defaultBudget = 35000;
    setCampaignBudget(defaultBudget);

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const formattedLater = thirtyDaysLater.toISOString().split("T")[0];

    setStartDate(formattedToday);
    setEndDate(formattedLater);

    // Fetch registered clients for dynamic mapping dropdown
    setLoadingClients(true);
    try {
      const res = await fetchWithAuth("/api/admin/users/clients");
      if (res.ok) {
        const list = await res.json();
        setClientUsers(list);
        
        // Auto-match client user if email matches the inquiry contact email
        const matched = list.find(
          (u: any) => u.email.toLowerCase() === inquiry.email.toLowerCase()
        );
        if (matched) {
          setSelectedOwnerId(matched.id);
        } else {
          setSelectedOwnerId("");
        }
      }
    } catch (err) {
      console.error("Failed to load client users list:", err);
    } finally {
      setLoadingClients(false);
    }

    setShowConvertModal(true);
  };

  // Convert Inquiry to Campaign execution flow
  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry) return;
    setConverting(true);

    try {
      let activeOrgId = inquiry.organizationId || (inquiry.organization as any)?.id;
      
      // If organization does not exist, first transition status to "confirmed" to auto-provision it
      if (!activeOrgId) {
        const patchRes = await fetchWithAuth(`/api/admin/inquiries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "confirmed" }),
        });

        if (!patchRes.ok) {
          const errPayload = await patchRes.json();
          throw new Error(errPayload.message || "Failed to auto-provision brand organization.");
        }

        const updatedInquiry = await patchRes.json();
        activeOrgId = updatedInquiry.organizationId || (updatedInquiry.organization as any)?.id;
        
        setInquiry(updatedInquiry);
        setStatusValue("confirmed");
      }

      if (!activeOrgId) {
        throw new Error("Brand organization could not be provisioned. Please set a Company Name on this inquiry first.");
      }

      // Create Campaign
      const campaignPayload = {
        organizationId: activeOrgId,
        inquiryId: inquiry.id,
        name: campaignName,
        campaignType: "paid_promotion",
        status: "active",
        budget: Number(campaignBudget),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        objective: "reach",
        brief: inquiry.message || "",
        internalNotes: inquiry.notes || "",
        ownerId: selectedOwnerId || undefined,
      };

      const campaignRes = await fetchWithAuth("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignPayload),
      });

      const newCampaign = await campaignRes.json();

      if (!campaignRes.ok) {
        throw new Error(newCampaign.message || "Failed to create campaign.");
      }

      const campaignId = newCampaign.id;
      const deliverableRequests: any[] = [];

      if (selectedDeliverables.reel) {
        deliverableRequests.push({
          deliverableType: "reel",
          title: "Custom Promo Reel",
          status: "planned",
          platform: "instagram",
          notes: "Scheduled brand promo campaign reel",
        });
      }
      if (selectedDeliverables.story) {
        deliverableRequests.push({
          deliverableType: "story",
          title: "Interactive Story Loop",
          status: "planned",
          platform: "instagram",
          notes: "Story sequence with active link attachment",
        });
      }
      if (selectedDeliverables.post) {
        deliverableRequests.push({
          deliverableType: "carousel",
          title: "Static Brand Post",
          status: "planned",
          platform: "instagram",
          notes: "Grid static post or Carousel showcasing aesthetics",
        });
      }

      for (const d of deliverableRequests) {
        const delRes = await fetchWithAuth(`/api/admin/campaigns/${campaignId}/deliverables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(d),
        });
        if (!delRes.ok) {
          console.error("Failed to pre-provision deliverable:", d.title);
        }
      }

      // Redirect to new campaign ops control center
      router.push(`/admin/campaigns/${campaignId}`);
    } catch (err: any) {
      alert(err.message || "Campaign conversion failed.");
    } finally {
      setConverting(false);
      setShowConvertModal(false);
    }
  };

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

  // Load Inquiry Detail
  const loadDetail = useCallback(async () => {
    setLoadingDetail(true);
    setFetchError(null);
    try {
      const response = await fetchWithAuth(`/api/admin/inquiries/${id}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to retrieve inquiry details.");
      }

      setInquiry(payload);
      setStatusValue(payload.status || "new");
      setNotesValue(payload.notes || "");
    } catch (err: any) {
      setFetchError(err.message || "Unable to load this inquiry profile.");
    } finally {
      setLoadingDetail(false);
    }
  }, [id, fetchWithAuth]);

  useEffect(() => {
    if (user && ["super_admin", "admin", "account_manager"].includes(user.defaultRole)) {
      loadDetail();
    }
  }, [loadDetail, user]);

  // Handle Pipeline Status Transition
  const handleStatusChange = async (newStatus: string) => {
    if (!inquiry) return;
    setStatusValue(newStatus);
    setUpdatingStatus(true);
    try {
      const response = await fetchWithAuth(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || "Unable to update status.");
      }

      setInquiry((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      alert(err.message || "Status transaction failed.");
      setStatusValue(inquiry.status); // revert
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Persist Internal Notes
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const response = await fetchWithAuth(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || "Unable to write notes to database.");
      }

      setSaveSuccess(true);
      setInquiry((prev) => prev ? { ...prev, notes: notesValue } : null);
      
      // Clear success alert after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Persisting notes failed.");
    } finally {
      setSavingNotes(false);
    }
  };

  // WhatsApp Deep-Link Generator
  const getWhatsAppLink = (phone: string) => {
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned; // Default Indian region code
    }
    return `https://wa.me/${cleaned}`;
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

  if (loadingDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Accessing lead context records...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !inquiry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="max-w-md w-full glass rounded-3xl p-8 border border-white/5 text-center">
          <h2 className="text-red-400 text-lg font-bold mb-3">Lookup Failed</h2>
          <p className="text-sm text-gray-400 mb-6">{fetchError || "Inquiry profile does not exist."}</p>
          <button
            onClick={() => router.push("/admin/inquiries")}
            className="px-6 py-3 rounded-full gradient-purple-teal hover:glow-purple text-xs font-bold transition-all cursor-pointer"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-24">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push("/admin/inquiries")}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Command Center
          </button>

          {/* Heading block */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 glass-light px-3 py-1.5 rounded-full mb-3">
                <Sparkles size={12} className="text-teal-400" />
                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Lead Details Control</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                {inquiry.companyName || inquiry.name}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Lead ID: {inquiry.id} • Received on {new Date(inquiry.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Workflow Control Box */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="glass px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Pipeline:</span>
                <div className="relative">
                  {updatingStatus && (
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  )}
                  <select
                    value={statusValue}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="bg-[#12121a] text-white text-xs font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer appearance-none pr-8"
                  >
                    <option value="new">🆕 New</option>
                    <option value="contacted">📞 Contacted</option>
                    <option value="negotiating">🤝 Negotiating</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="running">📣 Running</option>
                    <option value="completed">🏆 Completed</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>

              {inquiry.campaigns && inquiry.campaigns.length > 0 ? (
                <button
                  onClick={() => router.push(`/admin/campaigns/${inquiry.campaigns![0].id}`)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-purple-600 hover:glow-purple text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-black" />
                  View Campaign
                </button>
              ) : (statusValue === "confirmed" || statusValue === "running" || statusValue === "completed") ? (
                <button
                  onClick={openConversionModal}
                  className="px-5 py-3 rounded-2xl bg-[#12121a] hover:bg-[#1a1a24] text-white border border-white/10 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-teal-400 animate-pulse" />
                  Convert to Campaign
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Contacts Column (Grid col 1) */}
            <div className="md:col-span-1 space-y-6">
              <div className="glass rounded-3xl p-6 border border-white/5">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  {/* Name Info */}
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Contact Person</span>
                    <span className="text-sm font-semibold text-white">{inquiry.name}</span>
                  </div>

                  {/* WhatsApp Quick Action */}
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Phone Number</span>
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="text-sm font-semibold text-white hover:text-teal-400 transition-colors block mb-2"
                    >
                      {inquiry.phone}
                    </a>
                    <a
                      href={getWhatsAppLink(inquiry.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] text-[10px] font-bold tracking-wide uppercase transition-all"
                    >
                      <MessageCircle size={12} />
                      WhatsApp Chat
                    </a>
                  </div>

                  {/* Email Action */}
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Business Email</span>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-sm font-semibold text-white hover:text-purple-400 transition-colors break-all"
                    >
                      {inquiry.email}
                    </a>
                  </div>

                  {/* Instagram handle click */}
                  {inquiry.instagramHandle && (
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Instagram Account</span>
                      <a
                        href={`https://instagram.com/${cleanInstagramHandle(inquiry.instagramHandle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        <Instagram size={14} />
                        {inquiry.instagramHandle}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualifiers Card */}
              <div className="glass rounded-3xl p-6 border border-white/5">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
                  Lead Qualifiers
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Allocated Budget</span>
                    <span className="text-sm font-bold text-yellow-400 capitalize">{inquiry.budgetBand}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Service Requested</span>
                    <span className="text-sm font-semibold text-white">
                      {inquiry.service ? inquiry.service.name : "Custom Strategy Session"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Acquisition Source</span>
                    <span className="text-xs font-semibold text-gray-300 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5 inline-block mt-0.5">
                      {inquiry.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Goals & Note Persister Column (Grid col 2-3) */}
            <div className="md:col-span-2 space-y-6">
              {/* Client Goals Statement */}
              <div className="glass rounded-3xl p-6 md:p-8 border border-white/5">
                <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
                  Client Collaboration Goals
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {inquiry.message || "No goals message was provided by the brand client."}
                </p>
              </div>

              {/* Internal Notes Panel */}
              <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-4 relative">
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-2">
                  <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <Bookmark size={14} className="text-teal-400" />
                    Internal CRM Notes
                  </h3>
                  
                  {/* Indicator States */}
                  {saveSuccess && (
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 border border-green-500/10 px-2.5 py-0.5 rounded-full">
                      Saved Successfully
                    </span>
                  )}
                  {saveError && (
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/10 px-2.5 py-0.5 rounded-full">
                      Save Failed
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Keep track of pricing agreements, campaign timeline discussions, or custom reel requirements.
                </p>

                {saveError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold text-center">
                    {saveError}
                  </div>
                )}

                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  disabled={savingNotes}
                  rows={6}
                  placeholder="Example: Wants student food focus fests near IIT campus. Negotiating price to ₹15,000 for 1 Reel and 1 Story package..."
                  className="w-full px-4 py-3 rounded-xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none transition-all duration-300"
                />

                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-6 py-3 rounded-xl gradient-teal-purple hover:glow-teal text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all ml-auto"
                >
                  {savingNotes ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Notes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Conversion Modal Overlay */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass rounded-3xl p-8 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="text-teal-400" size={20} />
                Convert to Campaign
              </h2>
              <button
                onClick={() => setShowConvertModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleConvertSubmit} className="space-y-5">
              {/* Campaign Name */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Cafe Mocha Launch Campaign"
                  className="w-full px-4 py-3 rounded-xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>

              {/* Assign Client Owner */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1 flex items-center justify-between">
                  <span>Assign Client Portal Owner</span>
                  {loadingClients && (
                    <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider animate-pulse">Scanning DB...</span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#12121a] border border-white/5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all cursor-pointer appearance-none pr-10"
                  >
                    <option value="">⚠️ Unassigned (Assign Client Account Later)</option>
                    {clientUsers.map((client) => (
                      <option key={client.id} value={client.id}>
                        👤 {client.fullName} ({client.email})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 italic block ml-1">
                  Assigning a client automatically provisions their brand membership for instant dashboard access.
                </p>
              </div>

              {/* Suggested Budget & Custom Override */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Negotiated Budget (INR)
                </label>
                <input
                  type="number"
                  required
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(Number(e.target.value))}
                  placeholder="e.g. 15000"
                  className="w-full px-4 py-3 rounded-xl glass-light border border-white/5 focus:border-teal-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                />
                
                {/* Budget Band Suggestions */}
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setCampaignBudget(5000)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      campaignBudget === 5000
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    Starter (₹5k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampaignBudget(15000)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      campaignBudget === 15000
                        ? "bg-teal-500/20 border-teal-500/50 text-teal-300"
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    Growth (₹15k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampaignBudget(35000)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      campaignBudget === 35000
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    Scale (₹35k)
                  </button>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-light border border-white/5 focus:border-teal-500/30 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all cursor-pointer bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-light border border-white/5 focus:border-teal-500/30 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Deliverables Pre-provision Checkboxes */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block ml-1">
                  Provision Campaign Deliverables
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl glass-light border border-white/5 cursor-pointer select-none hover:bg-white/5 transition-all text-xs font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedDeliverables.reel}
                      onChange={(e) =>
                        setSelectedDeliverables((prev) => ({
                          ...prev,
                          reel: e.target.checked,
                        }))
                      }
                      className="rounded bg-[#12121a] border-white/10 text-teal-500 focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    Promo Reel
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl glass-light border border-white/5 cursor-pointer select-none hover:bg-white/5 transition-all text-xs font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedDeliverables.story}
                      onChange={(e) =>
                        setSelectedDeliverables((prev) => ({
                          ...prev,
                          story: e.target.checked,
                        }))
                      }
                      className="rounded bg-[#12121a] border-white/10 text-teal-500 focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    Story Loop
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl glass-light border border-white/5 cursor-pointer select-none hover:bg-white/5 transition-all text-xs font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedDeliverables.post}
                      onChange={(e) =>
                        setSelectedDeliverables((prev) => ({
                          ...prev,
                          post: e.target.checked,
                        }))
                      }
                      className="rounded bg-[#12121a] border-white/10 text-teal-500 focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    Static Post
                  </label>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={converting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-purple-600 hover:glow-teal text-black text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 mt-4"
              >
                {converting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                    Initiating Campaign Conversion...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Confirm & Start Campaign
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
