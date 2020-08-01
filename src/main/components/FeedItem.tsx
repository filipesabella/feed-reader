import * as React from 'react';
import { useState, useEffect } from 'react';
import { FeedItem } from '../lib/types';
import { useAppContext } from './App';

interface Props {
  feedItem: FeedItem;
  selected: boolean;
  onItemClick: (feedItemId: string) => void;
}

export const FeedItemComponent = ({
  feedItem,
  selected,
  onItemClick, }: Props) => {
  const { database } = useAppContext();

  const [read, setRead] = useState(feedItem.read);
  const [inlineContent, setInlineContent] = useState('');
  const [loadingInlineContent, setLoadingInlineContent] = useState(false);

  const markAsUnread = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    changeRead(false);
    e.stopPropagation();
  };

  const onClick = () => {
    changeRead(true);
  };

  const changeRead = (read: boolean) => {
    setRead(read);
    database.markAsRead(feedItem.id, feedItem.feedId, read);

    onItemClick(feedItem.id);
  };

  useEffect(() => {
    if (!feedItem.scriptToInline) return;
    setLoadingInlineContent(true);
    // lol
    (window as any)
      .eval(`function __inline(url, item) { ${feedItem.scriptToInline} }`);
    (window as any).__inline(feedItem.link, feedItem)
      ?.then((html: string) => {
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
      <button
        className="markUnreadButton"
        onClick={markAsUnread}>Mark as unread</button>
    </div>
  </div>;
};
