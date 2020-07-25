import { Feed } from '../types/Feed';

export async function loadFeed(url: string): Promise<Feed> {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const xml = await response.text();
  const rss = new DOMParser().parseFromString(xml, 'text/xml');

  const title = rss.querySelector('rss > channel > title')
    ?.innerHTML ?? '';
  const link = rss.querySelector('rss > channel > link')
    ?.innerHTML ?? '';
  const description = rss.querySelector('rss > channel > description')
    ?.innerHTML ?? '';

  const items = Array.from(rss.querySelectorAll('rss > channel > item'))
    .map(item => ({
      title: item.querySelector('title')?.innerHTML ?? '',
      link: item.querySelector('link')?.innerHTML ?? '',
      pubDate: item.querySelector('pubDate')?.innerHTML ?? '',
      comments: item.querySelector('comments')?.innerHTML ?? '',
      description: item.querySelector('description')?.innerHTML ?? '',
    }));

  return {
    title, link, description, items
  };
}
