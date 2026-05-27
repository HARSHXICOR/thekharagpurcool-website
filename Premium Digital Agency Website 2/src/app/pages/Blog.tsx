"use client";

import { PublicBlogPost } from "@/lib/content";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type BlogProps = {
  posts: PublicBlogPost[];
};

const fallbackImage =
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=600&fit=crop";

function formatDate(date?: string | null) {
  if (!date) {
    return "Recently published";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function Blog({ posts }: BlogProps) {
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<{
    loading: boolean;
    message: string | null;
    error: boolean;
  }>({
    loading: false,
    message: null,
    error: false,
  });

  const categories = useMemo(() => {
    const backendCategories = Array.from(
      new Set(posts.map((post) => post.category).filter(Boolean)),
    );
    return ["All Posts", ...backendCategories];
  }, [posts]);

  const featured = posts[0];
  const visiblePosts = posts.filter((post) =>
    activeCategory === "All Posts" ? true : post.category === activeCategory,
  );

  async function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterState({ loading: true, message: null, error: false });

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "blog_newsletter",
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Subscription failed.");
      }

      setEmail("");
      setNewsletterState({
        loading: false,
        message: payload.message || "Subscription successful.",
        error: false,
      });
    } catch (error) {
      setNewsletterState({
        loading: false,
        message: error instanceof Error ? error.message : "Subscription failed.",
        error: true,
      });
    }
  }

  return (
    <div className="min-h-screen">
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
              Insights & Strategies
            </div>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
              Learn From <span className="text-gradient">The Experts</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Growth strategies, industry insights, and case studies from the trenches
              of digital marketing.
            </p>
          </motion.div>
        </div>
      </section>

      {featured && (
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto glass rounded-3xl overflow-hidden cursor-pointer group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative overflow-hidden h-96 lg:h-auto">
                  <ImageWithFallback
                    src={featured.featuredImageUrl || fallbackImage}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 rounded-full gradient-purple-teal text-sm">
                    Featured
                  </div>
                </div>

                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1.5 rounded-full glass-light text-sm mb-4 w-fit">
                    {featured.category}
                  </div>
                  <h2 className="text-3xl md:text-4xl mb-4 leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-gray-400 mb-6 leading-relaxed">{featured.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {formatDate(featured.publishedAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {featured.readTimeMinutes
                        ? `${featured.readTimeMinutes} min read`
                        : "5 min read"}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-6">
                    By {featured.author?.fullName || "The Kharagpur Wala"}
                  </div>

                  <div className="flex items-center gap-3 group-hover:gap-4 transition-all text-white">
                    Read Full Article
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full transition-all ${
                  activeCategory === category
                    ? "gradient-purple-teal text-white"
                    : "glass-light hover:glass"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {visiblePosts.map((post, index) => (
              <motion.div
                key={post.slug || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={post.featuredImageUrl || fallbackImage}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass-light text-xs">
                    {post.category}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl mb-3 leading-tight group-hover:text-gradient transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(post.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTimeMinutes ? `${post.readTimeMinutes} min` : "5 min"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button className="px-8 py-4 rounded-full glass-light hover:glass transition-all">
              Browse More Articles
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center"
          >
            <TrendingUp size={48} className="mx-auto mb-6 text-gradient" />
            <h2 className="text-4xl mb-4">
              Get Creator <span className="text-gradient">Secrets & Insights</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Join 5,000+ local brands and creators getting exclusive digital growth
              insights.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-6 py-3 rounded-full glass-light focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={newsletterState.loading}
                className="px-8 py-3 rounded-full gradient-purple-teal hover:glow-purple transition-all whitespace-nowrap disabled:opacity-60"
              >
                {newsletterState.loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            {newsletterState.message && (
              <p
                className={`mt-4 text-sm ${
                  newsletterState.error ? "text-red-400" : "text-green-400"
                }`}
              >
                {newsletterState.message}
              </p>
            )}

            <p className="text-xs text-gray-500 mt-4">
              No spam. Unsubscribe anytime. Privacy policy.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
