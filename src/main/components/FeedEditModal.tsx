import * as React from 'react';
import { Feed } from '../lib/types';
import { useState, FormEvent } from 'react';
import '../styles/feed-edit-modal.less';
import { database } from './App';

interface Props {
  feed: Feed;
  closeModal: () => void;
}

export function FeedEditModal({ feed, closeModal }: Props): JSX.Element {
  const [title, setTitle] = useState(feed.title);
  const [url, setUrl] = useState(feed.url);
  const [category, setCategory] = useState(feed.category);
  const [scriptToParse, setScriptToParse] = useState(feed.scriptToParse);
  const [scriptToPaginate, setScriptToPaginate]
    = useState(feed.scriptToPaginate);
  const [scriptToInline, setScriptToInline] = useState(feed.scriptToInline);

  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    database.updateFeed({
      ...feed,
      title,
      url,
      category,
      scriptToParse,
      scriptToPaginate,
      scriptToInline,
    }).then(closeModal);
  };

  return <form className="feed-edit-form" onSubmit={e => save(e)}>
    <div className="container">
      <div className="field">
        <label>Title</label>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required={true}></input>
      </div>
      <div className="field">
        <label>URL</label>
        <input
          type="text"
          placeholder="URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required={true}></input>
      </div>
      <div className="field">
        <label>Category</label>
        <input
          type="text"
          placeholder="Category"
          value={category ?? ''}
          onChange={e => setCategory(e.target.value)}></input>
      </div>
      <div className="field-ta">
        <label title="Receives `body: string` and `url: string`">
          Script to parse response
        </label>
        <textarea
          spellCheck={false}
          value={scriptToParse}
          onChange={e => setScriptToParse(e.target.value)}></textarea>
      </div>
      <div className="field-ta">
        <label title="Receives `url: string` and `body: string`">
          Script to parse get next page URL
        </label>
        <textarea
          spellCheck={false}
          value={scriptToPaginate}
          onChange={e => setScriptToPaginate(e.target.value)}></textarea>
      </div>
      <div className="field-ta">
        <label title="Receives `url: string`">
          Script to inline content from each item
        </label>
        <textarea
          spellCheck={false}
          value={scriptToInline}
          onChange={e => setScriptToInline(e.target.value)}></textarea>
      </div>
    </div>
    <div className="actions">
      <button>Save</button>
    </div>
  </form>;
}
