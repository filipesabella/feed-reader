import { Database } from '../lib/database';
import { FeedForSidebar } from '../lib/types';

export const noCategory = '_';

export type FeedsByCategory = { [key: string]: FeedForSidebar[] };
export type CollapsedState = { [category: string]: boolean };

export async function loadSidebar(
  database: Database): Promise<[FeedsByCategory, CollapsedState]> {
  const collapsedState = loadCollapseState();

  const feeds = await database.loadFeeds();
  const groupedByCategory = feeds.reduce((acc, f) => {
    acc[f.category || noCategory] = (acc[f.category || noCategory] || [])
      .concat({
        ...f,
        collapsed: collapsedState[f.category || ''] ?? false,
      });
    return acc;
  }, {} as { [key: string]: FeedForSidebar[] });

  return [groupedByCategory, collapsedState];
}

const localStorageKey = 'categories-collapsed-state';

function loadCollapseState(): CollapsedState {
  return JSON.parse(localStorage.getItem(localStorageKey) ?? '{}');
}

export function storeCollapseState(category: string, collapsed: boolean)
  : CollapsedState {
  const state = { ...loadCollapseState(), [category]: collapsed, };
  localStorage.setItem(
    localStorageKey,
    JSON.stringify(state));
  return state;
}
