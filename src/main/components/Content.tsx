import * as React from 'react';
import { FeedComponent } from './Feed';
import { useState } from 'react';

interface Props {
  feedIds: string[];
  scrollTop: number;
}

export const Content = ({ feedIds, scrollTop, }: Props) => {
  return <div className="content">
    <FeedComponent
      feedIds={feedIds}
      scrollTop={scrollTop} />
  </div>;
};
