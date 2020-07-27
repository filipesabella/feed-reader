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

export async function loadFeedItems(url: string)
  : Promise<[string, RSSFeedItem[]]> {
  const rss = await loadRSS(url);
  return [url, parseFeedItems(rss)];
}

async function loadRSS(url: string): Promise<Document> {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  if (response.status !== 200) throw 'could not load the feeed';
  const xml = await response.text();
  return new DOMParser().parseFromString(xml, 'text/xml');
}

function parseFeedItems(rss: Document): RSSFeedItem[] {
  if (isAtom(rss)) {
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
  return `${item.title.trim()}_${item.title}_${item.pubDate}`;
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
