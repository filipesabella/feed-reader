import * as React from 'react';
import '../styles/settings-modal.less';
import { useState } from 'react';

interface Props {
  closeModal: () => void;
}

export function SettingsModal({ closeModal }: Props): JSX.Element {
  const [darkMode, setDarkMode] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [gistUrl, setGistUrl] = useState('');

  const [confirmDownload, setConfirmDownload] = useState(false);
  const [confirmUpload, setConfirmUpload] = useState(false);

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

  const changeDarkMode = (darkModeOn: boolean) => {
    setDarkMode(darkModeOn);

    document.body.classList.remove('light', 'dark');
    document.body.classList.add(darkModeOn ? 'dark' : 'light');
  };

  return <div className="settings-form">
    <div className="container">
      <div className="field">
        <label>Dark Mode</label>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={e => changeDarkMode(e.target.checked)}></input>
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
  </div>;
}
