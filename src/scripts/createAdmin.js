import "dotenv/config";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

/**
 * Script to create or update an admin user
 * Usage: npm run create-admin
 * 
 * Required environment variables:
 * - DATABASE_URL - PostgreSQL connection string
 * - ADMIN_NAME - Name of the admin user
 * - ADMIN_EMAIL - Email of the admin user
 * - ADMIN_PASSWORD - Password for the admin user
 */

async function createOrUpdateAdmin() {
  try {
    // Validate database connection
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please configure your .env file with:\nDATABASE_URL=postgresql://user:password@localhost:5432/blogdb"
      );
    }

    // Get admin credentials from environment variables
    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate that all required environment variables are set
    if (!adminName || !adminEmail || !adminPassword) {
      throw new Error(
        "Missing required environment variables. Please set:\n" +
        "  ADMIN_NAME=<name>\n" +
        "  ADMIN_EMAIL=<email>\n" +
        "  ADMIN_PASSWORD=<password>"
      );
    }

    console.log(`\n🔍 Checking for existing admin user with email: ${adminEmail}...`);

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    const existingUser = existingUsers[0];

    if (existingUser) {
      // User exists, update their role to admin and password
      console.log(`✅ User found with ID: ${existingUser.id}`);
      console.log(`📝 Updating role to 'admin' and password...`);

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const updatedUser = await db
        .update(users)
        .set({ 
          role: "admin",
          password: hashedPassword
        })
        .where(eq(users.email, adminEmail))
        .returning();

      console.log(`\n✨ Admin user updated successfully!`);
      console.log(`   ID: ${updatedUser[0].id}`);
      console.log(`   Name: ${updatedUser[0].name}`);
      console.log(`   Email: ${updatedUser[0].email}`);
      console.log(`   Role: ${updatedUser[0].role}`);
    } else {
      // User doesn't exist, create a new one with admin role
      console.log(`❌ No existing user found`);
      console.log(`➕ Creating new admin user...`);

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const newAdmin = await db
        .insert(users)
        .values({
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        })
        .returning();

      console.log(`\n✨ Admin user created successfully!`);
      console.log(`   ID: ${newAdmin[0].id}`);
      console.log(`   Name: ${newAdmin[0].name}`);
      console.log(`   Email: ${newAdmin[0].email}`);
      console.log(`   Role: ${newAdmin[0].role}`);
    }

    console.log(`\n✅ Operation completed successfully!\n`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the script
createOrUpdateAdmin();

