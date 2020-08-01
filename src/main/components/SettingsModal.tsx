import * as React from 'react';
import { FormEvent, useState } from 'react';
import { downloaData, uploadData } from '../lib/data-sync';
import '../styles/settings-modal.less';
import { useAppContext } from './App';

const { NotificationManager } = require('react-notifications');

export function SettingsModal(): JSX.Element {
  const { database, settings } = useAppContext();

  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [proxyUrl, setProxyUrl] = useState(settings.proxyUrl);
  const [gistId, setGistId] = useState(settings.gistId);
  const [githubToken, setGithubToken] = useState(settings.githubToken);

  const [confirmDownload, setConfirmDownload] = useState(false);
  const [confirmUpload, setConfirmUpload] = useState(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    database.saveSettings(darkMode, proxyUrl, gistId, githubToken);

    window.location.reload();
  };

  const download = async () => {
    if (!confirmDownload) {
      setConfirmDownload(true);
      setTimeout(() => setConfirmDownload(false), 1000);
    } else {
      await downloaData(database, settings);
      window.location.reload();
    }
  };

  const upload = async () => {
    if (!confirmUpload) {
      setConfirmUpload(true);
      setTimeout(() => setConfirmUpload(false), 1000);
    } else {
      await uploadData(database, settings);
      NotificationManager.info('Uploaded!');
    }
  };

  const doSetDarkMode = (darkModeOn: boolean) => {
    setDarkMode(darkModeOn);
  };

  return <form className="settings-form" onSubmit={e => save(e)}>
    <div className="container">
      <div className="field">
        <label>Dark Mode</label>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={e => doSetDarkMode(e.target.checked)}></input>
      </div>
      <div className="field">
        <label>Proxy URL<span>(for CORS)</span></label>
        <input
          type="text"
          placeholder="Proxy URL"
          value={proxyUrl}
          onChange={e => setProxyUrl(e.target.value)}
          required={true}></input>
      </div>

      <div className="field">
        <label>Gist ID<span>(for Upload & Download data)</span></label>
        <input
          type="text"
          placeholder="Gist ID"
          value={gistId}
          onChange={e => setGistId(e.target.value)}></input>
      </div>

      <div className="field">
        <label>Github Token<span>(for Upload & Download data)</span></label>
        <input
          type="text"
          placeholder="Github Token"
          value={githubToken}
          onChange={e => setGithubToken(e.target.value)}></input>
      </div>
    </div>

    <div className="actions">
      <div className="syncData">
        <span onClick={() => download()}>
          {confirmDownload ? 'Are you sure?' : 'Download Data'}
        </span>
        &nbsp;/&nbsp;
        <span onClick={() => upload()}>
          {confirmUpload ? 'Are you sure?' : 'Upload Data'}
        </span>
      </div>
      <input type="submit" value="Save" />
    </div>
  </form>;
}
