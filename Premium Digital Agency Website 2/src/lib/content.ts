import { fetchBackendJson } from "@/lib/backend";

export type PublicService = {
  id?: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  metadata?: Record<string, unknown> | null;
};

export type PricingFeature = {
  featureText: string;
  featureType: "included" | "excluded" | string;
  displayOrder?: number;
};

export type PublicPricingPlan = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  billingModel: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  isFeatured?: boolean;
  features: PricingFeature[];
};

export type PublicBlogPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImageUrl?: string | null;
  category: string;
  tags?: string[];
  publishedAt?: string | null;
  readTimeMinutes?: number | null;
  author?: {
    fullName?: string | null;
  } | null;
};

export type PublicCaseStudy = {
  id?: string;
  slug: string;
  title: string;
  clientDisplayName: string;
  industry: string;
  challenge: string;
  solution: string;
  results: Record<string, string | number>;
  durationLabel?: string | null;
};

export type PublicTestimonial = {
  id?: string;
  clientName: string;
  clientRole?: string | null;
  organizationName?: string | null;
  avatarUrl?: string | null;
  rating: number;
  quote: string;
};

export const fallbackServices: PublicService[] = [
  {
    slug: "instagram-promotions",
    name: "Instagram Promotions",
    shortDescription: "Boost your brand with targeted Instagram stories, posts, and collaborations.",
    description:
      "Custom promotion campaigns designed to showcase your brand, products, or profile to a highly active local audience.",
    category: "promotions",
  },
  {
    slug: "brand-collaborations",
    name: "Brand Collaborations",
    shortDescription: "Organic creator partnerships that feel native, memorable, and high-converting.",
    description:
      "Seamless brand storytelling across reels, stories, and feed content tailored to fit the creator voice.",
    category: "collaborations",
  },
  {
    slug: "local-business-marketing",
    name: "Local Business Marketing",
    shortDescription: "Hyper-local awareness campaigns built for cafes, shops, and service businesses.",
    description:
      "Increase footfall and capture attention across Paschim Midnapore through location-aware campaigns.",
    category: "local-marketing",
  },
  {
    slug: "event-promotions",
    name: "Event Promotions",
    shortDescription: "Countdowns, live coverage, and hype campaigns that get people to show up.",
    description:
      "High-energy event promotion strategies built to drive signups, attendance, and post-event recall.",
    category: "events",
  },
  {
    slug: "food-reviews",
    name: "Food Reviews",
    shortDescription: "Cinematic food content that gets people hungry and walking through the door.",
    description:
      "Engaging culinary reviews, restaurant showcases, and cafe spotlight reels that drive local demand.",
    category: "food",
  },
  {
    slug: "reel-promotions",
    name: "Reel Promotions",
    shortDescription: "Short-form video campaigns optimized for viral reach and repeat engagement.",
    description:
      "Cinematic reel production built around trends, strong hooks, and strategic distribution timing.",
    category: "reels",
  },
];

export const fallbackPricingPlans: PublicPricingPlan[] = [
  {
    slug: "starter-package",
    name: "Shoutout Starter",
    tagline: "Perfect for local shops in Kharagpur looking for a quick boost",
    billingModel: "monthly",
    monthlyPrice: 2999,
    annualPrice: 2399,
    currency: "INR",
    isFeatured: false,
    features: [
      { featureText: "1 Instagram Story with active Link/Tag", featureType: "included" },
      { featureText: "1 Static or Carousel Post promotion", featureType: "included" },
      { featureText: "24-hour post duration", featureType: "included" },
      { featureText: "Premium cinematic reels", featureType: "excluded" },
    ],
  },
  {
    slug: "growth-package",
    name: "Viral Reel Booster",
    tagline: "Most popular for cafes, launches, and creator-led promotions",
    billingModel: "monthly",
    monthlyPrice: 9999,
    annualPrice: 7999,
    currency: "INR",
    isFeatured: true,
    features: [
      { featureText: "1 Premium Cinematic Reel", featureType: "included" },
      { featureText: "2 Instagram Stories with link/tag", featureType: "included" },
      { featureText: "Custom caption and hashtag strategy", featureType: "included" },
      { featureText: "Detailed post-campaign performance insights", featureType: "included" },
    ],
  },
  {
    slug: "mega-event-coverage",
    name: "Mega Event Coverage",
    tagline: "Built for festivals, openings, college events, and local buzz",
    billingModel: "monthly",
    monthlyPrice: 19999,
    annualPrice: 15999,
    currency: "INR",
    features: [
      { featureText: "Live on-ground coverage", featureType: "included" },
      { featureText: "1 Cinematic event recap reel", featureType: "included" },
      { featureText: "Pre-event countdown and giveaway support", featureType: "included" },
      { featureText: "Detailed event analytics report", featureType: "included" },
    ],
  },
];

