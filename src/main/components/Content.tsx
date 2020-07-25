import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import { database } from './App';
import { FeedComponent } from './Feed';

interface Props {
  feedId: string;
}

export const Content = ({ feedId }: Props) => {
  const [feed, setFeed] = useState(null as Feed | null);

  useEffect(() => {
    database.loadFeed(feedId).then(feed => {
      if (!feed) throw 'could not find feed with id 1';
      setFeed(feed);
    });
  }, [feedId]);

  return <div className="content">
    {!feed && <div>Loading ... </div>}
    {feed && <FeedComponent feed={feed} />}
  </div>;
};
