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
      ['5', 'https://www.reddit.com/r/programming.rss', 'programming'],
    ];

    const rssFeeds = await Promise.all(
      toInsert
        .filter(shouldInsert)
        .map(a => loadFeed(a[1])));

    await Promise.all(rssFeeds.map(f => {
      const data = toInsert.find(i => i[1] === f.url)!;
      return this.insertFeed(data[0], data[1], data[2] || null, f);
    }));

    await db.feeds.put({
      id: '6',
      title: 'APOD',
      url: 'https://apod.nasa.gov/apod/archivepix.html',
      link: 'https://apod.nasa.gov/apod/archivepix.html',
      description: 'aaa',
      category: null,
      readItemsIds: [],
      scriptToParse: `
const doc = new DOMParser().parseFromString(body, 'text/html');
const links = Array.from(doc.querySelectorAll('body > b > a'));
return links.map(link => {
  return {
    link: \`https://apod.nasa.gov/apod/\${link.getAttribute('href')}\`,
    title: link.innerHTML.replace('\\n', ''),
    pubDate: new Date(link.previousSibling?.textContent?.trim().slice(0, -1) || ''),
    comments: '',
    description: '',
    contentEncoded: '',
  };
});
`,
      scriptToPaginate: '',
    });
  }

  public async markAsRead(feedItemId: string, feedId: string, read: boolean)
    : Promise<void> {
    const feed = (await db.feeds.get(feedId))!;
    await db.feeds.put({
      ...feed,
      readItemsIds: read
        // only store the past 100 read items, no need for more
        ? feed.readItemsIds.concat(feedItemId).slice(-100)
        : feed.readItemsIds.filter(i => i !== feedItemId)
    });
  }

  public async loadFeeds(): Promise<Feed[]> {
    return (await db.feeds.toArray()).map(f => ({
      ...f,
      items: [],
    }));
  }

  public loadFeedsById(feedIds: string[]): Promise<DBFeed[]> {
    return db.feeds.where('id').anyOf(feedIds).toArray();
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
      readItemsIds: [],
      scriptToPaginate: '',
      scriptToParse: '',
    });
  }

  public async updateFeed(feed: Feed): Promise<void> {
    const dbFeed = (await db.feeds.get(feed.id))!;
    await db.feeds.put({
      ...dbFeed,
      ...feed,
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
  readItemsIds: string[];
  scriptToParse: string;
  scriptToPaginate: string;
}

class DixieNonSense extends Dexie {
  feeds: Dexie.Table<DBFeed, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      feeds: '&id, title, url, link, description, category, *readItemsIds',
    });
  }
}
