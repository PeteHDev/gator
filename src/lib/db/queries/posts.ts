import { db } from "..";
import { feedFollows, posts } from "../schema";
import { getCurrentUser } from "./users";
import { eq, desc } from "drizzle-orm";

export async function createPost(title: string, url: string, description: string, publishedAt: string, feedId: string): Promise<boolean> {
    const [post] = await db.select().from(posts).where(eq(posts.url, url));
    if (post !== undefined) {
        return false;
    }
    
    try {
        await fetch(url);
        await db.insert(posts)
            .values({ 
                title: title, 
                url: url,
                description: description, 
                publishedAt: new Date(publishedAt),
                feedId: feedId
            })
            .onConflictDoNothing();
    } catch(err) {
        if (err instanceof Error) {
            console.error(`Failed to create post: ${err.message}.`);
        } else {
            console.error(`Unexpected exception while creating post: ${err}`);
        }
    }

    return true;
}

export async function getPostsForUser(limit: number) {
    const user = await getCurrentUser();
    if (user === undefined) {
        throw new Error("Current user is not registered");
    }
    const results = await db.select()
                        .from(feedFollows)
                        .where(eq(feedFollows.userId, user.id))
                        .innerJoin(posts, eq(feedFollows.feedId, posts.feedId))
                        .orderBy(desc(posts.publishedAt))
                        .limit(limit);

    return results;
}