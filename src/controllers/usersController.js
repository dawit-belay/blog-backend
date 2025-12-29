import { db } from "../db/index.js";
import bcrypt from "bcrypt";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateToken } from "../utils/jwt.js";

// import { pool } from "../db/index.js";


export async function signupUser(req, res) {
    try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.insert(users)
      .values({ name, email, password: hashedPassword, role: "user" })
      .returning();

    const createdUser = newUser[0];
    const token = generateToken(newUser[0]);

    res.status(201).json({
    user: {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    },
    token,
  });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function loginUser(req, res){
  try {
    const { email, password } = req.body;
    
    const usersArray = await db.select().from(users).where(eq(users.email, email));
    const user = usersArray[0]; // get the first user

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


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

export async function becomecreator(req, res) {
  try {
    const { id } = req.params;
    const result = await db
      .update(users)
      .set({ role: "creator" })
      .where(eq(users.id, id))
      .returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function updateUser(req, res) {
    try {
    const { name, email, password, role } = req.body;
    const result = await db
      .update(users)
      .set({ name, email, password, role })
      .where(eq(users.id, req.params.id))
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

