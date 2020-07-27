import Dexie from 'dexie';
import { loadFeed, RSSFeed, rssFeedItemToDbFeedItemId } from './rss';
import { Feed } from './types';

const dbName = 'RSS-Reader-DB';
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
    resetDb && await this.insertData();
  }

  private async insertData(): Promise<void> {
    const resetId = window.location.hash.split('=');

    const shouldInsert = ([id]: string[]) =>
      resetId.length < 2 || resetId[1] === id;

    const toInsert = [
      ['1', 'http://www.booooooom.com/feed/', 'photography'],
      ['2', 'https://news.ycombinator.com/rss', 'programming'],
      ['3', 'https://lordofthegadflies.tumblr.com/rss', ''],
      ['4', 'https://apod.nasa.gov/apod.rss', 'photography'],
      ['5', 'https://www.reddit.com/r/programming.rss', 'programming']];

    const rssFeeds = await Promise.all(
      toInsert
        .filter(shouldInsert)
        .map(a => loadFeed(a[1])));

    await Promise.all(rssFeeds.map(f => {
      const data = toInsert.find(i => i[1] === f.url)!;
      return this.insertFeed(data[0], data[1], data[2] || null, f);
    }));
  }

  public async markAsRead(feedItemId: string, feedId: string, read: boolean)
    : Promise<void> {
    if (read) {
      await db.readItems.put({
        id: feedItemId,
        feedId: feedId,
      });
    } else {
      await db.readItems.delete(feedItemId);
    }
  }

  public async loadFeeds(): Promise<Feed[]> {
    return (await db.feeds.toArray()).map(f => ({
      ...f,
      items: [],
    }));
  }

  public async loadFeedsById(feedIds: string[])
    : Promise<[DBFeed[], DBFeedItem[]]> {
    const feeds = await db.feeds.where('id').anyOf(feedIds).toArray();

    const items = (await Promise.all(
      feeds.map(feed => db.readItems
        .where({ feedId: feed.id })
        .toArray())))
      .reduce((acc, e) => acc.concat(e), []);

    return [feeds, items];
  }

  public async insertFeed(
    feedId: string,
    url: string,
    category: string | null,
    rssFeed: RSSFeed): Promise<void> {
    await db.feeds.put({
      id: feedId,
      title: rssFeed.title,
      url,
      link: rssFeed.link,
      description: rssFeed.description,
      category,
    });
  }
}

export interface DBFeed {
  id: string;
  title: string;
  url: string; // the original RSS url for this feed
  link: string; // link is just random metadata
  description: string;
  category: string | null; // this is our app's category, nothing to do with RSS
}

export interface DBFeedItem {
  id: string;
  feedId: string;
}

class DixieNonSense extends Dexie {
  feeds: Dexie.Table<DBFeed, string>;
  readItems: Dexie.Table<DBFeedItem, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      feeds: '&id, title, url, link, description, category',
      readItems: '&id, feedId',
    });
  }
}
