import { db } from "./lib/db/index";
import { feeds, feedFollows, users, posts, User } from "./schema";
import { getFeeds, getFeed, getFeedFollowsForUser } from "./lib/db/queries/feeds";
import { eq, and, sql } from "drizzle-orm";
import { firstOrUndefined } from "./lib/db/queries/utils";
import { fetchFeed } from "./fetch";

export async function createPost(title: string, url: string, description: string| null, publishedAt: Date, feedId: string) {
const [res] = await db.insert(posts).values({title, url, description, publishedAt,feedId, }).returning();
return res;
};

export async function getPostsForUser(userId: string,limitPost = 2) {
const res = await db.select()
.from(posts)
.innerJoin(feeds, eq(posts.feedId, feeds.id))
.innerJoin(feedFollows ,eq(feedFollows.feedId, feeds.id))
.where(eq(feedFollows.userId, userId))
.orderBy(sql`${posts.publishedAt} desc nulls last `)
.limit(limitPost)

return res
};

export async function handlerBrowse(cmdName: string, user: User, ...args: string[]) {
if (!user) {
  throw new Error("no current user to be found")
}  
const parsed = Number(args[0]);
const limit = args[0] && !Number.isNaN(parsed) ? parsed : 2;
const res = await getPostsForUser(user.id, limit)
for (const row of res) {
  console.log(`Title: ${row.posts.title}`);
  console.log(`URL: ${row.posts.url}`);
  console.log(`Published: ${row.posts.publishedAt}`);
  console.log(`Description: ${row.posts.description ?? "No description"}`);
  console.log();
}
};