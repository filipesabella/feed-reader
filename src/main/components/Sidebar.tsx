import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import '../styles/sidebar.less';
import { database } from './App';

export const Sidebar = () => {
  const [feeds, setFeeds] = useState(null as Feed[] | null);
  useEffect(() => {
    database.loadFeeds().then(setFeeds);
  }, []);

  return <div className="sidebar">
    <ul>
      {feeds && feeds.map(f => <li>{f.title}</li>)}
    </ul>
  </div>;
};
