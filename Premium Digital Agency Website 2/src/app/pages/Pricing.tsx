"use client";

import { PublicPricingPlan } from "@/lib/content";
import { motion } from "motion/react";
import Link from "next/link";
import { Check, X, ArrowRight, Sparkles, Zap, Crown, Rocket } from "lucide-react";
import { useState } from "react";

const planIcons = [Sparkles, Zap, Crown, Rocket];
const planColors = [
  "from-purple-500 to-pink-500",
  "from-teal-500 to-cyan-500",
  "from-yellow-500 to-orange-500",
  "from-indigo-500 to-purple-500",
];

function parseDecimal(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val === "object") {
    if (typeof val.toNumber === "function") {
      return val.toNumber();
    }
    if (typeof val.toString === "function" && val.toString() !== "[object Object]") {
      const parsed = parseFloat(val.toString());
      if (!isNaN(parsed)) return parsed;
    }
    const digits = val.d || val.c;
    if (digits && Array.isArray(digits) && digits.length > 0) {
      const sign = val.s === -1 ? -1 : 1;
      // Single element digits array represents the exact integer value directly in decimal.js!
      if (digits.length === 1) {
        return parseFloat(digits[0]) * sign;
      }
      const joinedDigits = digits.join("");
      const exponent = typeof val.e === "number" ? val.e : 0;
      const numVal = parseFloat(joinedDigits) / Math.pow(10, joinedDigits.length - 1 - exponent);
      return isNaN(numVal) ? 0 : numVal * sign;
    }
  }
  return 0;
}

type PricingProps = {
  plans: PublicPricingPlan[];
};

export function Pricing({ plans }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const addons = [
    { name: "Extra Instagram Story shoutout", price: "₹999 / story" },
    { name: "Cinematic Food/Cafe Shoot (no review)", price: "₹4,999 / shoot" },
    { name: "Meme Marketing Post creation", price: "₹1,999 / meme" },
    { name: "Cross-promotion on partner accounts", price: "₹2,499 / post" },
    { name: "Dedicated dashboard setup & metrics audit", price: "₹2,999 one-time" },
  ];

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
              Simple, Transparent Pricing
            </div>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
              Promotion <span className="text-gradient">Packages</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
              Boost your brand presence in Paschim Midnapore with our highly optimized influencer campaign tiers.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 glass-light p-2 rounded-full">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === "monthly" ? "gradient-purple-teal" : "text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === "annual" ? "gradient-purple-teal" : "text-gray-400"
                }`}
              >
                Annual
                <span className="ml-2 text-xs text-green-400">Save 20%</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = planIcons[index % planIcons.length];
              const color = planColors[index % planColors.length];
              const included = plan.features
                .filter((feature) => feature.featureType !== "excluded")
                .map((feature) => feature.featureText);
              const notIncluded = plan.features
                .filter((feature) => feature.featureType === "excluded")
                .map((feature) => feature.featureText);

              return (
                <motion.div
                  key={plan.slug || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-3xl p-8 relative ${
                    plan.isFeatured ? "ring-2 ring-teal-500 scale-105" : ""
                  }`}
                >
                  {plan.isFeatured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full gradient-teal-purple text-sm">
                      Most Popular
                    </div>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}
                  >
                    <Icon size={28} />
                  </div>

                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-6">{plan.tagline}</p>

                  <div className="mb-6">
                    {plan.monthlyPrice ? (
                      <>
                        <div className="text-5xl mb-2">
                          ₹
                          {billingCycle === "monthly"
                            ? parseDecimal(plan.monthlyPrice).toLocaleString("en-IN")
                            : parseDecimal(plan.annualPrice ?? plan.monthlyPrice).toLocaleString("en-IN")}
                        </div>
                        <div className="text-gray-400 text-sm">
                          per campaign, billed {billingCycle}
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl mb-2">Custom Quote</div>
                    )}
                  </div>

                  <Link
                    href="/contact"
                    className={`block w-full text-center px-6 py-3 rounded-full mb-6 transition-all ${
                      plan.isFeatured
                        ? "gradient-purple-teal hover:glow-purple"
                        : "glass-light hover:glass"
                    }`}
                  >
                    {plan.monthlyPrice ? "Get Started" : "Contact Sales"}
                  </Link>

                  <div className="space-y-3">
                    {included.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2">
                        <Check
                          size={18}
                          className="text-green-400 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {notIncluded.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2 opacity-40">
                        <X size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl mb-4 text-center">
              Optional <span className="text-gradient">Add-ons</span>
            </h2>
            <p className="text-xl text-gray-400 text-center mb-12">
              Enhance any plan with these premium services
            </p>

            <div className="glass rounded-3xl p-8">
              <div className="space-y-4">
                {addons.map((addon, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-4 border-b border-white/10 last:border-0"
                  >
                    <span className="text-gray-300">{addon.name}</span>
                    <span className="text-white">{addon.price}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl mb-12 text-center">
              Pricing <span className="text-gradient">FAQs</span>
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes! All plans are month-to-month with no long-term contracts. Cancel anytime with 30 days notice.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, bank transfers, and UPI payments.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 14-day money-back guarantee on all plans. If you're not satisfied, we'll refund your first payment.",
                },
                {
                  q: "Can I switch plans later?",
                  a: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.",
                },
                {
                  q: "Is there a setup fee?",
                  a: "No setup fees on any plan. What you see is what you pay.",
                },
              ].map((faq, index) => (
                <div key={index} className="glass-light rounded-2xl p-6">
                  <h3 className="text-lg mb-2">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
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
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Book a free consultation and let's structure the ideal promotion plan for your local brand.
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
