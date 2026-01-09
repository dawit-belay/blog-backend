import "dotenv/config";
import { pool } from "../db/index.js";

/**
 * Diagnostic script to test database connectivity
 * Usage: node src/scripts/testDb.js
 */

async function testConnection() {
  try {
    console.log("\n🔧 Database Connection Test\n");
    console.log("Checking environment variables...");
    
    const dbUrl = process.env.DATABASE_URL;
    console.log(`✓ DATABASE_URL: ${dbUrl ? "SET" : "NOT SET"}`);
    
    if (!dbUrl) {
      console.log("\n❌ DATABASE_URL is not configured!");
      console.log("Please add DATABASE_URL to your .env file");
      process.exit(1);
    }

    console.log("\n🔗 Attempting to connect to database...");
    const client = await pool.connect();
    console.log("✓ Connection successful!");

    console.log("\n📊 Checking for 'users' table...");
    const result = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )`
    );
    
    const tableExists = result.rows[0].exists;
    if (tableExists) {
      console.log("✓ 'users' table exists");
      
      // Get table structure
      const tableInfo = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log("\n📋 Table structure:");
      tableInfo.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log("❌ 'users' table does NOT exist");
      console.log("Please run database migrations first:");
      console.log("   npm run push   (or drizzle-kit push)");
    }

    client.release();
    console.log("\n✅ All checks passed!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nPossible solutions:");
    console.error("1. Check DATABASE_URL is correct in .env file");
    console.error("2. Ensure PostgreSQL is running");
    console.error("3. If using Docker, ensure the database container is running:");
    console.error("   docker-compose up -d db");
    console.error("4. If not using Docker, use a local PostgreSQL connection:");
    console.error("   DATABASE_URL=postgresql://user:password@localhost:5432/blogdb\n");
    process.exit(1);
  }
}

testConnection();

