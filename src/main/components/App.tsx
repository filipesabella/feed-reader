import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database } from '../lib/db';
import '../styles/app.less';
import { Content } from './Content';
import { Sidebar } from './Sidebar';

export const database = new Database();

export const App = () => {
  const [feedId, setFeedId] = useState(null as string | null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database.initialize().then(async _ => {
      setLoading(false);

      // dev mode
      setFeedId('11');
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
