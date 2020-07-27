import { Database, DBFeed } from './db';
import { loadFeedItems, RSSFeedItem, rssFeedItemToDbFeedItemId } from './rss';
import { Feed, FeedItem } from './types';

export async function loadFeedsItems(
  database: Database,
  feedIds: string[],
  page = 1): Promise<FeedItem[]> {
  const dbFeeds = await database.loadFeedsById(feedIds);
  const rssFeedItems = await Promise.all(
    dbFeeds.map(feed => loadFeedItems(feed.url, page)));

  const items = dbFeeds.map(feed =>
    merge(
      feed,
      rssFeedItems.find(([url, _]) => url === feed.url)![1]));

  if (feedIds.length > 1) {
    // when more than 1 id has been passed, the user has selected a `category`
    // to load. in this case we create a "fake" feed with empty attributes
    // and a concatenation of all feed items contained in those feeds.
    return items
      .reduce((acc, [_, items]) => acc.concat(items), [] as FeedItem[])
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  } else {
    return items[0];
  }
}

function merge(
  dbFeed: DBFeed,
  rssFeedItems: RSSFeedItem[]): FeedItem[] {
  const items: FeedItem[] = rssFeedItems.map(rss => {
    const id = rssFeedItemToDbFeedItemId(rss);
    return {
      ...rss,
      id,
      feedId: dbFeed.id,
      read: dbFeed.readItemsIds.includes(id),
    };
  });

  return items;
}
