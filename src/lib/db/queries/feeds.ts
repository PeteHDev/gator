import { UUID } from "crypto";
import { db } from "..";
import { users, feeds } from "../schema";
import { eq } from "drizzle-orm";

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