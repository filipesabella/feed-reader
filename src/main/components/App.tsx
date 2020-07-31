import * as React from 'react';
import { createContext, useEffect, useState } from 'react';
import { Database, DBSettings } from '../lib/db';
import '../styles/app.less';
import { Content } from './Content';
import { Sidebar } from './Sidebar';

const database = new Database();

export const AppContext = createContext({
  settings: {} as DBSettings,
  database: database,
});

export const App = () => {
  const [feedIds, setFeedIds] = useState(null as string[] | null);
  const [loading, setLoading] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [settings, setSettings] = useState(null as DBSettings | null);

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
        setFeedIds([(await database.loadFeeds())[3].id]);
      }
    });
  }, []);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const e = event.target as HTMLDivElement;
    setScrollTop(e.scrollTop + e.clientHeight);
  };

  return <div id="app" onScroll={onScroll}>
    {loading && <p>Loading...</p>}
    {!loading && feedIds && <AppContext.Provider
      value={{
        database: database,
        settings: settings!,
      }}>
      <Sidebar
        selectFeed={setFeedIds}
        feedIds={feedIds} />
      <Content feedIds={feedIds} scrollTop={scrollTop} />
    </AppContext.Provider>}
  </div>;
};

export const useAppContext = () => React.useContext(AppContext);

export function changeDarkMode(darkModeOn: boolean) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(darkModeOn ? 'dark' : 'light');
}
