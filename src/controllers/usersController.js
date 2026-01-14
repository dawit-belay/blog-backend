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
      .values({ name, email, password: hashedPassword, role: "user", status: "active" })
      .returning();

    const createdUser = newUser[0];
    const token = generateToken(newUser[0]);

    res.status(201).json({
    user: {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      status: createdUser.status,
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
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const usersArray = await db.select().from(users).where(eq(users.email, email));
    const user = usersArray[0]; // get the first user

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is suspended
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
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
        status: user.status,
      },
      token,
    });

  } catch (err) {
    console.error("Login error:", err);
    // Provide more detailed error information
    const errorMessage = err.message || "Database query failed";
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
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
      const userId = req.params.id; // UUID, not a number
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (result.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function becomecreator(req, res) {
  try {
    const { id } = req.params;

    // Check authorization: user can only change their own role, or admin can change anyone's
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ error: "You can only change your own role" });
    }

    const result = await db
      .update(users)
      .set({ role: "creator" })
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = result[0];
    
    // Generate new token with updated role
    const token = generateToken(updatedUser);

    // Return user data with new token
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      token: token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function updateUser(req, res) {
    try {
    const { name, email, password, role, status } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      // Hash password before storing
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, req.params.id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id; // UUID, not a number
    const result = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

