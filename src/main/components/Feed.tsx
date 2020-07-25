import * as React from 'react';
import { Feed } from '../types/Feed';
import { FeedItemComponent } from './FeedItemComponent';

import '../styles/feed.less';

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
