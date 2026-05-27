import { motion } from "motion/react";
import Link from "next/link";
import { PublicService } from "@/lib/content";
import { getServicePresentation } from "@/lib/service-presentation";
import {
  Instagram,
  Users,
  Megaphone,
  Calendar,
  Flame,
  Video,
  ArrowRight,
} from "lucide-react";

const icons = {
  instagram: Instagram,
  users: Users,
  megaphone: Megaphone,
  calendar: Calendar,
  flame: Flame,
  video: Video,
};

type ServicesGridProps = {
  services: PublicService[];
};

export function ServicesGrid({ services }: ServicesGridProps) {
  const visibleServices = services.slice(0, 6);

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
            Services That <span className="text-gradient">Scale Your Brand</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From strategy to execution, we handle everything you need to dominate digital.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleServices.map((service, index) => {
            const presentation = getServicePresentation(service.slug, service.category);
            const Icon = icons[presentation.iconKey];

            return (
              <motion.div
                key={service.slug || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass rounded-2xl p-6 group cursor-pointer relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${presentation.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                />

                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${presentation.color} flex items-center justify-center mb-4`}
                >
                  <Icon size={24} className="text-white" />
                </div>

                <h3 className="text-xl mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {service.shortDescription || service.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 group-hover:text-white transition-colors">
                  Learn more
                  <ArrowRight
                    size={16}
                    className="ml-1 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full glass-light hover:glass transition-all"
          >
            View All Services
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
