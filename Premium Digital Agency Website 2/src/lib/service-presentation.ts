export type ServicePresentation = {
  iconKey:
    | "instagram"
    | "users"
    | "megaphone"
    | "calendar"
    | "flame"
    | "video";
  color: string;
  tiers: string[];
  highlights: string[];
};

const servicePresets: Record<string, ServicePresentation> = {
  "instagram-promotions": {
    iconKey: "instagram",
    color: "from-pink-500 to-purple-500",
    tiers: ["Standard", "Premium"],
    highlights: [
      "Targeted story and post promotions",
      "Audience demographic tuning",
      "Creative caption and hashtag planning",
      "Reach and conversion tracking",
    ],
  },
  "brand-collaborations": {
    iconKey: "users",
    color: "from-purple-500 to-indigo-500",
    tiers: ["Per Post", "Campaign Bundle"],
    highlights: [
      "Product placements and unboxings",
      "Co-created sponsored content",
      "Long-term collaboration planning",
      "Creator-native storytelling",
    ],
  },
  "local-business-marketing": {
    iconKey: "megaphone",
    color: "from-teal-500 to-cyan-500",
    tiers: ["Starter Local", "Pro Local"],
    highlights: [
      "Location-aware audience targeting",
      "In-store visits and walkthroughs",
      "Hyper-local awareness pushes",
      "Community shoutouts and discovery",
    ],
  },
  "event-promotions": {
    iconKey: "calendar",
    color: "from-yellow-500 to-orange-500",
    tiers: ["Pre-Event", "Full Coverage"],
    highlights: [
      "Pre-event countdown and hype",
      "Live event coverage and updates",
      "Giveaways and attendee activation",
      "Recap reels and stories",
    ],
  },
  "food-reviews": {
    iconKey: "flame",
    color: "from-red-500 to-pink-500",
    tiers: ["Single Review", "Foodie Takeover"],
    highlights: [
      "Cinematic food styling reels",
      "Menu and ambience showcases",
      "Honest creator-led reviews",
      "Local conversion-focused distribution",
    ],
  },
  "reel-promotions": {
    iconKey: "video",
    color: "from-indigo-500 to-purple-500",
    tiers: ["Standard Reel", "Premium Cinematic"],
    highlights: [
      "Trending format and audio matching",
      "Strong hook and caption strategy",
      "Short-form editing for retention",
      "Performance-first publishing cadence",
    ],
  },
};

const defaultPresentation: ServicePresentation = {
  iconKey: "instagram",
  color: "from-purple-500 to-teal-500",
  tiers: ["Custom Scope"],
  highlights: [
    "Campaign planning and content strategy",
    "Creative production and distribution",
    "Audience targeting and optimization",
    "Performance reporting and iteration",
  ],
};

export function getServicePresentation(
  slug: string,
  category: string,
): ServicePresentation {
  return (
    servicePresets[slug] ||
    servicePresets[category] ||
    defaultPresentation
  );
}
