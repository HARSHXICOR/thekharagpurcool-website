"use client";

import { PublicService } from "@/lib/content";
import { getServicePresentation } from "@/lib/service-presentation";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Instagram,
  Users,
  Megaphone,
  Calendar,
  Flame,
  Video,
  CheckCircle,
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

type ServicesProps = {
  services: PublicService[];
};

export function Services({ services }: ServicesProps) {
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
              Our Services
            </div>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
              The Kharagpur Wala
              <br />
              <span className="text-gradient">Promotion & Marketing Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Leverage the organic reach of Paschim Midnapore's leading digital creator. Choose the perfect campaign for your local brand.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {services.map((service, index) => {
              const presentation = getServicePresentation(service.slug, service.category);
              const Icon = icons[presentation.iconKey];

              return (
                <motion.div
                  key={service.slug || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-3xl p-8 md:p-12 max-w-6xl mx-auto"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${presentation.color} flex items-center justify-center mb-6`}
                      >
                        <Icon size={32} className="text-white" />
                      </div>
                      <h2 className="text-3xl md:text-4xl mb-4">{service.name}</h2>
                      <p className="text-gray-400 text-lg mb-4">{service.description}</p>
                      <p className="text-gray-500 mb-6">{service.shortDescription}</p>

                      <div className="space-y-3">
                        {presentation.highlights.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-3">
                            <CheckCircle
                              size={20}
                              className="text-green-400 mt-0.5 flex-shrink-0"
                            />
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="text-sm text-gray-500 mb-3">Available in:</div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {presentation.tiers.map((tier, tierIndex) => (
                            <div
                              key={tierIndex}
                              className="px-4 py-2 rounded-full glass-light text-sm"
                            >
                              {tier}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-purple-teal hover:glow-purple transition-all"
                      >
                        View Pricing
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
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
              Ready to Boost Your Footfall?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Let's connect on a free consultation call. We'll discuss how we can position your brand in front of 4M+ local viewers.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-purple-teal hover:glow-purple transition-all"
            >
              Book Collaboration Call
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
