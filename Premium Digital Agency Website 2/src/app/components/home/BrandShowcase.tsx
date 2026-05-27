"use client";

import { motion } from "motion/react";
import { Sparkles, GraduationCap, Car, Flame, Shield, Compass, ShoppingBag, Smartphone } from "lucide-react";

const row1 = [
  { name: "Physics Wallah", category: "Education", icon: GraduationCap, color: "text-yellow-400" },
  { name: "KIA", category: "Automobile", icon: Car, color: "text-teal-400" },
  { name: "Jawa", category: "Automobile", icon: Car, color: "text-purple-400" },
  { name: "Ather Energy", category: "Automobile", icon: Sparkles, color: "text-green-400" },
  { name: "Toyota", category: "Automobile", icon: Car, color: "text-blue-400" },
  { name: "Swiggy", category: "Food & Delivery", icon: Flame, color: "text-orange-400" },
  { name: "Don Bosco", category: "Education", icon: GraduationCap, color: "text-pink-400" },
  { name: "Bong Pizza", category: "Cafe & Restaurant", icon: Flame, color: "text-red-400" },
  { name: "Resort Paradise", category: "Lifestyle & Hospitality", icon: Compass, color: "text-sky-400" },
  { name: "OM TVS", category: "Automobile", icon: Car, color: "text-indigo-400" },
  { name: "Fashion Avenue", category: "Lifestyle & Fashion", icon: ShoppingBag, color: "text-rose-400" },
];

const row2 = [
  { name: "Aakash Institute", category: "Education", icon: GraduationCap, color: "text-yellow-400" },
  { name: "Suzuki", category: "Automobile", icon: Car, color: "text-teal-400" },
  { name: "Honda BigWing", category: "Automobile", icon: Car, color: "text-purple-400" },
  { name: "Harley-Davidson", category: "Automobile", icon: Sparkles, color: "text-red-400" },
  { name: "TVS", category: "Automobile", icon: Car, color: "text-blue-400" },
  { name: "Apple Resellers", category: "Tech & Retail", icon: Smartphone, color: "text-slate-400" },
  { name: "China Town", category: "Cafe & Restaurant", icon: Flame, color: "text-orange-400" },
  { name: "Cool Culture", category: "Lifestyle & Fashion", icon: ShoppingBag, color: "text-rose-400" },
  { name: "Mobile Bazar", category: "Tech & Retail", icon: Smartphone, color: "text-emerald-400" },
  { name: "Charminar", category: "Cafe & Restaurant", icon: Flame, color: "text-red-400" },
  { name: "Fire Kissed Shawarma", category: "Cafe & Restaurant", icon: Flame, color: "text-amber-400" },
];

export function BrandShowcase() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#0a0a0f] to-[#12121c] overflow-hidden border-y border-white/5 relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-3">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Featured Integrations</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Our Collaboration <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-3 text-sm md:text-base">
            Collaborating with leading global automobile brands, prominent educational coaching institutes, popular local paschim midnapore cafes, and retail giants.
          </p>
        </motion.div>
      </div>

      {/* Scrolling Marquees */}
      <div className="space-y-6 max-w-[100vw] overflow-hidden relative py-2">
        
        {/* Row 1 - Left Scrolling */}
        <div className="flex w-full overflow-hidden mask-gradient relative">
          <div className="animate-marquee hover:[animation-play-state:paused] flex gap-4 pr-4">
            {/* Main Array */}
            {row1.map((brand, index) => (
              <div
                key={`r1-${index}`}
                className="flex items-center gap-3 px-6 py-4 glass rounded-2xl border border-white/5 hover:border-teal-500/30 hover:glow-teal transition-all duration-300 select-none group whitespace-nowrap cursor-default"
              >
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${brand.color} group-hover:scale-110 transition-transform`}>
                  <brand.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">{brand.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{brand.category}</div>
                </div>
              </div>
            ))}
            {/* Duplicated Array for Seamless Loop */}
            {row1.map((brand, index) => (
              <div
                key={`r1-dup-${index}`}
                className="flex items-center gap-3 px-6 py-4 glass rounded-2xl border border-white/5 hover:border-teal-500/30 hover:glow-teal transition-all duration-300 select-none group whitespace-nowrap cursor-default"
              >
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${brand.color} group-hover:scale-110 transition-transform`}>
                  <brand.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">{brand.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{brand.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Right Scrolling */}
        <div className="flex w-full overflow-hidden mask-gradient relative">
          <div className="animate-marquee-reverse hover:[animation-play-state:paused] flex gap-4 pr-4">
            {/* Main Array */}
            {row2.map((brand, index) => (
              <div
                key={`r2-${index}`}
                className="flex items-center gap-3 px-6 py-4 glass rounded-2xl border border-white/5 hover:border-purple-500/30 hover:glow-purple transition-all duration-300 select-none group whitespace-nowrap cursor-default"
              >
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${brand.color} group-hover:scale-110 transition-transform`}>
                  <brand.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{brand.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{brand.category}</div>
                </div>
              </div>
            ))}
            {/* Duplicated Array for Seamless Loop */}
            {row2.map((brand, index) => (
              <div
                key={`r2-dup-${index}`}
                className="flex items-center gap-3 px-6 py-4 glass rounded-2xl border border-white/5 hover:border-purple-500/30 hover:glow-purple transition-all duration-300 select-none group whitespace-nowrap cursor-default"
              >
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${brand.color} group-hover:scale-110 transition-transform`}>
                  <brand.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{brand.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{brand.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
