import * as React from 'react';
import { DBSavedFeedItem } from '../lib/db';
import { useAppContext } from './App';

interface Props {
  feedItem: DBSavedFeedItem;
  removeItem: (f: DBSavedFeedItem) => void;
}

export function SavedFeedItemComponent({
  feedItem,
  removeItem, }: Props): JSX.Element {
  const { database } = useAppContext();

  const unsave = async () => {
    await database.deleteSavedItem(feedItem.feedItemId);
    removeItem(feedItem);
  };

  const className = 'feed-item read';

  return <div className={className}>
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
      dangerouslySetInnerHTML={{ __html: feedItem.inlineContent }}></div>
    {feedItem.comments &&
      <p><a href={feedItem.comments} target="blank">Comments</a></p>}
    <div className="actions">
      <button
        onClick={unsave}>Unsave</button>
    </div>
  </div>;
}
