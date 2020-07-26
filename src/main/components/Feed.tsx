import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import '../styles/feed.less';
import { FeedItemComponent } from './FeedItem';

interface Props {
  feed: Feed;
}

export const FeedComponent = ({ feed }: Props) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  useEffect(() => {
    setSelectedItemIndex(-1);
  }, [feed]);

  useEffect(() => {
    const handlers: { [key: number]: () => void } = {
      106: () => { // j
        setSelectedItemIndex(
          Math.min(feed.items.length - 1, selectedItemIndex + 1));
      },
      107: () => { // k
        setSelectedItemIndex(Math.max(0, selectedItemIndex - 1));
      },
      13: () => { // enter
        if (selectedItemIndex >= 0) {
          window.open(feed.items[selectedItemIndex].link, '_blank');
        }
      }
    };

    const handler = (e: KeyboardEvent) => handlers[e.which]?.();
    window.addEventListener('keypress', handler);

    return () => {
      window.removeEventListener('keypress', handler);
    };
  });

  return <div className="feed">
    <h1>{feed.title}</h1>
    <div className="items">
      {feed.items.map((item, i) =>
        <FeedItemComponent
          key={item.id}
          feedItem={item}
          selected={i === selectedItemIndex}
        />)}
    </div>
  </div>;
};
