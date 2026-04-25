import { db } from "../index";
import { feeds, users, feedFollows } from "../../../schema";
import { eq } from "drizzle-orm"
import { firstOrUndefined } from "./utils";


export async function getFeed(id: string) {
const result = await db.select({name: users.name}).from(users).where(eq(users.id, id))
return firstOrUndefined(result);
}; 

export async function getFeeds() {
const result = await db.select().from(feeds);
return result;  
};


export async function getFeedFollowsForUser(userId: string) {
const res = await db.select({
id: feedFollows.id,
createdAt: feedFollows.createdAt,
updatedAt: feedFollows.updatedAt,
userId: feedFollows.userId,
feedId: feedFollows.feedId,
feedName: feeds.name,
userName: users.name,
})
.from(feedFollows)
.innerJoin(feeds ,eq(feedFollows.feedId, feeds.id))
.innerJoin(users , eq(feedFollows.userId, users.id))
.where(eq(feedFollows.userId, userId))
return res;
};



