// import { pool } from "../db/index.js";

import { db } from "../db/index.js";
import { posts,users,categories } from "../db/schema.js";
import { eq, ne, count } from "drizzle-orm";

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
    // Check if user is admin (from JWT token if available)
    const userRole = req.user?.role;
    const isAdmin = userRole === "admin";
    
    // Get status query parameter
    const statusParam = req.query.status;
    
    // Determine if we should fetch all posts or only active
    // status=all is only respected for admins
    const shouldFetchAll = isAdmin && statusParam === "all";

    // Get pagination parameters (validated by middleware)
    const { limit, offset } = req.pagination || { limit: 10, offset: 0 };

    // Build base query with select and joins
    let baseQuery = db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        status: posts.status,
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
      .leftJoin(categories, eq(posts.categoryId, categories.id));

    // Apply status filter based on admin role and query parameter
    // Only show suspended posts if:
    // 1. User is authenticated as admin AND
    // 2. status=all parameter is explicitly passed
    let finalQuery = baseQuery;
    if (!shouldFetchAll) {
      // Filter out suspended posts (default behavior)
      finalQuery = baseQuery.where(ne(posts.status, "suspended"));
    }

    // Get total count for pagination
    // Build count query with same filters as main query
    let countQuery = db.select({ count: count() }).from(posts);
    if (!shouldFetchAll) {
      countQuery = db.select({ count: count() }).from(posts).where(ne(posts.status, "suspended"));
    }
    const countResult = await countQuery;
    const totalCount = parseInt(countResult[0]?.count || 0);

    // Execute paginated query
    const result = await finalQuery
      .orderBy(posts.createdAt)
      .limit(limit)
      .offset(offset);

    res.json({
      data: result,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPost(req, res) {
  const id = req.params.id;
  try {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        status: posts.status,
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
      .where(eq(posts.id, id));
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function createPost(req, res) {
  // Use userId from body or from authenticated user
  const { title, content, imageUrl, userId: bodyUserId, categoryId } = req.body;
  const userId = bodyUserId || req.user?.id;
  
  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Check if user is suspended
    const userArray = await db.select().from(users).where(eq(users.id, userId));
    const user = userArray[0];
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended and you cannot create posts" });
    }

    const result = await db.insert(posts).values({ 
      title, 
      content, 
      imageUrl, 
      authorId: userId, 
      categoryId,
      status: "active"
    }).returning();
    
    // Return post with author and category info (matching getPosts structure)
    const postWithRelations = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        status: posts.status,
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
      .where(eq(posts.id, result[0].id))
      .limit(1);
    
    res.status(201).json(postWithRelations[0] || result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePost(req, res) {
  const id = req.params.id;
  const { title, content, imageUrl, likesCount, userId, categoryId, status } = req.body;
  try {
    // Check if post exists
    const postArray = await db.select().from(posts).where(eq(posts.id, id));
    const post = postArray[0];
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check authorization: only author or admin can update
    if (req.user.role !== "admin" && post.authorId !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own posts" });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (likesCount !== undefined) updateData.likesCount = likesCount;
    if (userId !== undefined) updateData.authorId = userId;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (status !== undefined) updateData.status = status;

    // Check if at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update provided" });
    }

    const result = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning();
    
    // Return updated post with author and category info (matching getPosts structure)
    const updatedPostWithRelations = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        status: posts.status,
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
      .where(eq(posts.id, id))
      .limit(1);
    
    res.json(updatedPostWithRelations[0] || result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deletePost(req, res) {
  const id = req.params.id;
  try {
    // Check if post exists
    const postArray = await db.select().from(posts).where(eq(posts.id, id));
    const post = postArray[0];
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check authorization: only author or admin can delete
    if (req.user.role !== "admin" && post.authorId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

