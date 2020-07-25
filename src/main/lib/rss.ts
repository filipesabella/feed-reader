export async function loadFeed(url: string): Promise<RSSFeed> {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  if (response.status !== 200) throw 'could not load the feeed';

  const xml = await response.text();
  const rss = new DOMParser().parseFromString(xml, 'text/xml');

  const title = rss.querySelector('rss > channel > title')
    ?.innerHTML ?? '';
  const link = rss.querySelector('rss > channel > link')
    ?.innerHTML ?? '';
  const description = rss.querySelector('rss > channel > description')
    ?.innerHTML ?? '';

  const items = Array.from(rss.querySelectorAll('rss > channel > item'))
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
        htmlDecode(item.querySelector('description')?.innerHTML ?? '');
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

  return {
    title, link, description, items
  };
}

export interface RSSFeed {
  title: string;
  link: string;
  description: string;
  items: RSSFeedItem[];
}

export interface RSSFeedItem {
  title: string;
  link: string;
  pubDate: Date;
  comments: string;
  description: string;
  contentEncoded: string;
}

function cleanUp(s: string): string {
  return s.replace('<![CDATA[', '').replace(']]>', '');
}

function htmlDecode(input: string) {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent || '';
}
