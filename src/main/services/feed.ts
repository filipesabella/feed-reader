import { Database, DBFeed } from '../lib/database';
import {
  loadFeedItems,
  UpstreamFeedItem,
  upstreamFeedItemToDbFeedItemId
} from './upstream-feed';
import { FeedItem } from '../lib/types';

export const AllFeedsId = 'all';

// I'm not touching the duplication between this and the next function
// until I add some tests.
export async function loadFeedsItems(
  database: Database,
  feedIds: string[],
  proxyUrl: string,
  showUnreadItems: boolean)
  : Promise<[[FeedItem[], NextPageData[]], Set<string>]> {
  const dbFeeds = feedIds[0] === AllFeedsId
    ? await database.loadFeeds()
    : await database.loadFeedsById(feedIds);

  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(dbFeed, dbFeed.url, proxyUrl)
      .then<[FeedItem[], NextPageData | null]>
      (([upstreamFeedItems, nextPageUrl]) =>
        [
          filterItems(
            showUnreadItems,
            upstreamFeedItems.map(upstreamToFeedItem(dbFeed))),
          nextPageUrl
            ? {
              feedId: dbFeed.id,
              url: nextPageUrl,
            }
            : null
        ]))));

  return Promise.all([
    result(dbFeeds, feedItems),
    database.loadSavedFeedItemIds(),
  ]);
}

export async function loadNextPages(
  database: Database,
  nextPages: NextPageData[],
  proxyUrl: string,
  showUnreadItems: boolean)
  : Promise<[FeedItem[], NextPageData[]]> {
  const urlForFeedId = (dbFeed: DBFeed) =>
    nextPages.find(p => p.feedId === dbFeed.id)!;

  const dbFeeds = (await database
    .loadFeedsById(nextPages.map(({ feedId }) => feedId)))
    .filter(f => urlForFeedId(f) !== null);

  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(
      dbFeed,
      urlForFeedId(dbFeed).url!,
      proxyUrl)
      .then<[FeedItem[], NextPageData | null]>
      (([upstreamFeedItems, nextPageUrl]) =>
        [
          filterItems(
            showUnreadItems,
            upstreamFeedItems.map(upstreamToFeedItem(dbFeed))),
          nextPageUrl
            ? {
              feedId: dbFeed.id,
              url: nextPageUrl,
            }
            : null
        ]))));

  return result(dbFeeds, feedItems);
}

function filterItems(showUnreadItems: boolean, items: FeedItem[]): FeedItem[] {
  return showUnreadItems
    ? items
    : items.filter(i => !i.read);
}

function result(
  dbFeeds: DBFeed[],
  feedItems: [FeedItem[], NextPageData | null][])
  : [FeedItem[], NextPageData[]] {
  const blockedWords = blockedWordsByFeedId(dbFeeds);

  const [items, nextPages] =
    feedItems.reduce<[FeedItem[], NextPageData[]]>
      ((acc, [feedItems, nextPageData]) => [
        acc[0].concat(feedItems),
        nextPageData ? acc[1].concat(nextPageData) : acc[1]],
        [[], []] as [FeedItem[], NextPageData[]]);

  const eligibleItems = items
    .filter(item => {
      const regexp = blockedWords[item.feedId];
      if (!regexp) return true;
      return !item.title.match(regexp);
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return [eligibleItems, nextPages];
}

type FeedBlockedWordsById = { [id: string]: RegExp | null };

function blockedWordsByFeedId(dbFeeds: DBFeed[]): FeedBlockedWordsById {
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
