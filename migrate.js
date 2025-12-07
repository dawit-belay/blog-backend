import fs from "fs";
import pool from "./src/db.js";

async function migrate() {
  try {
    const sql = fs.readFileSync("./migrations/schema.sql").toString();
    await pool.query(sql);

    console.log("✅ Migration completed successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
