import * as React from 'react';
import { FeedComponent } from './Feed';

interface Props {
  feedIds: string[];
}

export const Content = ({ feedIds }: Props) => {
  return <div className="content">
    <FeedComponent feedIds={feedIds} />
  </div>;
};
