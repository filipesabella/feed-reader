import Dexie from 'dexie';
import { RSSFeed, RSSFeedItem, loadFeed } from './rss';
import { Feed } from './types';

const dbName = 'RSS-Reader-DB';
let db: DixieNonSense;

export class Database {
  constructor() {
    db = new DixieNonSense();
  }

  public async initialize(): Promise<void> {
    // next lines for dev mode
    Dexie.delete(dbName);

    db = new DixieNonSense();
    await db.open();

    // next lines for dev mode
    await this.insertData();
  }

  private async insertData(): Promise<void> {
    await this.insertFeed('1', await loadFeed('http://www.booooooom.com/feed/'));
    await this.insertFeed('11', await loadFeed('news.ycombinator.com/rss'));
  }

  public async loadFeeds(): Promise<Feed[]> {
    return (await db.feeds.toArray()).map(f => ({
      ...f,
      items: [],
    }));
  }

  public async loadFeed(feedId: string): Promise<Feed | undefined> {
    const feed = await db.feeds.get(feedId);
    if (!feed) return;

    const items = await db.items.where('feedId').equals(feedId).toArray();
    return {
      ...feed,
      items: items.map(i => ({
        id: i.id,
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        comments: i.comments,
        description: i.description,
        contentEncoded: i.contentEncoded,
        read: i.read,
      }))
    };
  }

  public async insertFeed(feedId: string, rssFeed: RSSFeed): Promise<void> {
    await db.transaction('rw', db.feeds, db.items, async () => {
      await db.feeds.put({
        id: feedId,
        title: rssFeed.title,
        link: rssFeed.link,
        description: rssFeed.description,
      });

      await rssFeed.items
        .map(async rssFeedItem => {
          await db.items.put({
            id: rssFeedItemKey(rssFeedItem),
            feedId: feedId,
            read: false,
            ...rssFeedItem,
          });
        });
    });
  }

  public async updateFeed(feedId: string, rssFeed: RSSFeed): Promise<void> {
    await db.transaction('rw', db.feeds, db.items, async () => {
      db.feeds.update(feedId, {
        title: rssFeed.title,
        link: rssFeed.link,
        description: rssFeed.description,
      });

      const currentItemsById = (await db.items
        .where('feedId').equals(feedId)
        .toArray())
        .reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as { [key: string]: DBFeedItem });

      const rssFeedItemsById = rssFeed.items
        .reduce((acc, item) => {
          acc[rssFeedItemKey(item)] = item;
          return acc;
        }, {} as { [key: string]: RSSFeedItem });

      return Object.keys(rssFeedItemsById).forEach(async (rssFeedItemId) => {
        const rssFeedItem = rssFeedItemsById[rssFeedItemId];
        if (!currentItemsById[rssFeedItemId]) {
          await db.items.put({
            id: rssFeedItemId,
            feedId: feedId,
            read: false,
            ...rssFeedItem,
          });
        }
      });
    });
  }
}

function rssFeedItemKey(item: RSSFeedItem): string {
  return `${item.title}_${item.pubDate}`;
}

interface DBFeed {
  id: string;
  title: string;
  link: string;
  description: string;
}

interface DBFeedItem {
  id: string;
  feedId: string;
  title: string;
  link: string;
  pubDate: Date;
  comments: string;
  description: string;
  contentEncoded: string;
  read: boolean;
}

class DixieNonSense extends Dexie {
  feeds: Dexie.Table<DBFeed, string>;
  items: Dexie.Table<DBFeedItem, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      feeds: '&id, title, link, description',
      items: '&id, feedId, title, link, pubDate, comments, description, read',
    });
  }
}
