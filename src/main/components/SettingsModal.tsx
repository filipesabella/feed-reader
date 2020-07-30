import * as React from 'react';
import '../styles/settings-modal.less';
import { useState, FormEvent, useEffect } from 'react';
import { changeDarkMode, database } from './App';

export function SettingsModal(): JSX.Element {
  const [darkMode, setDarkMode] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [gistUrl, setGistUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');

  useEffect(() => {
    database.loadSettings()
      .then(settings => {
        setDarkMode(settings.darkMode);
        setProxyUrl(settings.proxyUrl);
        setGistUrl(settings.gistUrl);
        setGithubToken(settings.githubToken);
      });
  }, []);

  const [confirmDownload, setConfirmDownload] = useState(false);
  const [confirmUpload, setConfirmUpload] = useState(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    database.saveSettings(darkMode, proxyUrl, gistUrl, githubToken);

    window.location.reload();
  };

  const download = () => {
    if (!confirmDownload) {
      setConfirmDownload(true);
      setTimeout(() => setConfirmDownload(false), 1000);
    } else {
      console.log('download');
    }
  };

  const upload = () => {
    if (!confirmUpload) {
      setConfirmUpload(true);
      setTimeout(() => setConfirmUpload(false), 1000);
    } else {
      console.log('upload');
    }
  };

  const doSetDarkMode = (darkModeOn: boolean) => {
    setDarkMode(darkModeOn);
    changeDarkMode(darkModeOn);
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
        <label>Gist URL<span>(for Upload & Download data)</span></label>
        <input
          type="text"
          placeholder="Gist URL"
          value={gistUrl}
          onChange={e => setGistUrl(e.target.value)}></input>
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
