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
      const resetDb = window.location.hash.startsWith('#reset');
      if (resetDb) {
        const resetId = window.location.hash.split('=');
        if (resetId.length > 1) setFeedId(resetId[1]);
        else setFeedId((await database.loadFeeds())[0].id);
      } else {
        setFeedId((await database.loadFeeds())[0].id);
      }
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
