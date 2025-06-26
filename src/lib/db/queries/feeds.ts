import { db } from "..";
import { fetchFeed } from "../../../rss";
import { feeds } from "../schema";
import { eq, sql } from "drizzle-orm";
import { createPost } from "./posts";

export async function createFeed(name: string, url: string, userId: string | undefined) {
    if (userId === undefined) {
        throw new Error("Cannot create feed. Missing user id.");
    }
    
    const [result] = await db.insert(feeds).values({ name: name, url: url, userId: userId }).returning();
    return result;
}

export async function getFeeds() {
    const allFeeds = await db.select().from(feeds);

    return allFeeds;
}

export async function getFeedByURL(feedURL: string) {
    const feed = await db.query.feeds.findFirst({
        where: eq(feeds.url, feedURL)
    });

    return feed;
}

export async function getFeedById(feedId: string) {
    const feed = await db.query.feeds.findFirst({
        where: eq(feeds.id, feedId)
    });

    return feed;
}

export async function getNextFeedToFetch() {
    const [feed] = await db.select().from(feeds).orderBy(sql`${feeds.lastFetchedAt} nulls first`);
    if (feed === undefined) {
        throw new Error("No feeds to fetch");
    }

    return feed;
}

export async function scrapeFeeds() {
    const nextFeed = await getNextFeedToFetch();
    markFeedFetched(nextFeed.url);
    const fetchedFeed = await fetchFeed(nextFeed.url);

    console.log(`Fetching posts from ${nextFeed.name} (${nextFeed.url})...`);
    let createdNewPosts = false;
    for (const item of fetchedFeed.channel.item) {
        const publishedAt = new Date(item.pubDate).toISOString();
        const success = await createPost(item.title, item.link, item.description, publishedAt, nextFeed.id);
        if (success) {
            createdNewPosts = true;
        }
    }
    if (!createdNewPosts) {
        console.log("No new posts!");
    }
}

async function markFeedFetched(feedURL: string) {
    const feed = await getFeedByURL(feedURL);
    if (feed === undefined) {
        throw new Error("Missing feed with the given URL.");
    }

    await db
        .update(feeds)
        .set({ lastFetchedAt: getLocalTimeAsUTC() })
        .where(eq(feeds.id, feed.id));
}

function getLocalTimeAsUTC() {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
}
