import { db } from "../db/index.js";
import { comments } from "../db/schema.js";
import { eq } from "drizzle-orm";

// import { pool } from "../db/index.js";


export async function getComments(req, res) {
     try {
    const result = await db.select().from(comments).orderBy(comments.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getComment(req, res) {
    try {
      const result = await db
        .select()
        .from(comments)
        .where(eq(comments.id, Number(req.params.id)));
      res.json(result[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createComment(req, res) {
    try {
    const { content,postId,userId } = req.body;
    const result = await db
      .insert(comments)
      .values({ content,postId,userId })
      .returning();

      res.status(201).json(result[0]);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateComment(req, res) {
    try {
    const { content,postId,userId } = req.body;
    const result = await db
      .update(comments)
      .set({ content,postId,userId })
      .where(eq(comments.id, Number(req.params.id)))
      .returning();

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, Number(req.params.id)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

