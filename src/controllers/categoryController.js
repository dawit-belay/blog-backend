import { db } from "../db/index.js";
import { categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

// import { pool } from "../db/index.js";


export async function getcategorys(req, res) {
     try {
    const result = await db.select().from(categories).orderBy(categories.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCategory(req, res) {
    try {
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.id, Number(req.params.id)));
      res.json(result[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCategory(req, res) {
    try {
    const { name } = req.body;
    const result = await db
      .insert(categories)
      .values({ name })
      .returning();

      res.status(201).json(result[0]);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateCategory(req, res) {
    try {
    const { name } = req.body;
    const result = await db
      .update(categories)
      .set({ name })
      .where(eq(categories.id, Number(req.params.id)))
      .returning();

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, Number(req.params.id)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

