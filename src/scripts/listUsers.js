import "dotenv/config";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

/**
 * Script to list all users from the database
 * Usage: npm run list-users
 * 
 * Note: Passwords are stored as bcrypt hashes and cannot be retrieved in plaintext.
 * This is by design for security purposes.
 */

async function listUsers() {
  try {
    // Validate database connection
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please configure your .env file."
      );
    }

    console.log("\n🔍 Fetching all users from database...\n");

    // Fetch all users
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        password: users.password, // This will be a bcrypt hash
      })
      .from(users)
      .orderBy(users.createdAt);

    if (allUsers.length === 0) {
      console.log("❌ No users found in the database.\n");
      process.exit(0);
    }

    console.log(`✅ Found ${allUsers.length} user(s):\n`);
    console.log("=" .repeat(100));
    
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. User Information:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created At: ${user.createdAt}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}... (bcrypt hash - cannot be decrypted)`);
      console.log("-".repeat(100));
    });

    console.log(`\n⚠️  SECURITY NOTE:`);
    console.log(`   Passwords are stored as bcrypt hashes and cannot be retrieved in plaintext.`);
    console.log(`   This is by design for security purposes.`);
    console.log(`   If you need to reset a password, use the admin panel or create a password reset feature.\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
listUsers();
