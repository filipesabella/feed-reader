import { Database, DBFeed } from './db';
import { loadFeedItems, RSSFeedItem, rssFeedItemToDbFeedItemId, RSSFeed } from './rss';
import { Feed, FeedItem } from './types';

export async function loadFeedsItems(
  database: Database,
  feedIds: string[],
  page = 1): Promise<FeedItem[]> {
  const dbFeeds = await database.loadFeedsById(feedIds);
  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(dbFeed.url, page)
      .then(rssFeedItems => rssFeedItems.map(rssToFeedItem(dbFeed))))))
    .reduce((acc, a) => acc.concat(a), [] as FeedItem[])
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return feedItems;
}

const rssToFeedItem = (dbFeed: DBFeed) =>
  (rssFeedItem: RSSFeedItem): FeedItem => {
    return {
      ...rssFeedItem,
      id: rssFeedItemToDbFeedItemId(rssFeedItem),
      feedId: dbFeed.id,
      read: dbFeed.readItemsIds.includes(rssFeedItemToDbFeedItemId(rssFeedItem)),
    };
  };
