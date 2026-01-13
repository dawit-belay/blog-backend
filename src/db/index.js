import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set!");
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL for production databases (Render PostgreSQL requires this)
  // rejectUnauthorized: false allows self-signed certificates
  ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("render.com") 
    ? { rejectUnauthorized: false } 
    : false,
});

// Test database connection on startup
pool.on("connect", () => {
  console.log("Database connection established");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

export const db = drizzle(pool);
