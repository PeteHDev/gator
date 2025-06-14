import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string) {
    const response = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator",
        }
    });

    const text = await response.text();
    const parser = new XMLParser();
    const feedXML = parser.parse(text);
    
    if (feedXML.rss === undefined) {
        throw new Error("provided URL is not an RSS");
    }

    if (feedXML.rss.channel === undefined) {
        throw new Error("feed's channel field is missing");
    }

    if (feedXML.rss.channel.title === undefined ||
        feedXML.rss.channel.link === undefined ||
        feedXML.rss.channel.description === undefined) {
            throw new Error("feed's channel field is incomplete");
    }

    const title = feedXML.rss.channel.title;
    const link = feedXML.rss.channel.link;
    const description = feedXML.rss.channel.description;

    if (feedXML.rss.channel.item !== undefined) {
        if (!Array.isArray(feedXML.rss.channel.item)) {
            feedXML.rss.channel.item = [];
        }
    }

    const items: RSSItem[] = [];
    for (const item of feedXML.rss.channel.item) {
        if (!validItem(item)) continue;
        
        items.push({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
        });
    }

    const feedObject: RSSFeed = {
        channel: {
            title: title,
            link: link,
            description: description,
            item: items,
        }
    }

    return feedObject;
}

function validItem(item: any) {
    if (item.title === undefined ||
        item.link === undefined ||
        item.description === undefined) {
            return false;
    }

    return true;
}