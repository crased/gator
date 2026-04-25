import { foreignKey } from 'drizzle-orm/gel-core';
import { pgTable, timestamp, uuid, text, integer, unique } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel  } from "drizzle-orm"
import { url } from 'inspector';
import { time } from 'console';

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export const users = pgTable("users",{
id: uuid("id").primaryKey().notNull().defaultRandom(),
createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
name: text("name").notNull().unique(),          

});

export const feeds = pgTable("feeds",{
id: uuid("id").primaryKey().notNull().defaultRandom(),
createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
lastFetchedAt: timestamp("last_fetched_at").defaultNow().$onUpdateFn(() => new Date()),
name: text('name').notNull(),
url: text('url').notNull().unique(),
userId: uuid('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull()
});

export const feedFollows = pgTable("feed_follows", {
id: uuid("id").primaryKey().notNull().defaultRandom(),
createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
userId: uuid('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
feedId: uuid('feed_id').references(() => feeds.id, {onDelete: 'cascade'}).notNull(),
}, (t) => [
unique().on(t.userId, t.feedId)
]);

export const posts = pgTable("posts", {
id: uuid("id").primaryKey().notNull().defaultRandom(),
createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
title: text().notNull(),
url: text('url').notNull().unique(),
description: text(),
publishedAt: timestamp("published_at").defaultNow().$onUpdateFn(() => new Date()),
feedId: uuid("feed_id").references(() => feeds.id, {onDelete: 'cascade'}).notNull(),
});