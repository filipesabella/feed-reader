import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed } from '../lib/types';
import '../styles/feed.less';
import { FeedItemComponent } from './FeedItem';
import { useKeys, Keys } from './useKeys';
import { database } from './App';

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

  const scrolled = () => {
    const container = document.querySelector('.feed')!;
    Array.from(document
      .querySelectorAll<HTMLDivElement>('.feed-item[data-read=false]'))
      .forEach(e => {
        const elementFullyInView = e.offsetTop + e.clientHeight - 10 <
          container.scrollTop + (container.clientHeight / 2);
        if (elementFullyInView) {
          // should NOT be doing this here and use react instead
          e.setAttribute('data-read', 'true');
          e.classList.remove('unread');
          e.classList.add('read');
          const id = e.getAttribute('data-id')!;
          database.markAsRead(id, feed.id, true);
        }
      });
  };

  return <div className="feed"
    onScroll={() => scrolled()}>
    {feed.items.filter(i => !i.read).map((item, i) =>
      <FeedItemComponent
        key={item.id}
        feedItem={item}
        selected={i === selectedItemIndex}
      />)}
  </div>;
};

const scrollIntoView = () => {
  // react doesn't like this type of stuff
  document.querySelector('.feed-item.selected')?.scrollIntoView(true);
};
