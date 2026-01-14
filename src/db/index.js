import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set!");
  throw new Error("DATABASE_URL is required");
}

// Configure SSL for database connection
// Cloud PostgreSQL providers (Render, Aiven, etc.) often require SSL with self-signed certificates
// Local development typically doesn't use SSL
const getSslConfig = () => {
  const dbUrl = process.env.DATABASE_URL || "";
  const isProduction = process.env.NODE_ENV === "production";
  const isRenderDb = dbUrl.includes("render.com") || dbUrl.includes("dpg-");
  const isAivenDb = dbUrl.includes("aivencloud.com") || dbUrl.includes("sslmode=require");
  
  // Enable SSL for cloud databases (Render, Aiven, etc.)
  if (isProduction && (isRenderDb || isAivenDb)) {
    return { rejectUnauthorized: false };
  }
  
  // Disable SSL for local development
  return false;
};

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
});

// Test database connection on startup
pool.on("connect", () => {
  console.log("Database connection established");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

export const db = drizzle(pool);
