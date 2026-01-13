import express from "express";
import {pool} from "./db/index.js";
import cors from "cors";
import postsRoutes from "./routes/posts.js";
import usersRoutes from "./routes/users.js";
import categoriesRoutes from "./routes/category.js";
import commentsRoutes from "./routes/comments.js";

// Create app
const app = express();

// Global middlewares
app.use(cors());

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));

app.use(express.json());


// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("Make sure DATABASE_URL is set correctly in your environment variables");
  }
}

// test database endpoint
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ 
      success: true,
      message: "Database connection working",
      time: result.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      hint: "Check your DATABASE_URL environment variable"
    });
  }
});

// Mount routes
app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/comments", commentsRoutes);

// Base route for testing
app.get("/", (req, res) => {
  res.json({ message: "Express API is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Bind to all network interfaces for Render

const server = app.listen(PORT, HOST, async () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  // Test database connection on startup
  await testDatabaseConnection();
});

// Graceful shutdown handler for Render deployments
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    // Close database connections if needed
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
});

// Handle SIGINT (Ctrl+C) for local development
process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
});
