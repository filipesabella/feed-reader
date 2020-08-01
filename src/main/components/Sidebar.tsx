import * as React from 'react';
import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { uuid } from '../lib/db';
import { AllFeedsId } from '../lib/feed-loader';
import { Feed } from '../lib/types';
import '../styles/sidebar.less';
import { DefaultModal } from './DefaultModal';
import { FeedEditModal } from './FeedEditModal';
import { SettingsModal } from './SettingsModal';
import { useAppContext } from './App';
import * as icons from './icons';

interface Props {
  feedIds: string[] | null;
  selectFeed: (feedIds: string[]) => void;
}

const noCategory = '_';

ReactModal.setAppElement('#root');

export const Sidebar = ({ selectFeed, feedIds }: Props) => {
  const { database } = useAppContext();

  const [feeds, setFeeds] = useState(null as { [key: string]: Feed[] } | null);
  const [feedToEdit, setFeedToEdit] = useState(null as Feed | null);

  const load = () => {
    database.loadFeeds().then(feeds => {
      const grouped = feeds.reduce((acc, f) => {
        acc[f.category || noCategory] = (acc[f.category || noCategory] || [])
          .concat(f);
        return acc;
      }, {} as { [key: string]: Feed[] });

      setFeeds(grouped);

      // to test the edit modal, delete me
      // setFeedToEdit(feeds[0]);
      // setShowSettings(true);
    });
  };
  useEffect(load, []);

  const closeEditModal = () => {
    load();
    setFeedToEdit(null);
  };

  const [showSettings, setShowSettings] = useState(false);
  const openSettings = () => {
    setShowSettings(true);
  };

  const [showReadItems, setShowReadItems] = useState(false);
  const toggleShowReadItems = () => {
    setShowReadItems(!showReadItems);
  };

  const openAddFeed = () => {
    setFeedToEdit({
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
        onClick={_ => selectFeed([f.id])}>{f.title}</span>
      <span
        className="edit"
        onClick={_ => setFeedToEdit(f)}>edit</span>
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
          onClick={_ => selectFeed(feedIds)}>{category}</span>
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
            onClick={_ => selectFeed([AllFeedsId])}>All</span>
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
        {showReadItems ? icons.eye : icons.eyeCrossed}
      </span>
    </div>
    <DefaultModal
      isOpen={feedToEdit !== null}
      onRequestClose={() => setFeedToEdit(null)}>
      {feedToEdit && <FeedEditModal
        feed={feedToEdit}
        saved={feed => selectFeed([feed.id])}
        closeModal={closeEditModal} />}
    </DefaultModal>
    <DefaultModal
      isOpen={showSettings}
      onRequestClose={() => setShowSettings(false)}>
      <SettingsModal />
    </DefaultModal>
  </div>;
};
