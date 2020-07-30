import * as React from 'react';
import { FeedComponent } from './Feed';
import { useState } from 'react';

interface Props {
  feedIds: string[];
}

export const Content = ({ feedIds }: Props) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrolled = (event: React.UIEvent<HTMLDivElement>) => {
    const e = event.target as HTMLDivElement;
    setScrollTop(e.scrollTop + e.clientHeight);
  };

  return <div className="content" onScroll={e => scrolled(e)}>
    <FeedComponent
      feedIds={feedIds}
      scrollTop={scrollTop} />
  </div>;
};
