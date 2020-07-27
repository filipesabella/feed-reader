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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeds(database, feedIds)
      .then(f => {
        setFeed(f);
        setLoading(false);
      });

    setLoading(true);
  }, [feedIds]);

  return <div className="content">
    {loading && <div>Loading ... </div>}
    {!loading && feed && <FeedComponent feed={feed} />}
  </div>;
};
