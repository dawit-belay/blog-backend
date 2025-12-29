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


// test database
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
