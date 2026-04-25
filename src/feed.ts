import { readConfig } from "./config";
import { db } from "./lib/db/index";
import { getUser, getUsers } from "./lib/db/queries/users";
import { feeds, Feed, User, feedFollows, users } from "./schema";
import { getFeeds, getFeed, getFeedFollowsForUser } from "./lib/db/queries/feeds";
import { eq, and, sql, desc } from "drizzle-orm";
import { firstOrUndefined } from "./lib/db/queries/utils";
import { fetchFeed } from "./fetch";
import { createPost } from "./posts";

export async function createFeed(name: string, url: string, userId: string) {
const [result] = await db.insert(feeds).values({name, url, userId}).returning();
return result;
}
export function printFeed(feed: Feed, user: User) {
 console.log(`* ID: ${feed.id}`) 
 console.log(`* Name: ${feed.name}`)    
}

export async function addFeed(cmdName: string, user: User, ...args: string[]) {
if (!user) {
  throw new Error("no current user to be found")
}
if (args.length !== 2) {
  throw new Error("missing a argument")  
}
const feed = await createFeed(args[0], args[1], user.id);
if (!feed) { 
  throw new Error('unable to create feed')
}
const res = await createFeedFollow(user.id, feed.id);
console.log(`${res.feedName}\n${res.userName}`);
printFeed(feed, user);
}

export async function handlerFeed() {
const elements = await getFeeds();
for (const elm of elements) {
const resp = await getFeed(elm.userId)
if (typeof resp === 'undefined') {
  throw new Error('no response was found')
}
console.log(`* name: ${elm.name}`)
console.log(`* URL: ${elm.url}`)
console.log(`* User: ${resp.name}`)
}
};

export async function createFeedFollow(userId: string, feedId: string) {
const [newFeedFollow] = await db.insert(feedFollows).values({userId, feedId}).returning();
const [res] = await db.select({
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
.where(eq(feedFollows.id, newFeedFollow.id))
return res;
};

export async function getFeedByUrl(url: string) {
const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));
return feed;
};

export async function followFeed(cmdName: string, user: User, url: string) {
if (typeof user === "undefined") {
  throw new Error(`currentUser not found`)
}
const feed = await getFeedByUrl(url);
if (!feed) {
  throw new Error(`feed not found: ${url}`);
}
const res = await createFeedFollow(user.id, feed.id);
console.log(`${res.feedName}\n ${res.userName}`)
};

export async function following(cmdName: string, user: User) {
user
if (!user) {
  throw new Error(`user not found: ${user}`);
}
const res = await getFeedFollowsForUser(user.id);
for (const follow of res) {
console.log(follow.feedName)
}
};

export async function deleteFeedFollow(user: string, url: string) {
const element = await getFeedByUrl(url)
const res = await db.delete(feedFollows).where(and(
eq(feedFollows.feedId, element.id),
eq(feedFollows.userId, user),
))
return res[0]
};

export async function unfollow(cmdName: string, user: User, ...args: string[] ) {
if (!args[0]) {
throw new Error(`no url was given`)
}
const res = await deleteFeedFollow(user.id, args[0]);
console.log(`user unfollowed user successfully `)
};


export async function markFeedFetched(id: string) {
const res = await db.update(feeds)
.set({ updatedAt: new Date(),lastFetchedAt: new Date() })
.where(eq(feeds.id, id))
.returning();
return firstOrUndefined(res);
};

export async function getNextFeedToFetch() {
const res = await db.select().from(feeds)
.orderBy(sql`${feeds.lastFetchedAt} asc nulls first`)
.limit(1);
return firstOrUndefined(res);
};

export async function scrapeFeed() {
const res = await getNextFeedToFetch();
if (!res) return;
const imp = await markFeedFetched(res.id);
if (!imp) return;
const elements = await fetchFeed(res.url)
for (const item of elements.channel.item) {
 try {
    await createPost(
      item.title,
      item.link,
      item.description ?? null,
      new Date(item.pubDate),
      res.id
    );
  } catch (err) {
    console.log(err);
  }
}
};
