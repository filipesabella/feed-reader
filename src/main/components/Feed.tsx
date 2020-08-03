import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  loadFeedsItems,
  loadNextPages,
  NextPageData
} from '../services/feed';
import { FeedItem } from '../lib/types';
import '../styles/feed.less';
import { useAppContext } from './App';
import { FeedItemComponent } from './FeedItem';
import { Keys, useKeys } from './useKeys';
import { Database } from '../lib/database';
import * as notifications from '../lib/notifications';

interface Props {
  feedIds: string[];
  scrollTop: number;
}

export function FeedComponent({ feedIds, scrollTop, }: Props): JSX.Element {
  const { database, settings, showUnreadItems } = useAppContext();

  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [currentItems, setCurrentItems] = useState([] as FeedItem[]);
  const [loading, setLoading] = useState(true);

  const [shouldLoadMorePages, setShouldLoadMorePages] = useState(true);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [nextPagesUrls, setNextPagesUrls] = useState([] as NextPageData[]);

  const [savedFeedItemIds, setSavedFeedItemIds] = useState(new Set<string>());

  useEffect(() => {
    const notificationId = notifications.loading();

    setLoading(true);
    setShouldLoadMorePages(true);
    setSelectedItemIndex(-1);

    loadFeedsItems(
      database,
      feedIds,
      settings.proxyUrl,
      showUnreadItems)
      .then(([[items, nextPagesUrls], savedFeedItemIds]) => {
        setCurrentItems(items);
        setNextPagesUrls(nextPagesUrls);

        setSavedFeedItemIds(savedFeedItemIds);

        setLoading(false);

        notifications.remove(notificationId);
      });
  }, [feedIds, showUnreadItems]);

  const nextPage = () => {
    if (loadingNextPage || !shouldLoadMorePages) return;

    const notificationId = notifications.loading();
    setLoadingNextPage(true);

    loadNextPages(
      database,
      nextPagesUrls,
      settings.proxyUrl,
      showUnreadItems)
      .then(([nextItems, nextPagesUrls]) => {
        // this means the pagination has failed and the same page was loaded
        if (nextItems[0]?.id === currentItems[0].id) {
          notifications.error('Pagination failed, not loading more items');
          setShouldLoadMorePages(false);
        } else {
          setCurrentItems(currentItems.concat(nextItems));
          setNextPagesUrls(nextPagesUrls);
          setShouldLoadMorePages(true);
        }
        setLoadingNextPage(false);
        notifications.remove(notificationId);
      });
  };

  const scrolled = () => {
    markScrolledItemsAsRead(database, scrollTop);
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
    }
  };

  const feedItemComponents = () => {
    if (currentItems.length === 0) {
      return <h1>No new items for this feed.</h1>;
    } else {
      return currentItems.map((item, i) =>
        <FeedItemComponent
          key={item.id}
          feedItem={item}
          onItemClick={onItemClick}
          selected={i === selectedItemIndex}
          savedFeedItemIds={savedFeedItemIds}
        />);
    }
  };

  return <div className="feed">
    {!loading && feedItemComponents()}
  </div>;
}

function scrollIntoView(): void {
  // react doesn't like this type of stuff
  document.querySelector('.feed-item.selected')?.scrollIntoView(true);
}

function markScrolledItemsAsRead(database: Database, scrollTop: number): void {
  const viewport = document.querySelector('#app')!.clientHeight;
  const toMarkAsRead = Array.from(document
    .querySelectorAll<HTMLDivElement>(
      '#app .content .feed .feed-item:not(.read)'))
    .filter(e => {
      // items scrolling off the top should automatically be marked as read
      const isElementOffTopOfScreen = e.offsetTop < scrollTop - viewport;
      return isElementOffTopOfScreen;
    })
    .map<[string, string]>(e => {
      // should NOT be doing this here and use react instead
      e.classList.remove('unread');
      e.classList.add('read');
      const id = e.getAttribute('data-id')!;
      const feedId = e.getAttribute('data-feed-id')!;
      return [id, feedId];
    });

  database.markAsReadBatch(toMarkAsRead);
}

function hasReachedEnd(scrollTop: number): boolean {
  const lastItem = document.querySelector<HTMLDivElement>(
    '#app .content .feed .feed-item:last-child');

  if (!lastItem) return false;

  const elementFullyInView = lastItem.offsetTop + lastItem.clientHeight - 10 <
    scrollTop;

  return elementFullyInView;
}
