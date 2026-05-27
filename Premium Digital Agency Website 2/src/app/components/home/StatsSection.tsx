import { motion, useMotionValue, useSpring, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { TrendingUp, Users, Target, Award } from "lucide-react";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function StatsSection() {
  const stats = [
    {
      icon: TrendingUp,
      value: 4,
      suffix: "M+",
      label: "Organic Reach",
      color: "text-purple-400",
    },
    {
      icon: Users,
      value: 23,
      suffix: "K+",
      label: "Active Followers",
      color: "text-teal-400",
    },
    {
      icon: Target,
      value: 600,
      suffix: "+",
      label: "Paid Collaborations",
      color: "text-yellow-400",
    },
    {
      icon: Award,
      value: 750,
      suffix: "+",
      label: "Content Posts",
      color: "text-pink-400",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4">
            Growth That <span className="text-gradient">Speaks Numbers</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real results from real campaigns. Here's what we've achieved for our clients.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-8 text-center group hover:glow-purple transition-all"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full glass-light mb-6 ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <div className="text-4xl md:text-5xl mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
