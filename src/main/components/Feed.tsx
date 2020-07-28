import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  loadFeedsItems,
  loadNextPages,
  NextPageData
} from '../lib/feed-loader';
import { FeedItem } from '../lib/types';
import '../styles/feed.less';
import { database } from './App';
import { FeedItemComponent } from './FeedItem';
import { Keys, useKeys } from './useKeys';

interface Props {
  feedIds: string[];
}

export const FeedComponent = ({ feedIds }: Props) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [currentItems, setCurrentItems] = useState([] as FeedItem[]);
  const [loading, setLoading] = useState(true);

  const [shouldLoadMorePages, setShouldLoadMorePages] = useState(true);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [nextPagesUrls, setNextPagesUrls] = useState([] as NextPageData[]);

  useEffect(() => {
    loadFeedsItems(database, feedIds)
      .then(([items, nextPagesUrls]) => {
        setCurrentItems(items);
        setNextPagesUrls(nextPagesUrls);
        setLoading(false);
      });

    setLoading(true);
    setShouldLoadMorePages(true);
    scrolled();
  }, [feedIds]);

  const nextPage = () => {
    if (loadingNextPage || !shouldLoadMorePages) return;
    setLoadingNextPage(true);

    loadNextPages(database, nextPagesUrls)
      .then(([nextItems, nextPagesUrls]) => {
        // this means the pagination has failed and the same page was loaded
        if (nextItems[0]?.id === currentItems[0].id) {
          console.log('Pagination failed, not loading more items');
          setShouldLoadMorePages(false);
        } else {
          setCurrentItems(currentItems.concat(nextItems));
          setNextPagesUrls(nextPagesUrls);
        }
        setLoadingNextPage(false);
      });
  };


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
