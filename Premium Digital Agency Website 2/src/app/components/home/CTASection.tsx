import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-teal-500/20 to-yellow-500/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 md:p-16"
        >
          <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm">Limited Slots Available for April 2026</span>
          </div>

          <h2 className="text-4xl md:text-6xl mb-6 leading-tight">
            Ready to <span className="text-gradient">Go Viral?</span>
          </h2>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Book a collaboration spot today. Let's showcase your cafe, brand, or event to Paschim Midnapore's largest active audience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="group px-8 py-4 rounded-full gradient-purple-teal hover:glow-purple transition-all flex items-center gap-2"
            >
              Collaborate Now
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full glass-light hover:glass transition-all"
            >
              View Promotion Packages
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>4M+ Direct Reach</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Paschim Midnapore Focus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Authentic Engagement</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
