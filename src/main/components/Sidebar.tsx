import * as React from 'react';
import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { uuid } from '../lib/db';
import { AllFeedsId } from '../lib/feed-loader';
import { Feed, FeedForSidebar } from '../lib/types';
import {
  loadSidebar,
  noCategory,
  FeedsByCategory,
  CollapsedState,
  storeCollapseState,
} from '../services/sidebar';
import '../styles/sidebar.less';
import { useAppContext } from './App';
import { DefaultModal } from './DefaultModal';
import { FeedUpsertForm } from './FeedUpsertForm';
import * as icons from './icons';
import { SettingsForm } from './SettingsForm';

interface Props {
  feedIds: string[] | null;
  selectFeeds: (feedIds: string[]) => void;
  selectSaved: () => void;
}

ReactModal.setAppElement('#root');

export function Sidebar({
  selectFeeds,
  feedIds,
  selectSaved, }: Props): JSX.Element {
  const { database,
    showUnreadItems,
    setShowUnreadItems, } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [feeds, setFeeds] = useState(null as FeedsByCategory | null);
  const [feedToUpsert, setFeedToUpsert] = useState(null as Feed | null);

  const [collapsedState, setCollapsedState] = useState({} as CollapsedState);

  const load = () => {
    loadSidebar(database).then(([feeds, collapsedState]) => {
      setFeeds(feeds);
      setCollapsedState(collapsedState);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const closeUpsertModal = () => {
    load();
    setFeedToUpsert(null);
  };

  const [showSettings, setShowSettings] = useState(false);
  const openSettings = () => {
    setShowSettings(true);
  };

  const toggleShowReadItems = () => {
    setShowUnreadItems(!showUnreadItems);
  };

  const openAddFeed = () => {
    setFeedToUpsert({
      id: uuid(),
      title: '',
      url: '',
      category: '',
      blockedWords: '',
      scriptToInline: '',
      scriptToPaginate: '',
      scriptToParse: '',
    });
  };

  const loadFeedToUpsert = (feed: FeedForSidebar) => {
    database.loadFeedsById([feed.id])
      .then(dbFeeds => setFeedToUpsert({
        ...dbFeeds[0]
      } as Feed));
  };

  const setCollapsed = (category: string, collapsed: boolean) => {
    setCollapsedState(storeCollapseState(category, collapsed));
  };

  const feed = (f: FeedForSidebar) => {
    return <li key={f.id} className="feed-item">
      <span
        className={'title' + (feedIds?.includes(f.id) ? ' selected' : '')}
        title={f.title}
        onClick={_ => selectFeeds([f.id])}>{f.title}</span>
      <span
        className="edit"
        onClick={_ => loadFeedToUpsert(f)}>edit</span>
    </li>;
  };

  const feedComponents = feeds && Object.keys(feeds).sort().map(category => {
    const items = feeds[category];
    if (category === noCategory) {
      return items.map(feed);
    } else {
      const feedIds = items.map(f => f.id);
      const isCollapsed = !!collapsedState[category];
      return <li key={category}>
        <div className="category">
          <span
            className="name"
            onClick={_ => selectFeeds(feedIds)}>{category}</span>
          <span
            className="collapse"
            onClick={() => setCollapsed(category, !isCollapsed)}>
            {collapsedState[category] ? '▿' : '▵'}
          </span>
        </div>
        <ul>
          {!isCollapsed && items.map(feed)}
        </ul>
      </li>;
    }
  });

  return <div className="sidebar">
    {!loading && <div className="container">
      <ul>
        <li className="feed-item">
          <span
            className={'title'}
            onClick={_ => selectSaved()}>Saved</span>
        </li>
        <li className="feed-item">
          <span
            className={'title'}
            onClick={_ => selectFeeds([AllFeedsId])}>All</span>
        </li>
        {feeds && feedComponents}
      </ul>
    </div>}
    <div className="actions">
      <span
        onClick={() => openAddFeed()}
        title="Add a feed">{icons.add}</span>
      <span
        onClick={() => openSettings()}
        title="Settings">{icons.settings}</span>
      <span
        onClick={() => toggleShowReadItems()}
        title="Toggle show read items">
        {showUnreadItems ? icons.eye : icons.eyeCrossed}
      </span>
    </div>
    <DefaultModal
      isOpen={feedToUpsert !== null}
      onRequestClose={() => setFeedToUpsert(null)}>
      {feedToUpsert && <FeedUpsertForm
        feed={feedToUpsert}
        saved={feed => selectFeeds([feed.id])}
        closeModal={closeUpsertModal} />}
    </DefaultModal>
    <DefaultModal
      isOpen={showSettings}
      onRequestClose={() => setShowSettings(false)}>
      <SettingsForm />
    </DefaultModal>
  </div>;
}
