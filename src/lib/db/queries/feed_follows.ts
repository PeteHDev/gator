import { db } from "..";
import { feedFollows, users, feeds } from "../schema";
import { eq } from "drizzle-orm";
import { getFeedByURL } from "./feeds";

export async function createFeedFollow(userId: string, feedURL: string) {
    const feed = await getFeedByURL(feedURL);
    if (feed === undefined) {
        throw new Error("no feed registered with porvided URL");
    }

    const [newFeedFollow] = await db.insert(feedFollows).values( { userId: userId, feedId: feed.id });

    const fullNewFeedFollow = await db
    .select({ 
        feedFollowId: feedFollows.id,
        feedName: feeds.name,
        feedUser: users.name,
        feedId: feeds.id,
        userId: users.id,
        feedFollowCreatedAt: feedFollows.createdAt,
        feedFollowUpdatedAT: feedFollows.updatedAt,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id));

    return fullNewFeedFollow;
}