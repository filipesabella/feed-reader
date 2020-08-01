import * as React from 'react';
import { FeedComponent } from './Feed';
import { DBSavedFeedItem } from '../lib/db';
import { SavedFeedItems } from './SavedFeedItems';

interface Props {
  feedIds: string[] | null;
  savedFeedItems: DBSavedFeedItem[] | null;
  scrollTop: number;
}

export const Content = ({ feedIds, savedFeedItems, scrollTop, }: Props) => {
  return <div className="content">
    {feedIds && <FeedComponent feedIds={feedIds} scrollTop={scrollTop} />}
    {savedFeedItems && <SavedFeedItems savedFeedItems={savedFeedItems} />}
  </div>;
};
