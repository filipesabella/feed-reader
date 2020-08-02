import * as React from 'react';
import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { uuid } from '../lib/db';
import { AllFeedsId } from '../lib/feed-loader';
import { Feed } from '../lib/types';
import '../styles/sidebar.less';
import { DefaultModal } from './DefaultModal';
import { FeedUpsertForm } from './FeedUpsertForm';
import { SettingsModal } from './SettingsModal';
import { useAppContext } from './App';
import * as icons from './icons';

interface Props {
  feedIds: string[] | null;
  selectFeeds: (feedIds: string[]) => void;
  selectSaved: () => void;
}

const noCategory = '_';

ReactModal.setAppElement('#root');

export function Sidebar({
  selectFeeds,
  feedIds,
  selectSaved, }: Props): JSX.Element {
  const { database, showUnreadItems, setShowUnreadItems } = useAppContext();
  const [feeds, setFeeds] = useState(null as { [key: string]: Feed[] } | null);
  const [feedToUpsert, setFeedToUpsert] = useState(null as Feed | null);

  const load = () => {
    database.loadFeeds().then(feeds => {
      const grouped = feeds.reduce((acc, f) => {
        acc[f.category || noCategory] = (acc[f.category || noCategory] || [])
          .concat(f);
        return acc;
      }, {} as { [key: string]: Feed[] });

      setFeeds(grouped);
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

  const feed = (f: Feed) => {
    return <li key={f.id} className="feed-item">
      <span
        className={'title' + (feedIds?.includes(f.id) ? ' selected' : '')}
        onClick={_ => selectFeeds([f.id])}>{f.title}</span>
      <span
        className="edit"
        onClick={_ => setFeedToUpsert(f)}>edit</span>
    </li>;
  };

  const feedComponents = feeds && Object.keys(feeds).sort().map(category => {
    const items = feeds[category];
    if (category === noCategory) {
      return items.map(feed);
    } else {
      const feedIds = items.map(f => f.id);
      return <li key={category}>
        <span
          className="category"
          onClick={_ => selectFeeds(feedIds)}>{category}</span>
        <ul>
          {items.map(feed)}
        </ul>
      </li>;
    }
  });

  return <div className="sidebar">
    <div className="container">
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
    </div>
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
      <SettingsModal />
    </DefaultModal>
  </div>;
}
