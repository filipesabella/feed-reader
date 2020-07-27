import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import { database } from './App';
import { FeedComponent } from './Feed';
import { loadFeeds } from '../lib/feed-loader';

interface Props {
  feedIds: string[];
}

export const Content = ({ feedIds }: Props) => {
  const [feed, setFeed] = useState(null as Feed | null);

  useEffect(() => {
    loadFeeds(database, feedIds).then(feed => {
      setFeed(feed);
    });

    document.querySelector('.content')?.scrollTo(0, 0);
  }, [feedIds]);

  return <div className="content">
    {!feed && <div>Loading ... </div>}
    {feed && <FeedComponent feed={feed} />}
  </div>;
};
