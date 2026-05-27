import { motion } from "motion/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublicCaseStudy } from "@/lib/content";

type CaseStudyCarouselProps = {
  caseStudies: PublicCaseStudy[];
};

export function CaseStudyCarousel({ caseStudies }: CaseStudyCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeStudies = caseStudies.length > 0 ? caseStudies : [];
  const currentCase = safeStudies[activeIndex];

  if (!currentCase) {
    return null;
  }

  const resultEntries = Object.entries(currentCase.results || {}).slice(0, 4);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % safeStudies.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + safeStudies.length) % safeStudies.length);
  };

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
            Proven <span className="text-gradient">Campaign Impact</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how our influencer marketing collaborations drive massive organic growth and real foot traffic.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-8 md:p-12"
          >
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Left: Case Info */}
              <div className="lg:w-1/2">
                <div className="inline-block px-4 py-1.5 rounded-full glass-light text-sm mb-6">
                  {currentCase.industry}
                </div>
                <h3 className="text-3xl md:text-4xl mb-4">{currentCase.clientDisplayName}</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Challenge</div>
                    <p className="text-gray-300">{currentCase.challenge}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Solution</div>
                    <p className="text-gray-300">{currentCase.solution}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <div className="px-4 py-2 rounded-full glass-light text-sm">
                      Duration: {currentCase.durationLabel || "Custom timeline"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Results */}
              <div className="lg:w-1/2">
                <div className="text-2xl mb-6">Results</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resultEntries.map(([metric, value]) => (
                    <div key={metric} className="glass-light rounded-xl p-6">
                      <div className="text-sm text-gray-400 mb-2">
                        {metric.replace(/_/g, " ")}
                      </div>
                      <div className="text-2xl text-white">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full glass-light hover:glass transition-all flex items-center justify-center"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {safeStudies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeIndex ? "w-8 gradient-purple-teal" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full glass-light hover:glass transition-all flex items-center justify-center"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
