import { Database, DBFeed } from './db';
import {
  loadFeedItems,
  RSSFeedItem,
  rssFeedItemToDbFeedItemId
} from './rss';
import { FeedItem } from './types';

export async function loadFeedsItems(
  database: Database,
  feedIds: string[]): Promise<[FeedItem[], NextPageData[]]> {
  const dbFeeds = await database.loadFeedsById(feedIds);
  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(dbFeed, dbFeed.url)
      .then<[FeedItem[], NextPageData | null]>(([rssFeedItems, nextPageUrl]) =>
        [rssFeedItems.map(rssToFeedItem(dbFeed)),
        nextPageUrl
          ? {
            feedId: dbFeed.id,
            url: nextPageUrl,
          }
          : null]))));

  return result(feedItems);
}

export async function loadNextPages(
  database: Database,
  nextPages: NextPageData[]): Promise<[FeedItem[], NextPageData[]]> {
  const urlForFeedId = (dbFeed: DBFeed) =>
    nextPages.find(p => p.feedId === dbFeed.id)!;

  const dbFeeds = (await database
    .loadFeedsById(nextPages.map(({ feedId }) => feedId)))
    .filter(f => urlForFeedId(f) !== null);

  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(dbFeed, urlForFeedId(dbFeed).url!)
      .then<[FeedItem[], NextPageData | null]>(([rssFeedItems, nextPageUrl]) =>
        [rssFeedItems.map(rssToFeedItem(dbFeed)),
        nextPageUrl
          ? {
            feedId: dbFeed.id,
            url: nextPageUrl,
          }
          : null]))));

  return result(feedItems);
}

function result(feedItems: [FeedItem[], NextPageData | null][])
  : [FeedItem[], NextPageData[]] {
  const result =
    feedItems.reduce<[FeedItem[], NextPageData[]]>
      ((acc, [feedItems, nextPageData]) => [
        acc[0].concat(feedItems),
        nextPageData ? acc[1].concat(nextPageData) : acc[1]],
        [[], []] as [FeedItem[], NextPageData[]]);

  // sadness
  result[0].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return result;
}

const rssToFeedItem = (dbFeed: DBFeed) =>
  (rssFeedItem: RSSFeedItem): FeedItem => {
    const id = rssFeedItemToDbFeedItemId(rssFeedItem);
    return {
      ...rssFeedItem,
      id,
      feedId: dbFeed.id,
      read: dbFeed.readItemsIds.includes(id),
    };
  };

export interface NextPageData {
  feedId: string;
  url: string;
}
