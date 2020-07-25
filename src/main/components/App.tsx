import * as React from 'react';
import { useEffect, useState } from 'react';
import { loadFeed } from '../lib/rss';
import '../styles/app.less';
import { Content } from './Content';
import { Sidebar } from './Sidebar';
import { Database } from '../lib/db';

export const database = new Database();

export const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database.initialize().then(async _ => {
      const url = 'news.ycombinator.com/rss';
      const rss = await loadFeed(url);
      await database.insertFeed('1', rss);

      setLoading(false);
    });
  }, []);

  return <>
    {loading && <p>Loading...</p>}
    {!loading && <Sidebar />}
    {!loading && <Content />}
  </>;
};
