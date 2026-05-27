const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  // Grab new credentials from environment variables OR use these custom defaults
  const newEmail = process.env.NEW_EMAIL || "admin@thekharagpurwala.com";
  const newPassword = process.env.NEW_PASSWORD || "KGP_Super_Admin_2026!";

  console.log(`🔒 Hashing new password with bcrypt (12 secure work factor rounds)...`);
  const passwordHash = await bcrypt.hash(newPassword, 12);

  console.log(`🔗 Connecting to live PostgreSQL database...`);
  try {
    // Locate the current super admin by their seed email and update their credentials
    const updated = await prisma.user.update({
      where: { email: "superadmin@tgw.in" },
      data: {
        email: newEmail,
        passwordHash: passwordHash,
        fullName: "Harsh Vardhan Sharma" // Updates full name dynamically
      }
    });

    console.log(`\n==================================================`);
    console.log(`🎉 SUCCESS: LIVE SUPERADMIN CREDENTIALS UPDATED!`);
    console.log(`==================================================`);
    console.log(`   New Email:      "${updated.email}"`);
    console.log(`   Admin Name:     "${updated.fullName}"`);
    console.log(`   Bcrypt Hash:    Successfully updated!`);
    console.log(`==================================================\n`);
  } catch (error) {
    console.error("❌ Failed to update Super Admin credentials:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
