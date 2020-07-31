import { Database, DBFeed } from './db';
import {
  loadFeedItems,
  UpstreamFeedItem,
  upstreamFeedItemToDbFeedItemId
} from './feeds';
import { FeedItem } from './types';

export const AllFeedsId = 'all';

export async function loadFeedsItems(
  database: Database,
  feedIds: string[],
  proxyUrl: string,): Promise<[FeedItem[], NextPageData[]]> {
  const dbFeeds = feedIds[0] === AllFeedsId
    ? await database.loadFeeds()
    : await database.loadFeedsById(feedIds);

  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(dbFeed, dbFeed.url, proxyUrl)
      .then<[FeedItem[], NextPageData | null]>
      (([upstreamFeedItems, nextPageUrl]) =>
        [upstreamFeedItems.map(upstreamToFeedItem(dbFeed)),
        nextPageUrl
          ? {
            feedId: dbFeed.id,
            url: nextPageUrl,
          }
          : null]))));

  return result(dbFeedsById(dbFeeds), feedItems);
}

export async function loadNextPages(
  database: Database,
  nextPages: NextPageData[],
  proxyUrl: string,): Promise<[FeedItem[], NextPageData[]]> {
  const urlForFeedId = (dbFeed: DBFeed) =>
    nextPages.find(p => p.feedId === dbFeed.id)!;

  const dbFeeds = (await database
    .loadFeedsById(nextPages.map(({ feedId }) => feedId)))
    .filter(f => urlForFeedId(f) !== null);

  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(dbFeed,
      urlForFeedId(dbFeed).url!,
      proxyUrl)
      .then<[FeedItem[], NextPageData | null]>(([feedItems, nextPageUrl]) =>
        [feedItems.map(upstreamToFeedItem(dbFeed)),
        nextPageUrl
          ? {
            feedId: dbFeed.id,
            url: nextPageUrl,
          }
          : null]))));

  return result(dbFeedsById(dbFeeds), feedItems);
}

function result(
  feedsById: FeedBlockedWordsById,
  feedItems: [FeedItem[], NextPageData | null][])
  : [FeedItem[], NextPageData[]] {
  const result =
    feedItems.reduce<[FeedItem[], NextPageData[]]>
      ((acc, [feedItems, nextPageData]) => [
        acc[0].concat(feedItems),
        nextPageData ? acc[1].concat(nextPageData) : acc[1]],
        [[], []] as [FeedItem[], NextPageData[]]);

  const eligibleItems = result[0]
    .filter(item => {
      const regexp = feedsById[item.feedId];
      if (!regexp) return true;
      return !item.title.match(regexp);
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return [eligibleItems, result[1]];
}

type FeedBlockedWordsById = { [id: string]: RegExp | null };
function dbFeedsById(dbFeeds: DBFeed[]): FeedBlockedWordsById {
  return dbFeeds.reduce(
    (acc, f) => {
      if (f.blockedWords) {
        acc[f.id] = new RegExp(
          '(' + f.blockedWords.replace(/\s/g, '|') + ')', 'i');
      }
      return acc;

    },
    {} as FeedBlockedWordsById);
}

const upstreamToFeedItem = (dbFeed: DBFeed) =>
  (upstreamFeedItem: UpstreamFeedItem): FeedItem => {
    const id = upstreamFeedItemToDbFeedItemId(upstreamFeedItem);
    return {
      ...upstreamFeedItem,
      id,
      feedId: dbFeed.id,
      read: dbFeed.readItemsIds.includes(id),
      scriptToInline: dbFeed.scriptToInline,
    };
  };

export interface NextPageData {
  feedId: string;
  url: string;
}
