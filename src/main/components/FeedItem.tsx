import * as React from 'react';
import { useState, useEffect } from 'react';
import { FeedItem } from '../lib/types';
import { useAppContext } from './App';
import { execOnWindow } from '../lib/window-functions';
import * as icons from './icons';

interface Props {
  feedItem: FeedItem;
  selected: boolean;
  onItemClick: (feedItemId: string) => void;
  savedFeedItemIds: Set<string>;
}

export function FeedItemComponent({
  feedItem,
  selected,
  onItemClick,
  savedFeedItemIds, }: Props): JSX.Element {
  const { database } = useAppContext();

  const [read, setRead] = useState(feedItem.read);
  const [inlineContent, setInlineContent] = useState('');
  const [loadingInlineContent, setLoadingInlineContent] = useState(false);

  const [saved, setSaved] = useState(savedFeedItemIds.has(feedItem.id));

  const markAsUnread = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    // well, this is embarrasing.
    // since we're doing naughty stuff with document.querySelector
    // in Feed.tsx to mark items as read, that information doesn't
    // get here. Therefore, when an item is marked as read because the
    // user scrolled it off the screen, this component doesn't know
    // that it's now `read`.
    // By forcing a state change and by using wonderful window.setTimeout
    // it works.
    // The correct way would be to figure out how to mark items as read
    // once they're scrolled off the screen, and thus update the state
    // here.
    setRead(true);
    window.setTimeout(() => changeRead(false), 1);
    e.stopPropagation();
  };

  const onClick = () => changeRead(true);

  const changeRead = (read: boolean) => {
    setRead(read);
    database.markAsRead(feedItem.id, feedItem.feedId, read);

    onItemClick(feedItem.id);
  };

  const toggleSave = async () => {
    if (saved) {
      await database.deleteSavedItem(feedItem.id);
    } else {
      await database.saveItem({
        feedItemId: feedItem.id,
        inlineContent,
        title: feedItem.title,
        link: feedItem.link,
        pubDate: feedItem.pubDate,
        comments: feedItem.comments,
        description: feedItem.description,
        contentEncoded: feedItem.contentEncoded,
      });
    }
    setSaved(!saved);
  };

  useEffect(() => {
    if (!feedItem.scriptToInline) return;
    setLoadingInlineContent(true);
    execOnWindow(
      `__inline${feedItem.id}`,
      `(url, item) => {
        ${feedItem.scriptToInline}
      }`,
      feedItem.link, feedItem)?.then((html: string) => {
        setLoadingInlineContent(false);
        html && setInlineContent(html);
      });
  }, [feedItem]);

  const className = 'feed-item'
    + (selected ? ' selected' : '')
    + (read ? ' read' : ' unread')
    + (loadingInlineContent ? ' loading' : '');

  return <div
    className={className}
    onClick={onClick}
    data-id={feedItem.id}
    data-feed-id={feedItem.feedId}>
    <h2><a href={feedItem.link} target="blank">{feedItem.title}</a></h2>
    <div
      className="description"
      dangerouslySetInnerHTML={{ __html: unescape(feedItem.description) }}>
    </div>
    <div
      className="content"
      dangerouslySetInnerHTML={{ __html: feedItem.contentEncoded }}></div>
    <div
      className="inlineContent"
      dangerouslySetInnerHTML={{ __html: inlineContent }}></div>
    {feedItem.comments &&
      <p><a href={feedItem.comments} target="blank">Comments</a></p>}
    <div className="actions">
      <span
        className="markUnreadButton"
        onClick={markAsUnread}>{icons.eyeCrossed}</span>
      {!loadingInlineContent && <span
        className={'save' + (saved ? ' unsave' : '')}
        onClick={toggleSave}>
        {icons.save}
      </span>}
    </div>
  </div>;
}
