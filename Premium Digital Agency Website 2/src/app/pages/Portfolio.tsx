"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { 
  TrendingUp, Users, Heart, Eye, ArrowUpRight, 
  GraduationCap, Car, Flame, ShoppingBag, Sparkles 
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [partnerFilter, setPartnerFilter] = useState("All");
  
  const categories = [
    "All", 
    "Brand Collaborations", 
    "Automobile Reviews", 
    "Education Promotions", 
    "Food Reviews", 
    "Instagram Promotions",
    "Local Marketing", 
    "Event Promotions"
  ];

  const brandPartners = [
    // Education & Coaching
    { name: "Physics Wallah", category: "Education & Coaching", services: "Reels, Student Outreach", icon: GraduationCap, color: "text-yellow-400" },
    { name: "Aakash Institute", category: "Education & Coaching", services: "Coaching Center Promo", icon: GraduationCap, color: "text-yellow-400" },
    { name: "Don Bosco", category: "Education & Coaching", services: "Event Coverage, Campus Walk", icon: GraduationCap, color: "text-yellow-400" },
    // Automobile
    { name: "KIA", category: "Automobile", services: "SUV Launch Reel", icon: Car, color: "text-teal-400" },
    { name: "Suzuki", category: "Automobile", services: "Cinematic Test Rides", icon: Car, color: "text-teal-400" },
    { name: "Jawa", category: "Automobile", services: "Retro Cruiser Campaign", icon: Car, color: "text-purple-400" },
    { name: "Honda BigWing", category: "Automobile", services: "Premium Bike Reviews", icon: Car, color: "text-indigo-400" },
    { name: "Ather Energy", category: "Automobile", services: "EV Scooter Showcase", icon: Sparkles, color: "text-green-400" },
    { name: "Harley-Davidson", category: "Automobile", services: "High-octane Ride Reel", icon: Car, color: "text-red-400" },
    { name: "Toyota", category: "Automobile", services: "Family SUV Features", icon: Car, color: "text-blue-400" },
    { name: "TVS", category: "Automobile", services: "Youth Scooter Reviews", icon: Car, color: "text-sky-400" },
    { name: "OM TVS", category: "Automobile", services: "Local Showroom Promos", icon: Car, color: "text-violet-400" },
    // Cafe & Restaurant
    { name: "Swiggy", category: "Cafe & Restaurant", services: "Food Delivery Campaigns", icon: Flame, color: "text-orange-400" },
    { name: "China Town", category: "Cafe & Restaurant", services: "Aesthetic Food Review", icon: Flame, color: "text-amber-400" },
    { name: "Bong Pizza", category: "Cafe & Restaurant", services: "Signature Menu Spotlight", icon: Flame, color: "text-red-400" },
    { name: "Charminar", category: "Cafe & Restaurant", services: "Dine-in Vibe Promotion", icon: Flame, color: "text-rose-400" },
    { name: "Fire Kissed Shawarma", category: "Cafe & Restaurant", services: "Viral Shawarma Reels", icon: Flame, color: "text-yellow-500" },
    // Retail & Lifestyle
    { name: "Apple Resellers", category: "Retail & Lifestyle", services: "iPhone Launch Giveaways", icon: ShoppingBag, color: "text-slate-400" },
    { name: "Cool Culture", category: "Retail & Lifestyle", services: "Streetwear Brand Collab", icon: ShoppingBag, color: "text-pink-400" },
    { name: "Resort Paradise", category: "Retail & Lifestyle", services: "Luxury Staycation Vlogs", icon: ShoppingBag, color: "text-emerald-400" },
    { name: "Mobile Bazar", category: "Retail & Lifestyle", services: "Paschim Midnapore Retail", icon: ShoppingBag, color: "text-cyan-400" },
    { name: "Fashion Avenue", category: "Retail & Lifestyle", services: "Seasonal Outfit Reels", icon: ShoppingBag, color: "text-fuchsia-400" },
  ];

  const projects = [
    {
      client: "Physics Wallah (Paschim Midnapore Launch)",
      category: "Education Promotions",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
      before: {
        followers: "2K",
        engagement: "1.2%",
        reach: "12K/mo",
      },
      after: {
        followers: "18K",
        engagement: "11.5%",
        reach: "450K/mo",
      },
      growth: {
        followers: "+800% Followers",
        engagement: "+858% Engagement",
        reach: "+3,650% Reach",
      },
      duration: "1 month",
      services: ["Education Promotions", "Reel Promotions", "Student Outreach", "Campus Walkthroughs"],
    },
    {
      client: "Suzuki & Honda BigWing (Local Showcase)",
      category: "Automobile Reviews",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop",
      before: {
        followers: "1.5K",
        engagement: "1.9%",
        reach: "15K/mo",
      },
      after: {
        followers: "14K",
        engagement: "12.8%",
        reach: "320K/mo",
      },
      growth: {
        followers: "+833% Followers",
        engagement: "+573% Engagement",
        reach: "+2,033% Reach",
      },
      duration: "6 weeks",
      services: ["Automobile Reviews", "Cinematic Reels", "Dealer Showroom Walkthroughs"],
    },
    {
      client: "KGP Gold Gym",
      category: "Instagram Promotions",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      before: {
        followers: "1.2K",
        engagement: "2.1%",
        reach: "15K/mo",
      },
      after: {
        followers: "8.5K",
        engagement: "9.4%",
        reach: "420K/mo",
      },
      growth: {
        followers: "+608% Followers",
        engagement: "+347% Engagement",
        reach: "+2,700% Reach",
      },
      duration: "2 months",
      services: ["Instagram Promotions", "Reel Promotions", "Audience Targeting"],
    },
    {
      client: "Cafe Mocha Kharagpur",
      category: "Food Reviews",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
      before: {
        followers: "200",
        engagement: "1.5%",
        reach: "2K/mo",
      },
      after: {
        followers: "6.8K",
        engagement: "12.3%",
        reach: "380K/mo",
      },
      growth: {
        followers: "+3,300% Followers",
        engagement: "+720% Engagement",
        reach: "+18,900% Reach",
      },
      duration: "1 month",
      services: ["Food Reviews", "Cinematic Reels", "Local Business Marketing"],
    },
    {
      client: "Paschim Midnapore Handloom Co.",
      category: "Brand Collaborations",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
      before: {
        followers: "3K",
        engagement: "1.8%",
        reach: "25K/mo",
      },
      after: {
        followers: "12K",
        engagement: "7.8%",
        reach: "560K/mo",
      },
      growth: {
        followers: "+300% Followers",
        engagement: "+333% Engagement",
        reach: "+2,140% Reach",
      },
      duration: "3 months",
      services: ["Brand Collaborations", "Instagram Promotions", "Product Placement"],
    },
    {
      client: "Kharagpur Youth Festival",
      category: "Event Promotions",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      before: {
        followers: "500",
        engagement: "0.9%",
        reach: "5K/mo",
      },
      after: {
        followers: "4.5K",
        engagement: "14.1%",
        reach: "680K/mo",
      },
      growth: {
        followers: "+800% Followers",
        engagement: "+1,466% Engagement",
        reach: "+13,500% Reach",
      },
      duration: "3 weeks",
      services: ["Event Promotions", "Live Event Coverage", "Ticket Giveaways"],
    },
    {
      client: "Midnapore Sweet House",
      category: "Local Marketing",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
      before: {
        followers: "800",
        engagement: "1.2%",
        reach: "8K/mo",
      },
      after: {
        followers: "5.2K",
        engagement: "8.9%",
        reach: "280K/mo",
      },
      growth: {
        followers: "+550% Followers",
        engagement: "+641% Engagement",
        reach: "+3,400% Reach",
      },
      duration: "1 month",
      services: ["Local Business Marketing", "Instagram Promotions", "Store Walkthrough"],
    },
    {
      client: "Paschim Midnapore Sports Club",
      category: "Event Promotions",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
      before: {
        followers: "400",
        engagement: "1.1%",
        reach: "3K/mo",
      },
      after: {
        followers: "3.2K",
        engagement: "9.2%",
        reach: "150K/mo",
      },
      growth: {
        followers: "+700% Followers",
        engagement: "+736% Engagement",
        reach: "+4,900% Reach",
      },
      duration: "2 weeks",
      services: ["Event Promotions", "Reel Promotions", "Event Shoutouts"],
    },
  ];

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((project) => project.category === filter);

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
              Portfolio & Case Studies
            </div>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
              Real Brands. <span className="text-gradient">Real Results.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Browse our portfolio of successful campaigns and see the viral growth we've
              delivered for local and national brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2.5 rounded-full transition-all ${
                  filter === category
                    ? "gradient-purple-teal"
                    : "glass-light hover:glass"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-3xl overflow-hidden group cursor-pointer"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.client}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full glass-light text-sm">
                    {project.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl mb-4">{project.client}</h3>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="glass-light rounded-xl p-4 text-center">
                      <Users size={20} className="mx-auto mb-2 text-purple-400" />
                      <div className="text-xs text-gray-500 mb-1">Followers</div>
                      <div className="text-sm text-gray-400">{project.before.followers}</div>
                      <div className="text-lg">{project.after.followers}</div>
                      <div className="text-xs text-green-400">{project.growth.followers}</div>
                    </div>

                    <div className="glass-light rounded-xl p-4 text-center">
                      <Heart size={20} className="mx-auto mb-2 text-teal-400" />
                      <div className="text-xs text-gray-500 mb-1">Engagement</div>
                      <div className="text-sm text-gray-400">{project.before.engagement}</div>
                      <div className="text-lg">{project.after.engagement}</div>
                      <div className="text-xs text-green-400">{project.growth.engagement}</div>
                    </div>

                    <div className="glass-light rounded-xl p-4 text-center">
                      <Eye size={20} className="mx-auto mb-2 text-yellow-400" />
                      <div className="text-xs text-gray-500 mb-1">Reach</div>
                      <div className="text-sm text-gray-400">{project.before.reach}</div>
                      <div className="text-lg">{project.after.reach}</div>
                      <div className="text-xs text-green-400">{project.growth.reach}</div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">Services Provided:</div>
                    <div className="flex flex-wrap gap-2">
                      {project.services.map((service, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full glass-light text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-gray-500">
                    Timeline: <span className="text-white">{project.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Partners Showcase Section */}
      <section className="py-24 bg-[#12121c]/30 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 rounded-full glass-light mb-6">
              Our Collaboration Ecosystem
            </div>
            <h2 className="text-4xl md:text-6xl mb-6">
              22+ Premium <span className="text-gradient">Brand Partners</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We collaborate with global leaders in education, top automobile brands, local Paschim Midnapore cafes, and retail giants to deliver unparalleled ROI.
            </p>
          </motion.div>

          {/* Partner Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["All", "Automobile", "Education & Coaching", "Cafe & Restaurant", "Retail & Lifestyle"].map((cat) => (
              <button
                key={cat}
                onClick={() => setPartnerFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  partnerFilter === cat
                    ? "gradient-purple-teal hover:glow-purple text-white"
                    : "glass-light hover:glass text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Partner Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {brandPartners
              .filter((p) => partnerFilter === "All" || p.category === partnerFilter)
              .map((partner, idx) => {
                const IconComponent = partner.icon;
                return (
                  <motion.div
                    key={partner.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 hover:glow-purple transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${partner.color} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent size={20} />
                      </div>
                      <span className="text-[10px] tracking-wider uppercase bg-white/5 text-gray-400 group-hover:text-purple-300 px-2.5 py-1 rounded-full border border-white/5 transition-colors">
                        {partner.category.replace(" & Coaching", "")}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-1">{partner.name}</h4>
                    <p className="text-xs text-gray-500">{partner.services}</p>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center glass rounded-3xl p-12"
          >
            <h2 className="text-4xl md:text-5xl mb-6">
              Want to Go Viral in Paschim Midnapore?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Let's discuss how we can skyrocket your brand visibility and foot traffic with creative campaigns.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-purple-teal hover:glow-purple transition-all"
            >
              Partner With Us
              <ArrowUpRight size={20} />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
