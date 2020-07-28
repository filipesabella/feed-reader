import * as React from 'react';
import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { Feed } from '../lib/types';
import '../styles/sidebar.less';
import { database } from './App';
import { FeedEditModal } from './FeedEditModal';

interface Props {
  feedIds: string[] | null;
  selectFeed: (feedIds: string[]) => void;
}

const noCategory = '_';

ReactModal.setAppElement('#app');

export const Sidebar = ({ selectFeed, feedIds }: Props) => {
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
    });
  };

  const closeModal = () => {
    load();
    setFeedToEdit(null);
  };

  useEffect(load, []);

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
    <ul>
      {feeds && feedComponents}
    </ul>
    <ReactModal
      isOpen={feedToEdit !== null}
      onRequestClose={() => setFeedToEdit(null)}
      parentSelector={() => document.getElementById('app')!}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)'
        }
      }}>
      {feedToEdit && <FeedEditModal
        feed={feedToEdit}
        closeModal={closeModal} />}
    </ReactModal>
  </div>;
};
