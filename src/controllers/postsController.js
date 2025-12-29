// import { pool } from "../db/index.js";

import { db } from "../db/index.js";
import { posts,users,categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

// export async function getPosts(req, res) {
//   try {
//     const result = await db.select().from(posts).orderBy(posts.id);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

export async function getPosts(req, res) {
  try {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        likesCount: posts.likesCount,
        shareCount: posts.shareCount,

        author: {
          id: users.id,
          name: users.name,
          role: users.role,
        },

        category: {
          id: categories.id,
          name: categories.name,
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .orderBy(posts.createdAt);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPost(req, res) {
  const id = req.params.id;
  try {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    if (result.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function createPost(req, res) {
  const { title, content, imageUrl, userId, categoryId } = req.body;
  try {
    const result = await db.insert(posts).values({ title, content, imageUrl, authorId: userId, categoryId }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePost(req, res) {
  const id = req.params.id;
  const { title, content, imageUrl, likesCount, userId, categoryId } = req.body;
  try {
    const result = await db.update(posts).set({ title, content, imageUrl, likesCount, authorId: userId, categoryId }).where(eq(posts.id, id)).returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deletePost(req, res) {
  const id = req.params.id;
  try {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

