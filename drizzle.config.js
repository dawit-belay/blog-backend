import "dotenv/config";

export default {
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Disable SSL verification for Aiven (since it has self-signed cert)
  ssl: {
    rejectUnauthorized: false,
  },
};
