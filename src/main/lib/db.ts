import Dexie from 'dexie';
import { RSSFeed, RSSFeedItem, loadFeed } from './rss';
import { Feed, FeedItem } from './types';

const dbName = 'RSS-Reader-DB';
let db: DixieNonSense;

export class Database {
  constructor() {
    db = new DixieNonSense();

    // dev mode
    (window as any).db = db;
  }

  public async initialize(): Promise<void> {
    // next lines for dev mode
    const resetDb = window.location.hash.startsWith('#reset');
    resetDb && await Dexie.delete(dbName);

    db = new DixieNonSense();
    await db.open();

    // next lines for dev mode
    resetDb && await this.insertData();
  }

  private async insertData(): Promise<void> {
    const resetId = window.location.hash.split('=');
    const only = (id: string) => resetId.length < 2 || resetId[1] === id;

    only('1') && await this.insertFeed('1', 'photography',
      await loadFeed('http://www.booooooom.com/feed/'));
    only('11') && await this.insertFeed('11', 'programming',
      await loadFeed('https://news.ycombinator.com/rss'));
    only('111') && await this.insertFeed('111', null,
      await loadFeed('https://lordofthegadflies.tumblr.com/rss'));
    only('1111') && await this.insertFeed('1111', 'photography',
      await loadFeed('https://apod.nasa.gov/apod.rss'));
    only('11111') && await this.insertFeed('11111', 'programming',
      await loadFeed('https://www.reddit.com/r/programming.rss'));
  }

  public async markAsRead(feedItemId: string, read: boolean): Promise<void> {
    await db.items.update(feedItemId, { read: read });
  }

  public async loadFeeds(): Promise<Feed[]> {
    return (await db.feeds.toArray()).map(f => ({
      ...f,
      items: [],
    }));
  }

  public async loadFeedsById(feedIds: string[]): Promise<Feed | undefined> {
    const feeds = await db.feeds.where('id').anyOf(feedIds).toArray();

    const items = (await Promise.all(
      feeds.map(feed => db.items
        .where({ feedId: feed.id, read: 'false' })
        .toArray())))
      .reduce((acc, e) => acc.concat(e), [])
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .map(i => ({
        id: i.id,
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        comments: i.comments,
        description: i.description,
        contentEncoded: i.contentEncoded,
        read: i.read === 'true',
      }));

    if (feedIds.length > 1) {
      return {
        id: '',
        title: '',
        category: '',
        description: '',
        link: '',
        items,
      };
    } else {
      return {
        ...feeds[0],
        items,
      };
    }
  }

  public async insertFeed(
    feedId: string,
    category: string | null,
    rssFeed: RSSFeed): Promise<void> {
    await db.transaction('rw', db.feeds, db.items, async () => {
      await db.feeds.put({
        id: feedId,
        title: rssFeed.title,
        link: rssFeed.link,
        description: rssFeed.description,
        category,
      });

      await rssFeed.items
        .map(async rssFeedItem => {
          await db.items.put({
            id: rssFeedItemKey(rssFeedItem),
            feedId: feedId,
            read: 'false',
            ...rssFeedItem,
          });
        });
    });
  }

  /*public async updateFeed(feedId: string, rssFeed: RSSFeed): Promise<void> {
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
  }*/
}

function rssFeedItemKey(item: RSSFeedItem): string {
  return `${item.title.trim()}_${item.pubDate}`;
}

interface DBFeed {
  id: string;
  title: string;
  link: string;
  description: string;
  category: string | null;
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
  // dexie doesn't index booleans
  read: string;
}

class DixieNonSense extends Dexie {
  feeds: Dexie.Table<DBFeed, string>;
  items: Dexie.Table<DBFeedItem, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      feeds: '&id, title, link, description, category',
      items: '&id, feedId, [feedId+read], title, link, pubDate, comments, description',
    });
  }
}
