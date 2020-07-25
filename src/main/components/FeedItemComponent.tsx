import * as React from 'react';
import { Feed, FeedItem } from '../types/Feed';

interface Props {
  feedItem: FeedItem;
}

export const FeedItemComponent = ({ feedItem }: Props) => {
  return <div className="feed-item">
    <h2>{feedItem.title}</h2>
  </div>;
};
