import * as React from 'react';
import { FeedComponent } from './Feed';
import { DBSavedFeedItem } from '../lib/database';
import { SavedFeedItems } from './SavedFeedItems';

interface Props {
  feedIds: string[] | null;
  savedFeedItems: DBSavedFeedItem[] | null;
  scrollTop: number;
}

export function Content({
  feedIds,
  savedFeedItems,
  scrollTop, }: Props): JSX.Element {
  return <div className="content">
    {feedIds && <FeedComponent feedIds={feedIds} scrollTop={scrollTop} />}
    {savedFeedItems && <SavedFeedItems savedFeedItems={savedFeedItems} />}
  </div>;
}
