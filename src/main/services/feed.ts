import { Database, DBFeed } from '../lib/database';
import {
  loadFeedItems,
  UpstreamFeedItem,
  upstreamFeedItemToDbFeedItemId
} from './upstream-feed';
import { FeedItem } from '../lib/types';

export const AllFeedsId = 'all';

export async function loadFeedsItems(
  database: Database,
  feedIds: string[],
  proxyUrl: string,
  showUnreadItems: boolean)
  : Promise<[[FeedItem[], NextPageData[]], Set<string>]> {
  const dbFeeds = feedIds[0] === AllFeedsId
    ? await database.loadFeeds()
    : await database.loadFeedsById(feedIds);

  const feedItems = await load(
    dbFeeds, f => f.url, proxyUrl, showUnreadItems);

  return Promise.all([
    feedItems,
    database.loadSavedFeedItemIds(),
  ]);
}

export async function loadNextPages(
  database: Database,
  nextPages: NextPageData[],
  proxyUrl: string,
  showUnreadItems: boolean)
  : Promise<[FeedItem[], NextPageData[]]> {
  const urlForFeed = (dbFeed: DBFeed) =>
    nextPages.find(p => p.feedId === dbFeed.id)!.url;

  const dbFeeds = (await database
    .loadFeedsById(nextPages.map(({ feedId }) => feedId)))
    .filter(f => urlForFeed(f) !== null);

  return load(dbFeeds, urlForFeed, proxyUrl, showUnreadItems);
}

async function load(
  dbFeeds: DBFeed[],
  urlForFeed: (f: DBFeed) => string,
  proxyUrl: string,
  showUnreadItems: boolean) {
  const feedItems = (await Promise.all(
    dbFeeds.map(dbFeed => loadFeedItems(
      dbFeed,
      urlForFeed(dbFeed),
      proxyUrl)
      .then<[FeedItem[], NextPageData | null]>
      (([upstreamFeedItems, nextPageUrl]) =>
        [
          upstreamFeedItems.map(upstreamToFeedItem(dbFeed)),
          nextPageUrl
            ? {
              feedId: dbFeed.id,
              url: nextPageUrl,
            }
            : null
        ]))));

  return result(dbFeeds, feedItems, showUnreadItems);
}

function result(
  dbFeeds: DBFeed[],
  feedItems: [FeedItem[], NextPageData | null][],
  showUnreadItems: boolean)
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
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .filter(i => showUnreadItems ? i : !i.read);

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
