import * as React from 'react';
import '../styles/feed.less';
import { FeedItemComponent } from './FeedItemComponent';
import { Feed } from '../lib/types';

interface Props {
  feed: Feed;
}

export const FeedComponent = ({ feed }: Props) => {
  return <div className="feed">
    <h1>{feed.title}</h1>
    <div className="items">
      {feed.items.map((item, i) =>
        <FeedItemComponent key={i} feedItem={item} />)}
    </div>
  </div>;
};
