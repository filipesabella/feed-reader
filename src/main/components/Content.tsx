import * as React from 'react';
import { Feed } from '../types/Feed';
import { FeedComponent } from './Feed';
import { loadFeed } from '../lib/rss';

export const Content = () => {
  const [feed, setFeed] = React.useState(null as Feed | null);

  React.useEffect(() => {
    const url = 'news.ycombinator.com/rss';
    loadFeed(url).then(setFeed);
  }, []);

  return <div className="content">
    {!feed && <div>Loading ... </div>}
    {feed && <FeedComponent feed={feed} />}
  </div>;
};
