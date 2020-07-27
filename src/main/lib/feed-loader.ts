import { Database, DBFeed, DBFeedItem } from './db';
import { CategoryFeed, Feed, FeedItem, } from './types';
import { loadFeedItems, RSSFeedItem, rssFeedItemToDbFeedItemId } from './rss';

export async function loadFeeds(
  database: Database,
  feedIds: string[]): Promise<Feed> {
  const [dbFeeds, dbFeedItems] = await database.loadFeedsById(feedIds);
  const rssFeedItems = await Promise.all(
    dbFeeds.map(feed => loadFeedItems(feed.url)));

  const feeds = dbFeeds.map(feed =>
    merge(
      feed,
      dbFeedItems.filter(i => i.feedId = feed.id),
      rssFeedItems.find(([url, _]) => url === feed.url)![1]));

  if (feedIds.length > 1) {
    // when more than 1 id has been passed, the user has selected a `category`
    // to load. in this case we create a "fake" feed with empty attributes
    // and a concatenation of all feed items contained in those feeds.
    return {
      ...CategoryFeed,
      items: feeds.reduce((acc, f) => acc
        .concat(f.items)
        .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
        [] as FeedItem[]),
    };
  } else {
    return {
      ...feeds[0],
      items: feeds[0].items,
    };
  }
}

function merge(
  dbFeed: DBFeed,
  dbFeedItems: DBFeedItem[],
  rssFeedItems: RSSFeedItem[]): Feed {
  const items: FeedItem[] = rssFeedItems.map(rss => {
    const id = rssFeedItemToDbFeedItemId(rss);
    return {
      ...rss,
      id,
      feedId: dbFeed.id,
      read: !!dbFeedItems.find(i => i.id === id),
    };
  });

  return {
    ...dbFeed,
    items,
  };
}
