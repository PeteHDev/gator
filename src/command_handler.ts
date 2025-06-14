import { readConfig, setUser } from "./config";
import { createFeedFollow, deleteFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follows";
import { createFeed, getFeedById, getFeeds } from "./lib/db/queries/feeds";
import { createUser, deleteAllUsers, getUserByName, getUsers, getUserById } from "./lib/db/queries/users";
import { type Feed, type User } from "./lib/db/schema";
import { fetchFeed } from "./rss";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void> | void;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <user name>>`);
    }

    const userName = args[0];
    if (await getUserByName(userName) === undefined) {
        throw new Error(`user ${userName} does not exist`);
    }

    setUser(args[0]);
    console.log(`user "${args[0]}" has been set`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <user name>`);
    }

    const userName = args[0];
    if (await getUserByName(userName) !== undefined) {
        throw new Error(`user ${userName} already exists`);
    }

    const user = await createUser(userName);
    setUser(userName);
    console.log(`user ${userName} has been created`);
    console.log(user);
}

export async function handlerUsers() {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;
    for (const user of users) {
        let name = user.name;
        if (name === currentUser) {
            name += " (current)";
        }
        console.log(`* ${name}`);
    }
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    await deleteAllUsers();
}

export async function handlerAgg() {
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(feed.channel);
    console.log(feed.channel.title);
    console.log(feed.channel.link);
    console.log(feed.channel.description);
    console.log("items:");
    for (const item of feed.channel.item) {
        console.log("================");
        console.log(item.title);
        console.log(item.link);
        console.log(item.description);
        console.log(item.pubDate);
    }
}

export async function handlerAddfeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <feed name> <feed URL>`);
    }

    const feedName = args[0];
    const feedURL = args[1];

    try {
        await fetchFeed(feedURL);
        const feedInDb: Feed = await createFeed(feedName, feedURL, user.id);

        const newFeedFollow = await createFeedFollow(user.id, feedURL);
        printFeed(feedInDb, user);
    } catch(err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            console.error(`Unexpected exception caught trying to run command: ${err}`);
        }
    }
}

export async function handlerFeeds() {
    try {
        const allFeeds = await getFeeds();

        for (const feed of allFeeds) {
            const id = feed.id;
            const url = feed.url;
            const feedName = feed.name;

            const user = await getUserById(feed.userId);
            console.log(`${id}|     ${url}|     ${feedName}|     ${user?.name}`);
        }
    } catch(err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            console.error(`Unexpected exception caught trying to run command: ${err}`);
        }
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <feed URL>`);
    }

    try {
        const newFeedFollow = await createFeedFollow(user.id, args[0]);

        console.log("user: " + user.name);
        console.log("follows: " + newFeedFollow.name);
    } catch(err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            console.error(`Unexpected exception caught trying to run command: ${err}`);
        }
    }
}

export async function handlerFollowing(cmdName: string, user: User) {
    try {
        const followsList = await getFeedFollowsForUser(user.name);
        console.log(`${user.name} follows:`);
        for (const follow of followsList) {
            const feed = await getFeedById(follow.feedId);
            if (feed === undefined) {
                continue;
            }
            console.log("* " + feed.name);
        }
    } catch(err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            console.error(`Unexpected exception caught trying to run command: ${err}`);
        }
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <feed URL>`);
    }

    try {
        await deleteFollow(user, args[0]);
    } catch(err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            console.error(`Unexpected exception caught trying to run command: ${err}`);
        }
    }
}

function printFeed(feed: Feed, user: User) {
    console.log("=====User=====");
    printUser(user);
    console.log("=====Feed=====");
    console.log(`id: ${feed.id}`);
    console.log(`name: ${feed.name}`);
    console.log(`created: ${feed.createdAt}`);
    console.log(`updated: ${feed.updatedAt}`);
    console.log(`url: ${feed.url}`);
    console.log(`user id: ${feed.userId}`);
}

function printUser(user: User) {
    console.log(`id: ${user.id}`);
    console.log(`name: ${user.name}`);
    console.log(`created: ${user.createdAt}`);
    console.log(`updated: ${user.updatedAt}`);
}
