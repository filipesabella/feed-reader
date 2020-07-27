import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import { database } from './App';
import { FeedComponent } from './Feed';

interface Props {
  feedIds: string[];
}

export const Content = ({ feedIds }: Props) => {
  const [feed, setFeed] = useState(null as Feed | null);

  useEffect(() => {
    database.loadFeedsById(feedIds).then(feed => {
      if (!feed) throw `could not find feed with ids ${feedIds}`;
      setFeed(feed);
    });

    document.querySelector('.content')?.scrollTo(0, 0);
  }, [feedIds]);

  return <div className="content">
    {!feed && <div>Loading ... </div>}
    {feed && <FeedComponent feed={feed} />}
  </div>;
};
