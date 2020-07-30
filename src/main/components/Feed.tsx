import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  loadFeedsItems,
  loadNextPages,
  NextPageData
} from '../lib/feed-loader';
import { FeedItem } from '../lib/types';
import '../styles/feed.less';
import { useAppContext } from './App';
import { FeedItemComponent } from './FeedItem';
import { Keys, useKeys } from './useKeys';
import { Database } from '../lib/db';

interface Props {
  feedIds: string[];
  scrollTop: number;
}

export const FeedComponent = ({ feedIds, scrollTop, }: Props) => {
  const { database, settings } = useAppContext();

  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [currentItems, setCurrentItems] = useState([] as FeedItem[]);
  const [loading, setLoading] = useState(true);

  const [shouldLoadMorePages, setShouldLoadMorePages] = useState(true);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [nextPagesUrls, setNextPagesUrls] = useState([] as NextPageData[]);

  useEffect(() => {
    loadFeedsItems(database, feedIds, settings.proxyUrl)
      .then(([items, nextPagesUrls]) => {
        setCurrentItems(items);
        setNextPagesUrls(nextPagesUrls);
        setLoading(false);
      });

    setLoading(true);
    setShouldLoadMorePages(true);
    scrolled();
    setSelectedItemIndex(-1);

  }, [feedIds]);

  const nextPage = () => {
    if (loadingNextPage || !shouldLoadMorePages) return;
    setLoadingNextPage(true);
    loadNextPages(database, nextPagesUrls, settings.proxyUrl)
      .then(([nextItems, nextPagesUrls]) => {
        // this means the pagination has failed and the same page was loaded
        if (nextItems[0]?.id === currentItems[0].id) {
          console.log('Pagination failed, not loading more items');
          setShouldLoadMorePages(false);
        } else {
          setCurrentItems(currentItems.concat(nextItems));
          setNextPagesUrls(nextPagesUrls);
          setShouldLoadMorePages(true);
        }
        setLoadingNextPage(false);
      });
  };

  const scrolled = () => {
    markScrolledItemsAsRead(database);
    const shouldLoadNextPage = hasReachedEnd(scrollTop) ||
      // this check is used when the last item is larger than the visible
      // screen area
      (currentItems.length > 0
        && selectedItemIndex === currentItems.length - 1);

    shouldLoadNextPage && nextPage();
  };

  useEffect(scrolled, [scrollTop]);

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

  const onItemClick = (feedItemId: string) => {
    const index = currentItems.findIndex(i => i.id === feedItemId);
    if (index) {
      setSelectedItemIndex(index);
      window.setTimeout(scrollIntoView, 1);
    }
  };

  const feedItemComponents = () => {
    const eligibleItems = currentItems.filter(i => !i.read);
    if (eligibleItems.length === 0) {
      return <div>No new items for this feed.</div>;
    } else {
      return eligibleItems.map((item, i) =>
        <FeedItemComponent
          key={item.id}
          feedItem={item}
          onItemClick={onItemClick}
          selected={i === selectedItemIndex}
        />);
    }
  };

  return <div className="feed">
    {loading && <div>Loading ... </div>}
    {!loading && feedItemComponents()}
    {loadingNextPage && <div>Loading more ... </div>}
  </div>;
};

function scrollIntoView(): void {
  // react doesn't like this type of stuff
  document.querySelector('.feed-item.selected')?.scrollIntoView(true);
}

function markScrolledItemsAsRead(database: Database): void {
  const container = document.querySelector('#app > .content')!;
  const toMarkAsRead = Array.from(document
    .querySelectorAll<HTMLDivElement>(
      '#app .content .feed .feed-item[data-read=false]'))
    .filter(e => {
      const elementFullyInView = e.offsetTop + e.clientHeight - 10 <
        container.scrollTop + (container.clientHeight / 2);
      return elementFullyInView;
    })
    .map<[string, string]>(e => {
      // should NOT be doing this here and use react instead
      e.setAttribute('data-read', 'true');
      e.classList.remove('unread');
      e.classList.add('read');
      const id = e.getAttribute('data-id')!;
      const feedId = e.getAttribute('data-feed-id')!;
      return [id, feedId];
    });

  database.markAsReadBatch(toMarkAsRead);
}

function hasReachedEnd(scrollTop: number): boolean {
  const lastItem = document
    .querySelector<HTMLDivElement>('#app .content .feed .feed-item:last-child');

  if (!lastItem) return false;

  const elementFullyInView = lastItem.offsetTop + lastItem.clientHeight - 10 <
    scrollTop;

  return elementFullyInView;
}
