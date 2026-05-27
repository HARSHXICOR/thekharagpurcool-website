"use client";

import { MessageCircle, Calendar } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export function StickyButtons() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
      <motion.a
        href="https://wa.me/919239063990"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-2xl transition-shadow"
      >
        <MessageCircle size={24} className="text-white" />
      </motion.a>
      
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Link
          href="/contact"
          className="w-14 h-14 rounded-full gradient-purple-teal flex items-center justify-center shadow-lg hover:glow-purple transition-all"
        >
          <Calendar size={24} className="text-white" />
        </Link>
      </motion.div>
    </div>
  );
}
