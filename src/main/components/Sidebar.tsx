import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import '../styles/sidebar.less';
import { database } from './App';

interface Props {
  selectFeed: (feedId: string) => void;
}

export const Sidebar = ({ selectFeed }: Props) => {
  const [feeds, setFeeds] = useState(null as Feed[] | null);
  useEffect(() => {
    database.loadFeeds().then(setFeeds);
  }, []);

  const feed = (f: Feed) => {
    return <li key={f.id} onClick={_ => selectFeed(f.id)}>
      {f.title}
    </li>;
  };

  return <div className="sidebar">
    <ul>
      {feeds && feeds.map(feed)}
    </ul>
  </div>;
};
