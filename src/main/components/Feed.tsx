import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import '../styles/feed.less';
import { FeedItemComponent } from './FeedItem';
import { useKeys, Keys } from './useKeys';

interface Props {
  feed: Feed;
}

export const FeedComponent = ({ feed }: Props) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  useEffect(() => {
    setSelectedItemIndex(-1);
  }, [feed]);

  useKeys({
    [Keys.J]: () => {
      setSelectedItemIndex(
        Math.min(feed.items.length - 1, selectedItemIndex + 1));
      scrollIntoView();
    },
    [Keys.K]: () => {
      setSelectedItemIndex(Math.max(0, selectedItemIndex - 1));
      scrollIntoView();
    },
    [Keys.ENTER]: () => {
      selectedItemIndex >= 0 &&
        window.open(feed.items[selectedItemIndex].link, '_blank');
    }
  });

  return <div className="feed">
    <div className="items">
      {feed.items.filter(i => !i.read).map((item, i) =>
        <FeedItemComponent
          key={item.id}
          feedItem={item}
          selected={i === selectedItemIndex}
        />)}
    </div>
  </div>;
};

const scrollIntoView = () => {
  // react doesn't like this type of stuff
  document.querySelector('.feed-item.selected')?.scrollIntoView(true);
};
