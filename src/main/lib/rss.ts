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

const corsAnywhere = 'https://cors-anywhere.herokuapp.com';

export async function loadFeedItems(
  { scriptToParse, scriptToPaginate }: DBFeed, url: string)
  : Promise<[RSSFeedItem[], string | null]> {
  const responseBody = await loadRSS(url);
  return [
    parseFeedItems(responseBody, url, scriptToParse),
    nextPageUrl(url, responseBody, scriptToPaginate)
  ];
}

async function loadRSS(url: string): Promise<string> {
  const corsUrl = `${corsAnywhere}/${url}`;
  const response = await fetch(corsUrl);
  if (response.status !== 200) throw 'could not load the feeed';
  return await response.text();
}

function parseFeedItems(
  responseBody: string,
  url: string,
  scriptToParse: string | null): RSSFeedItem[] {
  if (scriptToParse) {
    return parseCustom(scriptToParse, responseBody, url);
  } else {
    if (isRedditJson(url)) {
      return parseRedditJson(url, responseBody);
    } else {
      const rss = new DOMParser().parseFromString(responseBody, 'text/xml');
      if (isAtom(rss)) {
        return parseAtom(rss);
      } else {
        return parseRSS(rss);
      }
    }
  }
}

function parseRSS(rss: Document): RSSFeedItem[] {
  return Array.from(rss.querySelectorAll('rss > channel > item'))
    .map(item => {
      const title = item.querySelector('title')?.innerHTML ?? '';
      const link = item.querySelector('link')?.innerHTML ?? '';
      const pubDate = new Date(item.querySelector('pubDate')?.innerHTML ?? '');
      const comments = item.querySelector('comments')?.innerHTML ?? '';
      const description = htmlDecode(cleanUp(item.querySelector('description')
        ?.innerHTML ?? ''));
      const contentEncoded = cleanUp(
        item.querySelector('encoded')?.innerHTML ?? '');

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

function parseRedditJson(url: string, body: string): RSSFeedItem[] {
  const json = JSON.parse(body);

  const img = (src: string) =>
    `<img style="max-width: 600px" src="${src}"/>`;

  const video = (src: string) => `<video loop muted controls>
      <source
        src="${src}"
        type="video/mp4"/>
    </video>`;

  const imgUrl = (url: string) => {
    if (url.includes('imgur')) {
      if (!!url.match(/\.(png|jpg|gif)$/)) return url;
      return url + '.png';
    }
    else return url;
  };

  return json.data.children
    .filter((e: any) => !e.data.stickied) // ignore announcements
    .map((e: any) => {
      const content = () => {
        if (e.data.url.includes('gfycat')) {
          const doc = new DOMParser().parseFromString(
            e.data.secure_media_embed.content, 'text/html');
          return doc.documentElement.textContent || '';
        } else {
          return e.data.secure_media?.reddit_video?.fallback_url
            ? video(e.data.secure_media.reddit_video.fallback_url)
            : !!(e.data.url?.match(/imgur.*gifv/))
              ? video(e.data.url.replace('.gifv', '.mp4'))
              : img(imgUrl(e.data.url));
        }
      };

      const rootUrl = url.split('?')[0].replace('.json', '');
      return {
        link: `${rootUrl}/comments/${e.data.id}`,
        title: e.data.title,
        pubDate: new Date(e.data.created * 1000),
        comments: '',
        description: '',
        contentEncoded: content(),
      };
    });
}

function parseCustom(
  scriptToParse: string,
  responseBody: string,
  url: string): RSSFeedItem[] {
  // lol
  (window as any).eval(`function __parse(body, url) { ${scriptToParse} } `);
  return (window as any).__parse(responseBody, url);
}

function parseAtom(rss: Document): RSSFeedItem[] {
  return Array.from(rss.querySelectorAll('feed > entry'))
    .map(item => {
      const title = item.querySelector('title')?.innerHTML ?? '';
      const link = item.querySelector('link')?.getAttribute('href') ?? '';
      const pubDate = new Date(item.querySelector('updated')?.innerHTML ?? '');
      const comments = '';
      const description = '';
      const contentEncoded = htmlDecode(
        item.querySelector('content')?.innerHTML ?? '');

      return {
        title,
        link,
        pubDate,
        comments,
        description,
        contentEncoded,
      };
    });
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

function isRedditJson(url: string): boolean {
  return !!url.match(/reddit\.com.*\.json/);
}

function cleanUp(s: string): string {
  return s.replace('<![CDATA[', '').replace(']]>', '');
}

function htmlDecode(input: string) {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent || '';
}
