import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear database
  await prisma.auditLog.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.campaignMetric.deleteMany({});
  await prisma.campaignDeliverable.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.planFeature.deleteMany({});
  await prisma.pricingPlan.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.caseStudy.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.organizationMembership.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password12345', 12);

  // 2. Create Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@tgw.in',
      fullName: 'Super Admin',
      passwordHash,
      defaultRole: 'super_admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  const staffAdmin = await prisma.user.create({
    data: {
      email: 'admin@tgw.in',
      fullName: 'TGW Admin Operator',
      passwordHash,
      defaultRole: 'admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  const contentManager = await prisma.user.create({
    data: {
      email: 'content@tgw.in',
      fullName: 'Content Manager',
      passwordHash,
      defaultRole: 'content_manager',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'marketing@cafemocha.in',
      fullName: 'Priya Sharma',
      passwordHash,
      defaultRole: 'client_user',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Users seeded successfully!');

  // 3. Create Organization
  const mochaOrg = await prisma.organization.create({
    data: {
      name: 'Cafe Mocha Kharagpur',
      slug: 'cafe-mocha-kharagpur',
      industry: 'Cafe & Restaurant',
      instagramHandle: '@cafemocha_kgp',
      timezone: 'Asia/Kolkata',
      status: 'active',
    },
  });

  // Create Membership
  await prisma.organizationMembership.create({
    data: {
      organizationId: mochaOrg.id,
      userId: clientUser.id,
      role: 'org_owner',
      status: 'active',
    },
  });

  console.log('Organizations and memberships seeded!');

  // 4. Create Services
  const instaPromo = await prisma.service.create({
    data: {
      slug: 'instagram-promotions',
      name: 'Instagram Promotions',
      shortDescription: 'Viral Reels and Grid posts targeting Kharagpur youth.',
      description: 'Full creative coverage including story loops and feed promotions.',
      category: 'promotions',
      displayOrder: 1,
      isActive: true,
    },
  });

  const eventCoverage = await prisma.service.create({
    data: {
      slug: 'event-coverage',
      name: 'Event Coverage & Hype',
      shortDescription: 'Pre-event buzzing and live event day coverages.',
      description: 'Aggressive story posting and dynamic videography coverage during campus fests.',
      category: 'events',
      displayOrder: 2,
      isActive: true,
    },
  });

  console.log('Services seeded!');

  // 5. Create Pricing Plans
  const starterPlan = await prisma.pricingPlan.create({
    data: {
      slug: 'starter-package',
      name: 'Starter Buzz',
      tagline: 'Perfect for small local outlets.',
      billingModel: 'monthly',
      monthlyPrice: 15000,
      annualPrice: 150000,
      currency: 'INR',
      isFeatured: false,
      isActive: true,
    },
  });

  await prisma.planFeature.createMany({
    data: [
      { planId: starterPlan.id, featureText: '2 Custom Reels per month', featureType: 'included', displayOrder: 1 },
      { planId: starterPlan.id, featureText: '4 Instagram Stories with links', featureType: 'included', displayOrder: 2 },
      { planId: starterPlan.id, featureText: 'Dedicated Account Manager', featureType: 'excluded', displayOrder: 3 },
    ],
  });

  const growthPlan = await prisma.pricingPlan.create({
    data: {
      slug: 'growth-package',
      name: 'Growth Hype',
      tagline: 'Best for cafes, campus festivals and franchises.',
      billingModel: 'monthly',
      monthlyPrice: 35000,
      annualPrice: 350000,
      currency: 'INR',
      isFeatured: true,
      isActive: true,
    },
  });

  await prisma.planFeature.createMany({
    data: [
      { planId: growthPlan.id, featureText: '6 Custom Reels per month', featureType: 'included', displayOrder: 1 },
      { planId: growthPlan.id, featureText: '10 Instagram Stories with link-clicks', featureType: 'included', displayOrder: 2 },
      { planId: growthPlan.id, featureText: 'Weekly performance analytics snapshot', featureType: 'included', displayOrder: 3 },
      { planId: growthPlan.id, featureText: 'Dedicated Account Manager', featureType: 'included', displayOrder: 4 },
    ],
  });

  console.log('Pricing plans seeded!');

  // 6. Testimonials
  await prisma.testimonial.create({
    data: {
      clientName: 'Rajesh Sen',
      clientRole: 'Founder',
      organizationName: 'KGP Eats',
      avatarUrl: 'https://cdn.example.com/avatars/rajesh.jpg',
      rating: 5,
      quote: 'The organic reach we received from their promotions was off the charts. Highly recommend!',
      status: 'published',
    },
  });

  // 7. Case Studies
  await prisma.caseStudy.create({
    data: {
      slug: 'cafe-mocha-launch-success',
      title: 'How Cafe Mocha Scaled Footfalls inside IIT KGP Area by 180%',
      clientDisplayName: 'Cafe Mocha',
      industry: 'Food & Beverage',
      challenge: 'Unaware student base of the new outlet opening outside campus.',
      solution: 'An integrated Reels campaign showing menu aesthetics and campus delivery fests.',
      results: { footfall_growth: '180%', reels_views: '120k+' },
      durationLabel: '1 Month',
      status: 'published',
    },
  });

  // 8. Blog Posts
  await prisma.blogPost.create({
    data: {
      slug: 'viral-marketing-kharagpur',
      title: 'The Ultimate Guide to Viral Marketing Targeting IIT Kharagpur Students',
      excerpt: 'Learn the exact triggers that get student communities sharing posts.',
      content: { blocks: [{ type: 'paragraph', text: 'Students love campus humor and relatability.' }] },
      category: 'marketing',
      tags: ['marketing', 'iitkgp', 'viral'],
      authorId: contentManager.id,
      status: 'published',
      publishedAt: new Date(),
      seoTitle: 'Viral Marketing guide IIT KGP',
      readTimeMinutes: 5,
    },
  });

  // 9. Inquiry
  await prisma.inquiry.create({
    data: {
      name: 'Rahul Sen',
      email: 'rahul@kgpyouthfest.in',
      phone: '+919876543210',
      companyName: 'Kharagpur Youth Festival',
      serviceId: eventCoverage.id,
      budgetBand: 'growth',
      message: 'Need full coverage pre and post festival.',
      source: 'contact_form',
      status: 'new',
    },
  });

  console.log('Seeding completed successfully! Default logins:');
  console.log('- Super Admin: superadmin@tgw.in (password12345)');
  console.log('- Client User: marketing@cafemocha.in (password12345)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
