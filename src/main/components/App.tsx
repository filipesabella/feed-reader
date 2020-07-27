import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database } from '../lib/db';
import '../styles/app.less';
import { Content } from './Content';
import { Sidebar } from './Sidebar';

export const database = new Database();

export const App = () => {
  const [feedIds, setFeedIds] = useState(null as string[] | null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database.initialize().then(async _ => {
      setLoading(false);

      // dev mode
      const resetDb = window.location.hash.startsWith('#reset');
      if (resetDb) {
        const resetId = window.location.hash.split('=');
        // if (resetId.length > 1) setFeedIds([resetId[1]]);
        // else setFeedIds([(await database.loadFeeds())[0].id]);
      } else {
        // setFeedIds([(await database.loadFeeds())[0].id]);
      }
    });
  }, []);

  return <>
    {loading && <p>Loading...</p>}
    {!loading && <Sidebar
      selectFeed={setFeedIds}
      feedIds={feedIds} />}
    {feedIds && <Content feedIds={feedIds} />}
  </>;
};
