"use client";

import { PublicService } from "@/lib/content";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock } from "lucide-react";
import { useState } from "react";

type ContactProps = {
  services: PublicService[];
};

export function Contact({ services }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    instagramHandle: "",
    service: "",
    budget: "",
    message: "",
    honeypot: "",
  });
  const [submissionState, setSubmissionState] = useState<{
    loading: boolean;
    message: string | null;
    error: boolean;
  }>({
    loading: false,
    message: null,
    error: false,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState({ loading: true, message: null, error: false });

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.company,
          instagramHandle: formData.instagramHandle,
          serviceSlug: formData.service,
          budgetBand: formData.budget,
          message: formData.message,
          source: "contact_form",
          honeypot: formData.honeypot,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to submit your inquiry.");
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        instagramHandle: "",
        service: "",
        budget: "",
        message: "",
        honeypot: "",
      });
      setSubmissionState({
        loading: false,
        message:
          "Thanks for reaching out. Your inquiry has been submitted and we’ll get back to you shortly.",
        error: false,
      });
    } catch (error) {
      setSubmissionState({
        loading: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your inquiry right now.",
        error: true,
      });
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block px-4 py-2 rounded-full glass-light mb-6">
              Get In Touch
            </div>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
              Collaborate With
              <br />
              <span className="text-gradient">The Kharagpur Wala</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Ready to promote your local business, cafe, or event to our 4M+ monthly
              reach? Let&apos;s connect.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full gradient-purple-teal flex items-center justify-center mb-4">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-xl mb-2">WhatsApp</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Fastest way to reach us. We respond within minutes.
                </p>
                <a
                  href="https://wa.me/919239063990"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                >
                  +91 92390 63990
                  <MessageCircle size={16} />
                </a>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full gradient-purple-gold flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl mb-2">Email</h3>
                <p className="text-gray-400 text-sm mb-4">
                  For detailed inquiries and proposals.
                </p>
                <a
                  href="mailto:promotionthekharagpurwala@gmail.com"
                  className="text-purple-400 hover:text-purple-300 transition-colors break-all"
                >
                  promotionthekharagpurwala@gmail.com
                </a>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full gradient-teal-purple flex items-center justify-center mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl mb-2">Phone</h3>
                <p className="text-gray-400 text-sm mb-4">Mon-Sat, 10 AM - 7 PM IST</p>
                <a
                  href="tel:+919239063990"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  +91 92390 63990
                </a>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full gradient-purple-teal flex items-center justify-center mb-4">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl mb-2">Office</h3>
                <p className="text-gray-400 text-sm">
                  Paschim Midnapore, West Bengal
                  <br />
                  India
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 glass rounded-3xl p-8 md:p-12"
            >
              <h2 className="text-3xl mb-2">Book Your Campaign / Collaboration</h2>
              <p className="text-gray-400 mb-8">
                Fill out the form below and we&apos;ll get back to you to map out your
                campaign.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Instagram Handle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="+91 92390 63990"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Instagram Handle / Username *</label>
                    <input
                      type="text"
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="@your_brand"
                    />
                  </div>
                </div>

                {/* Row 3: Company/Brand Name & Service Interested In */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Company/Brand Name *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Your Brand"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Service Interested In *</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.slug} value={service.slug}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Campaign Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Campaign Budget *</label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="">Select your budget</option>
                      <option value="starter">Under ₹5,000</option>
                      <option value="growth">₹5,000 - ₹15,000</option>
                      <option value="scale">₹15,000 - ₹30,000</option>
                      <option value="ambassador">₹30,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Tell Us About Your Goals</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl glass-light focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    placeholder="What are your main goals? What challenges are you facing?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submissionState.loading}
                  className="w-full md:w-auto px-8 py-4 rounded-full gradient-purple-teal hover:glow-purple transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submissionState.loading ? "Sending..." : "Send Message"}
                  <Send size={20} />
                </button>
              </form>

              {submissionState.message && (
                <p
                  className={`mt-6 text-sm ${
                    submissionState.error ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {submissionState.message}
                </p>
              )}

              <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
                <Clock size={18} className="text-green-400" />
                <span>We typically respond within 24 hours</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl mb-4">
              Prefer to Chat on <span className="text-gradient">WhatsApp?</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Get instant responses and quick answers to your questions.
            </p>
            <a
              href="https://wa.me/919239063990"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#25D366] hover:shadow-2xl transition-all"
            >
              <MessageCircle size={20} />
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
