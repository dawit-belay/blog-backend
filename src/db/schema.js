import { uuid,pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  content: varchar("content", { length: 5000 }).notNull(),
  imageUrl: varchar("image_url", { length: 1024 }),
  authorId: uuid("author_id").notNull().references(() => users.id),
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  likesCount: integer("likes_count").default(0),
  shareCount: integer("share_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  content: varchar("content", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

// export const likes = pgTable("likes", {
//   id: serial("id").primaryKey(),
//   postId: integer("post_id").notNull().references(() => posts.id),
//   userId: integer("user_id").notNull().references(() => users.id),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const shares = pgTable("shares", {
//   id: serial("id").primaryKey(),
//   postId: integer("post_id").notNull().references(() => posts.id),
//   userId: integer("user_id").notNull().references(() => users.id),
//   createdAt: timestamp("created_at").defaultNow(),
// });



// docker exec -it blog-backend-api-1 npx drizzle-kit push