import { db } from "..";
import { feedFollows, users, feeds } from "../schema";
import { eq } from "drizzle-orm";
import { getFeedByURL } from "./feeds";
import { getUserByName } from "./users";

export async function createFeedFollow(userId: string, feedURL: string) {
    const feed = await getFeedByURL(feedURL);
    if (feed === undefined) {
        throw new Error("no feed registered with porvided URL");
    }

    const [newFeedFollow] = await db.insert(feedFollows).values( { userId: userId, feedId: feed.id }).returning();

    const [fullNewFeedFollow] = await db
    .select({ 
        id: feedFollows.id,
        name: feeds.name,
        userName: users.name,
        feedId: feeds.id,
        userId: users.id,
        feedFollowCreatedAt: feedFollows.createdAt,
        feedFollowUpdatedAT: feedFollows.updatedAt,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

    return fullNewFeedFollow;
}

export async function getFeedFollowsForUser(userName: string) {
    const user = await getUserByName(userName);
    if (user === undefined) {
        throw new Error(`user ${userName} is not ragistered`);
    }

    const followsList = await db.select().from(feedFollows).where(eq(feedFollows.userId, user.id));

    return followsList;
}