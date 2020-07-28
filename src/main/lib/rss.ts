import { nextPageUrl } from './rss-pagination';
import { DBFeed } from './db';

export interface RSSFeed {
  url: string;
  title: string;
  link: string;
  description: string;
}

export interface RSSFeedItem {
  title: string;
  link: string;
  pubDate: Date;
  comments: string;
  description: string;
  contentEncoded: string;
}

// currently only used for seed data
export async function loadFeed(url: string): Promise<RSSFeed> {
  const rss = await loadRSS(url);
  if (isAtom(rss)) {
    const title = rss.querySelector('feed > title')
      ?.innerHTML ?? '';
    const link = rss.querySelector('feed > link[rel="self"]')
      ?.getAttribute('href') ?? '';
    const description = rss.querySelector('feed > subtitle')
      ?.innerHTML ?? '';

    return {
      url,
      title,
      link,
      description,
    };
  } else {
    const title = rss.querySelector('rss > channel > title')
      ?.innerHTML ?? '';
    const link = rss.querySelector('rss > channel > link')
      ?.innerHTML ?? '';
    const description = rss.querySelector('rss > channel > description')
      ?.innerHTML ?? '';

    return {
      url,
      title,
      link,
      description,
    };
  }
}

export async function loadFeedItems(
  { scriptToParse, scriptToPaginate }: DBFeed, url: string)
  : Promise<[RSSFeedItem[], string | null]> {
  const rss = await loadRSS(url);
  return [
    parseFeedItems(rss, scriptToParse),
    nextPageUrl(url, rss, scriptToPaginate)
  ];
}

async function loadRSS(url: string): Promise<Document> {
  const corsUrl = `https://cors-anywhere.herokuapp.com/${url}`;
  const response = await fetch(corsUrl);
  if (response.status !== 200) throw 'could not load the feeed';
  const xml = await response.text();
  return new DOMParser().parseFromString(xml, 'text/xml');
}

function parseFeedItems(rss: Document, scriptToParse: string | null)
  : RSSFeedItem[] {
  // lol
  if (scriptToParse) {
    (window as any).eval(`function __parse(document) {\n${scriptToParse}}`);
    return (window as any).__parse(rss);
  } else if (isAtom(rss)) {
    return Array.from(rss.querySelectorAll('feed > entry'))
      .map(item => {
        const title =
          item.querySelector('title')?.innerHTML ?? '';
        const link =
          item.querySelector('link')?.getAttribute('href') ?? '';
        const pubDate =
          new Date(item.querySelector('updated')?.innerHTML ?? '');
        const comments = '';
        const description = '';
        const contentEncoded =
          htmlDecode(item.querySelector('content')?.innerHTML ?? '');

        return {
          title,
          link,
          pubDate,
          comments,
          description,
          contentEncoded,
        };
      });
  } else {
    return Array.from(rss.querySelectorAll('rss > channel > item'))
      .map(item => {
        const title =
          item.querySelector('title')?.innerHTML ?? '';
        const link =
          item.querySelector('link')?.innerHTML ?? '';
        const pubDate =
          new Date(item.querySelector('pubDate')?.innerHTML ?? '');
        const comments =
          item.querySelector('comments')?.innerHTML ?? '';
        const description =
          htmlDecode(cleanUp(item.querySelector('description')
            ?.innerHTML ?? ''));

        const contentEncoded =
          cleanUp(item.querySelector('encoded')?.innerHTML ?? '');

        return {
          title: title || link,
          link,
          pubDate,
          comments,
          description,
          contentEncoded,
        };
      });
  }
}

export function rssFeedItemToDbFeedItemId(item: RSSFeedItem): string {
  const s = `${item.title.trim()}_${item.link}_${item.pubDate}`;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

function isAtom(rss: Document): boolean {
  return rss.firstElementChild?.tagName === 'feed';
}

function cleanUp(s: string): string {
  return s.replace('<![CDATA[', '').replace(']]>', '');
}

function htmlDecode(input: string) {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent || '';
}
