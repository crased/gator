import { XMLParser } from "fast-xml-parser";
import { Agent } from "http";
import { eq, sql } from 'drizzle-orm';
import { firstOrUndefined } from ".//lib/db/queries/utils";
import { db } from "./lib/db/index";
import { feeds, users, feedFollows } from "./schema";

export async function fetchFeed(feedURL: string) {
const resp = await fetch(feedURL,{ 
headers: {  
"User-Agent": "gator",
},
})
const data = await resp.text();
const parser = new XMLParser();
const parsed = parser.parse(data);
if (typeof parsed.rss.channel === 'undefined') {
throw new Error('channel: does not exist');
};
if (!parsed.rss.channel.title) {
  throw new Error('channel title is missing')
};
if (!parsed.rss.channel.link) {
  throw new Error('channel link is missing')
}
if (!parsed.rss.channel.description) {
  throw new Error('channel description is missing')
}
const channel = { 
  title: parsed.rss.channel.title,
  link: parsed.rss.channel.link,
  description: parsed.rss.channel.description
};
let items = parsed.rss.channel.item
if (!Array.isArray(items) && typeof items !== 'undefined') {
items = [items]
} 
if (typeof items === 'undefined') {
items = []  
};
let itemList = []
for (const item of items) {
if (typeof item.title !== 'undefined' && typeof item.link !== 'undefined' && typeof item.description !== 'undefined' && typeof item.pubDate !== 'undefined') {
itemList.push(item);
}
};
const rssFeed = {
channel: {
 title: channel.title,
 link: channel.link,
 description: channel.description,
 item: itemList
}
}
return rssFeed;
};
