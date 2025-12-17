import { relations } from "drizzle-orm/relations";
import { users, posts, categories, likes, comments, shares } from "./schema";

export const postsRelations = relations(posts, ({one, many}) => ({
	user: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
	category: one(categories, {
		fields: [posts.categoryId],
		references: [categories.id]
	}),
	likes: many(likes),
	comments: many(comments),
	shares: many(shares),
}));

export const usersRelations = relations(users, ({many}) => ({
	posts: many(posts),
	likes: many(likes),
	comments: many(comments),
	shares: many(shares),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	posts: many(posts),
}));

export const likesRelations = relations(likes, ({one}) => ({
	post: one(posts, {
		fields: [likes.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [likes.userId],
		references: [users.id]
	}),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const sharesRelations = relations(shares, ({one}) => ({
	post: one(posts, {
		fields: [shares.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [shares.userId],
		references: [users.id]
	}),
}));