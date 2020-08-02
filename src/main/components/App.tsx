import * as React from 'react';
import { createContext, useEffect, useState } from 'react';
import { Database, DBSettings, DBSavedFeedItem } from '../lib/db';
import '../styles/app.less';
import { Content } from './Content';
import { Sidebar } from './Sidebar';
import 'react-notifications-component/dist/theme.css';
import { SavedFeedItems } from './SavedFeedItems';

const ReactNotification = require('react-notifications-component').default;

const database = new Database();

const AppContext = createContext({
  settings: {} as DBSettings,
  database: database,
  setShowUnreadItems: (show: boolean) => { },
  showUnreadItems: false,
});

export const App = () => {
  const [feedIds, setFeedIds] = useState(null as string[] | null);
  const [loading, setLoading] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [settings, setSettings] = useState(null as DBSettings | null);
  const [showUnreadItems, setShowUnreadItems] = useState(false);
  const [savedFeedItems, setSavedFeedItems] =
    useState(null as DBSavedFeedItem[] | null);

  useEffect(() => {
    database.initialize().then(async settings => {
      changeDarkMode(settings.darkMode);

      setSettings(settings);
      setLoading(false);

      // dev mode
      const resetDb = window.location.hash.startsWith('#reset');
      if (resetDb) {
        const resetId = window.location.hash.split('=');
        if (resetId.length > 1) setFeedIds([resetId[1]]);
        else setFeedIds([(await database.loadFeeds())[0].id]);
      } else {
        // setFeedIds([(await database.loadFeeds())[3].id]);
      }
    });
  }, []);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const e = event.target as HTMLDivElement;
    setScrollTop(e.scrollTop + e.clientHeight);
  };

  const selectFeeds = (feedIds: string[]) => {
    setFeedIds(feedIds);
    setSavedFeedItems(null);
  };

  const selectSaved = async () => {
    setSavedFeedItems(await database.loadSavedFeedItems());
    setFeedIds(null);
  };

  return <div id="app" onScroll={onScroll}>
    {loading && <p>Loading...</p>}
    {!loading && <AppContext.Provider
      value={{
        database: database,
        settings: settings!,
        setShowUnreadItems: setShowUnreadItems!,
        showUnreadItems,
      }}>
      <Sidebar
        selectFeeds={selectFeeds}
        selectSaved={selectSaved}
        feedIds={feedIds} />
      {(feedIds || savedFeedItems) &&
        <Content
          feedIds={feedIds}
          savedFeedItems={savedFeedItems}
          scrollTop={scrollTop} />}
    </AppContext.Provider>}
    <ReactNotification />
  </div>;
};

export const useAppContext = () => React.useContext(AppContext);

function changeDarkMode(darkModeOn: boolean) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(darkModeOn ? 'dark' : 'light');
}
