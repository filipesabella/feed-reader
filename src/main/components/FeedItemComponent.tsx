import * as React from 'react';
import { FeedItem } from '../lib/types';

interface Props {
  feedItem: FeedItem;
}

export const FeedItemComponent = ({ feedItem }: Props) => {
  return <div className="feed-item">
    <h2><a href={feedItem.link} target="blank">{feedItem.title}</a></h2>
    <div dangerouslySetInnerHTML={{ __html: unescape(feedItem.description) }}>
    </div>
    <div dangerouslySetInnerHTML={{ __html: feedItem.contentEncoded }}></div>
    {feedItem.comments &&
      <p><a href={feedItem.comments} target="blank">Comments</a></p>}
  </div>;
};
