import * as React from 'react';
import { useState } from 'react';
import { FeedItem } from '../lib/types';
import { database } from './App';

interface Props {
  feedItem: FeedItem;
  selected: boolean;
}

export const FeedItemComponent = ({ feedItem, selected }: Props) => {
  const [read, setRead] = useState(feedItem.read);

  const markAsRead = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // this garbage is here because the button is inside the div, and this
    // event was firing twice
    const read = (e.target as HTMLElement).className === 'markUnreadButton'
      ? false
      : true;
    setRead(read);
    database.markAsRead(feedItem.id, feedItem.feedId, read);
  };

  const className = 'feed-item'
    + (selected ? ' selected' : '')
    + (read ? ' read' : ' unread');

  return <div
    className={className}
    onClick={e => markAsRead(e)}
    data-id={feedItem.id}
    data-read={feedItem.read}>
    <h2><a href={feedItem.link} target="blank">{feedItem.title}</a></h2>
    <div dangerouslySetInnerHTML={{ __html: unescape(feedItem.description) }}>
    </div>
    <div dangerouslySetInnerHTML={{ __html: feedItem.contentEncoded }}></div>
    {feedItem.comments &&
      <p><a href={feedItem.comments} target="blank">Comments</a></p>}

    <div className="actions">
      {read && <button className="markUnreadButton">
        Mark as unread</button>}
    </div>
  </div>;
};
