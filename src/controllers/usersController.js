import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// import { pool } from "../db/index.js";


export async function getusers(req, res) {
     try {
    const result = await db.select().from(users).orderBy(users.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getuser(req, res) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(req.params.id)));
      res.json(result[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createUser(req, res) {
    try {
    const { name, email, age } = req.body;
    const result = await db
      .insert(users)
      .values({ name, email, age })
      .returning();

      res.status(201).json(result[0]);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUser(req, res) {
    try {
    const { name, email } = req.body;
    const result = await db
      .update(users)
      .set({ name, email })
      .where(eq(users.id, Number(req.params.id)))
      .returning();

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const result = await db
      .delete(users)
      .where(eq(users.id, Number(req.params.id)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

