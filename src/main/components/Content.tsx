import * as React from 'react';
import { database } from './App';
import { FeedComponent } from './Feed';
import { useState } from 'react';
import { Feed } from '../lib/types';

export const Content = () => {
  const [feed, setFeed] = useState(null as Feed | null);

  React.useEffect(() => {
    database.loadFeed('1').then(feed => {
      if (!feed) throw 'could not find feed with id 1';
      setFeed(feed);
    });
  }, []);

  return <div className="content">
    {!feed && <div>Loading ... </div>}
    {feed && <FeedComponent feed={feed} />}
  </div>;
};