export const fallbackBlogPosts: PublicBlogPost[] = [
  {
    slug: "viral-marketing-kharagpur",
    title: "The Ultimate Guide to Viral Marketing Targeting IIT Kharagpur Students",
    excerpt:
      "Learn the exact triggers that get student communities sharing posts and turning local campaigns into citywide buzz.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=600&fit=crop",
    category: "marketing",
    publishedAt: "2026-04-10T00:00:00.000Z",
    readTimeMinutes: 8,
    author: { fullName: "The Kharagpur Wala" },
  },
  {
    slug: "instagram-algorithm-2026",
    title: "Instagram Algorithm 2026: What Actually Works for Local Creators",
    excerpt:
      "The latest updates to Reels discovery and how local creators can position posts for better organic lift.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop",
    category: "social media",
    publishedAt: "2026-04-08T00:00:00.000Z",
    readTimeMinutes: 8,
    author: { fullName: "The Kharagpur Wala" },
  },
  {
    slug: "engagement-rate-vs-followers",
    title: "Why Engagement Rate Matters More Than Follower Count for Brand Collabs",
    excerpt:
      "Understanding the engagement signals that actually move purchase intent for local sponsors and creator businesses.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    category: "analytics",
    publishedAt: "2026-03-28T00:00:00.000Z",
    readTimeMinutes: 7,
    author: { fullName: "The Kharagpur Wala" },
  },
];

export const fallbackCaseStudies: PublicCaseStudy[] = [
  {
    slug: "cafe-mocha-launch-success",
    title: "How Cafe Mocha Scaled Footfalls by 180%",
    clientDisplayName: "Cafe Mocha Kharagpur",
    industry: "Food & Beverage",
    challenge: "Newly opened cafe struggling for local awareness and repeat foot traffic.",
    solution: "Cinematic food reels, geo-targeted stories, and creator-led social proof.",
    results: {
      footfall_growth: "180%",
      reels_views: "120K+",
      engagement_rate: "12.3%",
    },
    durationLabel: "1 month",
  },
  {
    slug: "kgp-gold-gym-growth",
    title: "How KGP Gold Gym Turned Social Attention into Membership Growth",
    clientDisplayName: "KGP Gold Gym",
    industry: "Fitness & Lifestyle",
    challenge: "Low engagement and stagnant membership registrations.",
    solution: "Facility walkthrough reels, local offer campaigns, and creator-hosted promotions.",
    results: {
      followers_growth: "608%",
      monthly_reach: "420K",
      new_signups: "120/month",
    },
    durationLabel: "2 months",
  },
];

export const fallbackTestimonials: PublicTestimonial[] = [
  {
    clientName: "Priya Sharma",
    clientRole: "Founder",
    organizationName: "Cafe Mocha Kharagpur",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 5,
    quote:
      "Their food review reel went viral and we had queues outside our cafe for weeks. It genuinely moved business.",
  },
  {
    clientName: "Rahul Sen",
    clientRole: "Organizer",
    organizationName: "Paschim Midnapore Youth Festival",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 5,
    quote:
      "The hype they built through reels and ticket giveaways was spectacular. Reach went through the roof and attendance followed.",
  },
  {
    clientName: "Aniket Das",
    clientRole: "Founder",
    organizationName: "KGP Gold Gym",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    rating: 5,
    quote:
      "Highly creative content that actually drives business outcomes, not just vanity numbers.",
  },
];

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await fetchBackendJson<T>(path);
  } catch (error) {
    console.warn(`Falling back to static content for ${path}`, error);
    return fallback;
  }
}

export async function getPublicServices() {
  return safeFetch<PublicService[]>("/services", fallbackServices);
}

export async function getPublicPricingPlans() {
  return safeFetch<PublicPricingPlan[]>("/pricing-plans", fallbackPricingPlans);
}

export async function getPublicBlogPosts() {
  return safeFetch<PublicBlogPost[]>("/blog-posts", fallbackBlogPosts);
}

export async function getPublicCaseStudies() {
  return safeFetch<PublicCaseStudy[]>("/case-studies", fallbackCaseStudies);
}

export async function getPublicTestimonials() {
  return safeFetch<PublicTestimonial[]>("/testimonials", fallbackTestimonials);
}
