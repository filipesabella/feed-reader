import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import '../styles/sidebar.less';
import { database } from './App';

interface Props {
  feedIds: string[] | null;
  selectFeed: (feedIds: string[]) => void;
}

const noCategory = '_';

export const Sidebar = ({ selectFeed, feedIds }: Props) => {
  const [feeds, setFeeds] = useState(null as { [key: string]: Feed[] } | null);
  useEffect(() => {
    database.loadFeeds().then(feeds => {
      const grouped = feeds.reduce((acc, f) => {
        acc[f.category || noCategory] = (acc[f.category || noCategory] || [])
          .concat(f);
        return acc;
      }, {} as { [key: string]: Feed[] });
      setFeeds(grouped);
    });
  }, []);

  const feed = (f: Feed) => {
    return <li key={f.id} className="feed-item">
      <span
        className={'title' + (feedIds?.includes(f.id) ? ' selected' : '')}
        onClick={_ => selectFeed([f.id])}>{f.title}</span>
      <span className="edit">edit</span>
    </li>;
  };

  const feedComponents = feeds && Object.keys(feeds).sort().map(category => {
    const items = feeds[category];
    if (category === noCategory) {
      return items.map(feed);
    } else {
      const feedIds = items.map(f => f.id);
      return <li key={category}>
        <span
          className="category"
          onClick={_ => selectFeed(feedIds)}>{category}</span>
        <ul>
          {items.map(feed)}
        </ul>
      </li>;
    }
  });

  return <div className="sidebar">
    <ul>
      {feeds && feedComponents}
    </ul>
  </div>;
};
