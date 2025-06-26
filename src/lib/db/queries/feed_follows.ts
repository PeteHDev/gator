import { db } from "..";
import { feedFollows, users, feeds, User } from "../schema";
import { eq, and } from "drizzle-orm";
import { getFeedById, getFeedByURL } from "./feeds";
import { getCurrentUser, getUserByName } from "./users";

export async function createFeedFollow(userId: string, feedURL: string) {
    const feed = await getFeedByURL(feedURL);
    if (feed === undefined) {
        throw new Error("No feed registered with provided URL");
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

export async function deleteFollow(user: User, feedURL: string) {
    const feed = await getFeedByURL(feedURL);
    if (feed === undefined) {
        throw new Error(`db: feed ${feedURL} not found`);
    }

    await db.delete(feedFollows).where(eq(feedFollows.userId, user.id) && eq(feedFollows.feedId, feed.id));
}

export async function isFollowing(feedURL: string): Promise<boolean> {
    const feed = await getFeedByURL(feedURL);
    if (feed === undefined) {
        throw new Error("Missing feed with the given URL.");
    }

    const user = await getCurrentUser();
    if (user === undefined) {
        throw new Error("Current user is not registered");
    }
    const [feedFollow] = await db.select().from(feedFollows)
                                        .where(and(
                                            eq(feedFollows.feedId, feed.id),
                                            eq(feedFollows.userId, user?.id)));
    if (feedFollow !== undefined) {
        return true;
    }

    return false;
}