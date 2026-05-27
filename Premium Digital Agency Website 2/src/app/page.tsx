import {
  getPublicCaseStudies,
  getPublicServices,
  getPublicTestimonials,
} from "@/lib/content";
import { Home } from "./pages/Home";

export default async function Page() {
  const [services, caseStudies, testimonials] = await Promise.all([
    getPublicServices(),
    getPublicCaseStudies(),
    getPublicTestimonials(),
  ]);

  return (
    <Home
      services={services}
      caseStudies={caseStudies}
      testimonials={testimonials}
    />
  );
}
