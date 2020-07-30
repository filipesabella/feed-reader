import Dexie from 'dexie';
import { UpstreamFeed } from './feeds';
import { seed } from './seedData';
import { Feed } from './types';

const dbName = 'Feed-Reader-DB';
let db: DixieNonSense;

export class Database {
  constructor() {
    db = new DixieNonSense();
  }

  public async initialize(): Promise<void> {
    // next lines for dev mode
    const resetDb = window.location.hash.startsWith('#reset');
    resetDb && await Dexie.delete(dbName);

    db = new DixieNonSense();
    await db.open();

    // next lines for dev mode
    resetDb && await seed(db);
  }

  public async markAsReadBatch(feedItemIdAndFeedIds: [string, string][])
    : Promise<void> {
    for (let [feedItemId, feedId] of feedItemIdAndFeedIds) {
      await this.markAsRead(feedItemId, feedId, true);
    }
  }

  public async markAsRead(feedItemId: string, feedId: string, read: boolean)
    : Promise<void> {
    const feed = (await db.feeds.get(feedId))!;
    await db.feeds.put({
      ...feed,
      readItemsIds: read
        // only store the past 100 read items, no need for more
        ? [...new Set(feed.readItemsIds.concat(feedItemId))].slice(-100)
        : feed.readItemsIds.filter(i => i !== feedItemId)
    });
  }

  public async loadFeeds(): Promise<DBFeed[]> {
    return await db.feeds.toArray();
  }

  public loadFeedsById(feedIds: string[]): Promise<DBFeed[]> {
    return db.feeds.where('id').anyOf(feedIds).toArray();
  }

  public async insertFeed(
    feedId: string,
    url: string,
    category: string | null,
    feed: UpstreamFeed): Promise<void> {
    await db.feeds.put({
      id: feedId,
      title: feed.title,
      url,
      category,
      blockedWords: '',
      readItemsIds: [],
      scriptToParse: '',
      scriptToInline: '',
      scriptToPaginate: '',
    });
  }

  public async updateFeed(feed: Feed): Promise<void> {
    const dbFeed = (await db.feeds.get(feed.id))!;
    await db.feeds.put({
      ...dbFeed,
      ...feed,
    });
  }

  public async deleteFeed(feed: Feed): Promise<void> {
    await db.feeds.delete(feed.id);
  }
}

export interface DBFeed {
  id: string;
  title: string;
  url: string;
  category: string | null; // this is our app's category
  blockedWords: string | null;
  readItemsIds: string[];
  scriptToParse: string;
  scriptToPaginate: string;
  scriptToInline: string;
}

export class DixieNonSense extends Dexie {
  feeds: Dexie.Table<DBFeed, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      feeds: '&id, title, url, category, blockedWords, *readItemsIds',
    });
  }
}
