import Dexie from 'dexie';
import { seed } from './seedData';
import { Feed } from './types';

const dbName = 'Feed-Reader-DB';
let db: DixieNonSense;

const devMode = process.env.DEV_MODE;
const resetDb = window.location.hash.startsWith('#reset');

export class Database {
  constructor() {
    db = new DixieNonSense();
  }

  public async initialize(): Promise<DBSettings> {
    if (devMode && resetDb) {
      await Dexie.delete(dbName);
    }

    db = new DixieNonSense();
    await db.open();

    if (devMode && resetDb) {
      await seed(db);
    }

    return this.initSettings();
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

  public async upsertFeed(feed: Feed): Promise<void> {
    const dbFeed = (await db.feeds.get(feed.id)) || {
      readItemsIds: [],
    };

    await db.feeds.put({
      ...dbFeed,
      ...feed,
    });
  }

  public async deleteFeed(feed: Feed): Promise<void> {
    await db.feeds.delete(feed.id);
  }

  private async initSettings(): Promise<DBSettings> {
    const maybeSettings = await db.settings.get('1');
    if (!maybeSettings) {
      const settings = {
        id: '1',
        darkMode: false,
        proxyUrl: 'https://cors-anywhere.herokuapp.com/',
        gistId: process.env.GIST_ID || '',
        githubToken: process.env.TOKEN || '',
      };
      await db.settings.put(settings);
      return settings;
    } else {
      return maybeSettings;
    }
  }

  public async loadSettings(): Promise<DBSettings> {
    return (await db.settings.get('1'))!;
  }

  public async saveSettings(
    darkMode: boolean,
    proxyUrl: string,
    gistId: string,
    githubToken: string): Promise<void> {
    db.settings.put({
      id: '1',
      darkMode,
      proxyUrl,
      gistId,
      githubToken,
    });
  }

  public async deleteSavedItem(feedItemId: string): Promise<void> {
    await db.savedFeedItems.delete(feedItemId);
  }

  public async saveItem(item: DBSavedFeedItem): Promise<void> {
    await db.savedFeedItems.put(item);
  }

  public async loadSavedFeedItemIds(): Promise<Set<string>> {
    return new Set((await db.savedFeedItems.toArray()).map(f => f.feedItemId));
  }

  public async loadSavedFeedItems(): Promise<DBSavedFeedItem[]> {
    return db.savedFeedItems.toArray();
  }

  public async dump(): Promise<any> {
    const feeds = await this.loadFeeds();
    return {
      feeds,
    };
  }

  public async import(dump: any): Promise<void> {
    db.transaction('rw', db.feeds, async () => {
      await db.feeds.clear();
      await db.feeds.bulkPut(dump.feeds);
    });
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

export interface DBSettings {
  id: string;
  darkMode: boolean;
  proxyUrl: string;
  gistId: string;
  githubToken: string;
}

export interface DBSavedFeedItem {
  feedItemId: string;
  inlineContent: string;
  title: string;
  link: string;
  pubDate: Date;
  comments: string;
  description: string;
  contentEncoded: string;
}

export class DixieNonSense extends Dexie {
  feeds: Dexie.Table<DBFeed, string>;
  settings: Dexie.Table<DBSettings, string>;
  savedFeedItems: Dexie.Table<DBSavedFeedItem, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      feeds: '&id, title, url, category, blockedWords, *readItemsIds',
      settings: '&id, darkMode, proxyUrl, gistId, githubToken',
      savedFeedItems: '&feedItemId, inlineContent, title, link, pubDate, ' +
        'comments,description,contentEncoded',
    });
  }
}

// stackoverflow.com/questions/105034/how-to-create-guid-uuid
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
