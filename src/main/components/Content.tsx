import * as React from 'react';
import { Feed } from '../types/Feed';
import { FeedComponent } from './Feed';

export const Content = () => {
  const [feed, setFeed] = React.useState(null as Feed);

  React.useEffect(() => {
    const url = 'https://cors-anywhere.herokuapp.com/news.ycombinator.com/rss';
    fetch(url)
      .then(r => r.text())
      .then(xml => {
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

        setFeed({
          title, link, description, items
        });
      });
  }, []);

  return <div className="content">
    {!feed && <div>Loading ... </div>}
    {feed && <FeedComponent feed={feed} />}
  </div>;
};
