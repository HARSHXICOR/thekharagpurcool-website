"use client";

import {
  PublicCaseStudy,
  PublicService,
  PublicTestimonial,
} from "@/lib/content";
import { HeroSection } from "../components/home/HeroSection";
import { BrandShowcase } from "../components/home/BrandShowcase";
import { StatsSection } from "../components/home/StatsSection";
import { ServicesGrid } from "../components/home/ServicesGrid";
import { CaseStudyCarousel } from "../components/home/CaseStudyCarousel";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import { CTASection } from "../components/home/CTASection";

type HomeProps = {
  services: PublicService[];
  caseStudies: PublicCaseStudy[];
  testimonials: PublicTestimonial[];
};

export function Home({ services, caseStudies, testimonials }: HomeProps) {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <BrandShowcase />
      <StatsSection />
      <ServicesGrid services={services} />
      <CaseStudyCarousel caseStudies={caseStudies} />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection />
    </div>
  );
}
