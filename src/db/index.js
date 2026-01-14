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
  
  // Check if URL explicitly requires SSL or is a cloud provider
  const requiresSsl = dbUrl.includes("sslmode=require") || 
                      dbUrl.includes("aivencloud.com") ||
                      dbUrl.includes("render.com") || 
                      dbUrl.includes("dpg-") ||
                      process.env.NODE_ENV === "production";
  
  // Enable SSL with self-signed certificate support for cloud databases
  if (requiresSsl) {
    console.log("🔒 SSL enabled for database connection (rejectUnauthorized: false)");
    return { rejectUnauthorized: false };
  }
  
  // Disable SSL for local development
  console.log("🔓 SSL disabled for local development");
  return false;
};

const sslConfig = getSslConfig();
console.log("📊 Database SSL config:", JSON.stringify(sslConfig));

// Clean connection string - remove sslmode parameter and handle SSL via Pool config
let cleanConnectionString = process.env.DATABASE_URL || "";
if (cleanConnectionString.includes("sslmode=")) {
  cleanConnectionString = cleanConnectionString.replace(/[?&]sslmode=[^&]*/g, '');
  // Remove trailing ? or & if they exist
  cleanConnectionString = cleanConnectionString.replace(/[?&]$/, '');
  console.log("🧹 Cleaned connection string (removed sslmode parameter)");
}

// Build connection config with explicit SSL settings
const connectionConfig = {
  connectionString: cleanConnectionString,
};

// Apply SSL config - if SSL is required, explicitly set rejectUnauthorized: false
if (sslConfig && typeof sslConfig === 'object') {
  connectionConfig.ssl = {
    rejectUnauthorized: false, // Explicitly allow self-signed certificates
  };
} else if (sslConfig === false) {
  connectionConfig.ssl = false;
}

console.log("🔧 Final connection config SSL:", connectionConfig.ssl);

export const pool = new Pool(connectionConfig);

// Test database connection on startup
pool.on("connect", () => {
  console.log("Database connection established");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

export const db = drizzle(pool);
