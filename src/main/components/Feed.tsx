import * as React from 'react';
import '../styles/feed.less';
import { FeedItemComponent } from './FeedItem';
import { Feed } from '../lib/types';

interface Props {
  feed: Feed;
}

export const FeedComponent = ({ feed }: Props) => {
  return <div className="feed">
    <h1>{feed.title}</h1>
    <div className="items">
      {feed.items.map(item =>
        <FeedItemComponent key={item.id} feedItem={item} />)}
    </div>
  </div>;
};
