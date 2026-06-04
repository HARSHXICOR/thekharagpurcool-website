"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { 
  Target, Users, Zap, Award, TrendingUp, Heart, 
  Handshake, Car, Flame, Sparkles, Play, GraduationCap, Utensils, Megaphone 
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import kharagpurWalaAvatar from "../../imports/kharagpur_wala_avatar.png";

export function About() {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(0);

  const highlights = [
    {
      name: "Brand Collaborations",
      icon: Handshake,
      stats: "600+ Campaigns",
      brands: "Swiggy, Apple Resellers, Cool Culture",
      details: "Direct organic integration of brand messaging, product placement, and sponsored challenges into our highly active lifestyle narrative.",
    },
    {
      name: "Automobile Reviews",
      icon: Car,
      stats: "1.8M+ Views",
      brands: "KIA, Suzuki, Jawa, Honda BigWing, Ather, Harley-Davidson, Toyota, TVS, OM TVS",
      details: "Cinematic test drives, dealer showroom reviews, and local automobile fest coverages crafted for maximum torque on social feeds.",
    },
    {
      name: "Food Promotions",
      icon: Flame,
      stats: "+250% Footfall",
      brands: "Bong Pizza, China Town, Charminar, Fire Kissed Shawarma",
      details: "High-octane aesthetic food previews, taste tests, and custom coupon codes driving hundreds of hungry foodies directly to tables.",
    },
    {
      name: "Events & Festivals",
      icon: Sparkles,
      stats: "30K+ Tickets",
      brands: "Kharagpur Youth Festival, Local Fests",
      details: "Pre-event buzz generation, live event hosting, direct interactive crowd interviews, and stunning after-movies.",
    },
    {
      name: "Viral Reels",
      icon: Play,
      stats: "4M+ Reach",
      brands: "Trending Audios & Memes",
      details: "Custom high-performing short-form video content leveraging the latest Instagram algorithms and trending audio loops.",
    },
    {
      name: "Education Promotions",
      icon: GraduationCap,
      stats: "450K+ Students",
      brands: "Physics Wallah, Aakash Institute, Don Bosco",
      details: "Localized coaching drive walk-throughs, study motivation reels, campus updates, and educational campaign showcases.",
    },
    {
      name: "Restaurant Features",
      icon: Utensils,
      stats: "22+ Cafes",
      brands: "Local Paschim Midnapore Diners",
      details: "Immersive cafe ambiance tours, signature menu spotlights, and kitchen reveals that connect local restaurants with active foodies.",
    },
    {
      name: "Local Business Marketing",
      icon: Megaphone,
      stats: "120+ Partners",
      brands: "Mobile Bazar, Fashion Avenue, Local Shops",
      details: "Geo-targeted paschim midnapore campaigns, store launch coverages, and product showcases optimized for local search.",
    },
  ];
  const values = [
    {
      icon: Target,
      title: "Results-Driven",
      description: "We don't just create content. We create growth.",
    },
    {
      icon: Zap,
      title: "Tech-Enabled",
      description: "Powered by data, analytics, and cutting-edge tools.",
    },
    {
      icon: Heart,
      title: "Client-First",
      description: "Your success is our success. We're in this together.",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Excellence in every campaign, every post, every pixel.",
    },
  ];

  const founders = [
    {
      name: "The Kharagpur Wala",
      role: "Kharagpur Blogger & Digital Creator",
      bio: "Paschim Midnapore's leading blogger and digital creator. Specializes in Instagram promotions, brand collaborations, and high-impact reel content.",
      image: kharagpurWalaAvatar.src,
      instagram: "@the_kharagpur_wala_",
    },
  ];

  const milestones = [
    { year: "2021", achievement: "Launched @the_kharagpur_wala_ brand" },
    { year: "2022", achievement: "Reached 5K+ active followers & did first local cafe promotion" },
    { year: "2023", achievement: "Expanded to 15K+ followers with viral local memes & food review reels" },
    { year: "2024", achievement: "Completed 300+ collaborations and generated 2M+ organic reach" },
    { year: "2025", achievement: "Grew to 23K+ followers and Paschim Midnapore's leading blogger milestone" },
    { year: "2026", achievement: "Crossed 600+ brand integrations and launched our campaign analytics platform" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
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
              About The Kharagpur Wala
            </div>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
              About The Kharagpur Wala
              <br />
              We Turn Brands Into{" "}
              <span className="text-gradient">Movements</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              The Kharagpur Wala is one of Kharagpur’s leading digital creators and regional influencers, collaborating with major education institutes, automobile brands, restaurants, cafes, fashion stores, and local businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 md:p-12"
            >
              <h2 className="text-3xl md:text-4xl mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  The Kharagpur Wala is one of Kharagpur’s leading digital creators and regional influencers, bridging the gap between authentic creative storytelling and massive local outreach.
                </p>
                <p>
                  Built by <strong className="text-white">The Kharagpur Wala</strong>, who grew a dedicated following of 23K+ active followers from scratch, we offer brands direct access to Paschim Midnapore’s most engaged target audience.
                </p>
                <p>
                  We know what goes viral because we do it daily. We know what converts because we've generated a reach of over 4M+ across our accounts, delivering record footfalls and brand recalls.
                </p>
                <p>
                  Today, we're not just a digital creator. We're a growth partner for local businesses, cafes, coaching institutes, automobile brands, and lifestyle retailers looking to dominate the regional market.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instagram Highlights Categories */}
      <section className="py-24 bg-[#12121c]/50 relative overflow-hidden border-y border-white/5">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 rounded-full glass-light mb-4">
              Instagram Stories Showcase
            </div>
            <h2 className="text-4xl md:text-6xl mb-4 font-bold tracking-tight">
              Featured <span className="text-gradient">Highlights</span> Focus
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our core content pillars and campaign highlight reels. Tap a bubble to inspect recent results.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {/* Highlights (Horizontally scrollable on mobile, grid on desktop) */}
            <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-8 gap-4 md:gap-6 mb-16 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
              {highlights.map((hl, idx) => {
                const isSelected = activeHighlight === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveHighlight(idx)}
                    className="flex flex-col items-center gap-3 group focus:outline-none cursor-pointer flex-shrink-0"
                  >
                    {/* Story Circle */}
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] transition-all duration-300 ${
                      isSelected 
                        ? "bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 scale-105 glow-purple" 
                        : "bg-white/10 group-hover:bg-gradient-to-tr group-hover:from-purple-500/50 group-hover:to-teal-500/50"
                    }`}>
                      <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center border border-black text-gray-300 group-hover:text-white transition-colors">
                        <hl.icon size={26} className={isSelected ? "text-pink-400" : ""} />
                      </div>
                    </div>
                    {/* Caption */}
                    <span className={`text-[10px] md:text-xs text-center font-medium max-w-[90px] tracking-tight leading-tight transition-colors ${
                      isSelected ? "text-pink-400 font-semibold" : "text-gray-400 group-hover:text-white"
                    }`}>
                      {hl.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Highlight Details Display Card */}
            {activeHighlight !== null && (
              <motion.div
                key={activeHighlight}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 md:p-10 border border-pink-500/10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="inline-block px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold mb-4 tracking-wider uppercase">
                      Campaign Focus
                    </div>
                    <h3 className="text-3xl mb-4 font-bold text-white">{highlights[activeHighlight].name}</h3>
                    <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
                      {highlights[activeHighlight].details}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Key Partners:</span>
                      {highlights[activeHighlight].brands.split(", ").map((brand, bidx) => (
                        <span key={bidx} className="px-3 py-1 rounded-full glass-light text-xs font-medium text-gray-300">
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="glass-light rounded-2xl p-6 text-center border border-white/5 flex flex-col justify-center items-center">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mb-3">
                      <TrendingUp size={24} />
                    </div>
                    <div className="text-3xl font-extrabold text-white mb-1">
                      {highlights[activeHighlight].stats}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold tracking-widest uppercase">
                      Campaign Metrics
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4">
              Our <span className="text-gradient">Values</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The principles that guide every campaign, every strategy, every decision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full gradient-purple-teal flex items-center justify-center mx-auto mb-4">
                  <value.icon size={28} />
                </div>
                <h3 className="text-xl mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4">
              Meet The <span className="text-gradient">Creator</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The mind behind The Kharagpur Wala.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="glass rounded-3xl p-8 text-center"
              >
                <ImageWithFallback
                  src={founder.image}
                  alt={founder.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-2xl mb-2">{founder.name}</h3>
                <div className="text-purple-400 mb-4">{founder.role}</div>
                <p className="text-gray-400 mb-4">{founder.bio}</p>
                <a 
                  href="https://www.instagram.com/the_kharagpur_wala_/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {founder.instagram}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4">
              Our <span className="text-gradient">Journey</span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute md:left-1/2 left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-teal-500 to-yellow-500" />
              
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex md:items-center items-start gap-8 mb-12 relative flex-row ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } pl-8 md:pl-0`}
                >
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "text-left md:text-right" : "text-left"}`}>
                    <div className="glass-light rounded-xl p-6 inline-block text-left">
                      <div className="text-3xl text-gradient mb-2">{milestone.year}</div>
                      <div className="text-gray-300">{milestone.achievement}</div>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 absolute md:relative md:left-auto left-[7px] z-10" />
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
