import * as React from 'react';
import { DBSavedFeedItem } from '../lib/database';
import { SavedFeedItemComponent } from './SavedFeedItem';
import { useState } from 'react';

interface Props {
  savedFeedItems: DBSavedFeedItem[];
}

export function SavedFeedItems({ savedFeedItems }: Props): JSX.Element {
  const [items, setItems] = useState(savedFeedItems);

  const removeItem = (item: DBSavedFeedItem) => setItems(items =>
    items.filter(i => i.feedItemId !== item.feedItemId));

  return <div className="feed">
    {items.length === 0 && <h1>No saved items.</h1>}
    {items.map(f => <SavedFeedItemComponent
      key={f.feedItemId}
      feedItem={f}
      removeItem={removeItem} />)}
  </div>;
}
