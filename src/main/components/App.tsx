import * as React from 'react';
import { useEffect, useState } from 'react';
import { loadFeed } from '../lib/rss';
import '../styles/app.less';
import { Content } from './Content';
import { Sidebar } from './Sidebar';
import { Database } from '../lib/db';
import { Feed } from '../lib/types';

export const database = new Database();

export const App = () => {
  const [feedId, setFeedId] = useState(null as string | null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database.initialize().then(async _ => {
      setLoading(false);

      // dev mode
      setFeedId('111');
    });
  }, []);

  return <>
    {loading && <p>Loading...</p>}
    {!loading && <Sidebar
      selectFeed={setFeedId}
      feedId={feedId} />}
    {feedId && <Content feedId={feedId} />}
  </>;
};
