import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { PublicTestimonial } from "@/lib/content";
import { ImageWithFallback } from "../figma/ImageWithFallback";

type TestimonialsSectionProps = {
  testimonials: PublicTestimonial[];
};

const fallbackAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop";

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const visibleTestimonials = testimonials.slice(0, 6);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4">
            Loved By{" "}
            <span className="text-gradient">600+ Brands</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our
            clients say.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-6 relative group cursor-pointer"
            >
              <Quote size={32} className="text-gray-600 mb-4" />

              <div className="flex gap-1 mb-4">
                {[...Array(Math.max(1, testimonial.rating || 5))].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <ImageWithFallback
                  src={testimonial.avatarUrl || fallbackAvatar}
                  alt={testimonial.clientName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div>{testimonial.clientName}</div>
                  <div className="text-sm text-gray-400">
                    {[testimonial.clientRole, testimonial.organizationName]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Score */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 glass-light px-8 py-4 rounded-full">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-left">
              <div className="text-2xl">4.9/5.0</div>
              <div className="text-sm text-gray-400">
                Based on 600+ collaborations
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
