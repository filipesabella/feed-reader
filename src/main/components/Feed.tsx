import * as React from 'react';
import { useEffect, useState } from 'react';
import { Feed, FeedItem } from '../lib/types';
import '../styles/feed.less';
import { FeedItemComponent } from './FeedItem';
import { useKeys, Keys } from './useKeys';
import { database } from './App';
import { loadFeedsItems, NextPageData, loadNextPages } from '../lib/feed-loader';

interface Props {
  feedIds: string[];
}

export const FeedComponent = ({ feedIds }: Props) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [currentItems, setCurrentItems] = useState([] as FeedItem[]);
  const [loading, setLoading] = useState(true);

  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [nextPagesUrls, setNextPagesUrls] = useState([] as NextPageData[]);

  const nextPage = () => {
    if (loadingNextPage) return;
    setLoadingNextPage(true);

    loadNextPages(database, nextPagesUrls)
      .then(([items, nextPagesUrls]) => {
        setCurrentItems(currentItems.concat(items));
        setNextPagesUrls(nextPagesUrls);
        setLoadingNextPage(false);
      });
  };

  useEffect(() => {
    loadFeedsItems(database, feedIds)
      .then(([items, nextPagesUrls]) => {
        setCurrentItems(items);
        setNextPagesUrls(nextPagesUrls);
        setLoading(false);
      });

    setLoading(true);
  }, [feedIds]);


  useEffect(() => {
    setSelectedItemIndex(-1);
  }, [currentItems]);

  useKeys({
    [Keys.J]: () => {
      setSelectedItemIndex(
        Math.min(currentItems.length - 1, selectedItemIndex + 1));
      scrollIntoView();
    },
    [Keys.K]: () => {
      setSelectedItemIndex(Math.max(0, selectedItemIndex - 1));
      scrollIntoView();
    },
    [Keys.ENTER]: () => {
      selectedItemIndex >= 0 &&
        window.open(currentItems[selectedItemIndex].link, '_blank');
    }
  });

  const scrolled = () => {
    markScrolledItemsAsRead();
    hasReachedEnd() && nextPage();
  };
  useEffect(scrolled, [feedIds]);

  return <div className="feed" onScroll={() => scrolled()}>
    {loading && <div>Loading ... </div>}
    {!loading && currentItems.filter(i => !i.read).map((item, i) =>
      <FeedItemComponent
        key={item.id}
        feedItem={item}
        selected={i === selectedItemIndex}
      />)}
    {loadingNextPage && <div>Loading more ... </div>}
  </div>;
};

function scrollIntoView(): void {
  // react doesn't like this type of stuff
  document.querySelector('.feed-item.selected')?.scrollIntoView(true);
}

function markScrolledItemsAsRead(): void {
  const container = document.querySelector('.feed')!;
  Array.from(document
    .querySelectorAll<HTMLDivElement>('.feed .feed-item[data-read=false]'))
    .forEach(e => {
      const elementFullyInView = e.offsetTop + e.clientHeight - 10 <
        container.scrollTop + (container.clientHeight / 2);
      if (elementFullyInView) {
        // should NOT be doing this here and use react instead
        e.setAttribute('data-read', 'true');
        e.classList.remove('unread');
        e.classList.add('read');
        const id = e.getAttribute('data-id')!;
        const feedId = e.getAttribute('data-feed-id')!;
        database.markAsRead(id, feedId, true);
      }
    });
}

function hasReachedEnd(): boolean {
  const container = document.querySelector<HTMLDivElement>('.feed')!;
  const lastItem = document
    .querySelector<HTMLDivElement>('.feed .feed-item:last-child');

  if (!lastItem) return false;

  const elementFullyInView = lastItem.offsetTop + lastItem.clientHeight - 10 <
    container.scrollTop + container.clientHeight;

  return elementFullyInView;
}
