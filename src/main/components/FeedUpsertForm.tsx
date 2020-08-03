import * as React from 'react';
import { FormEvent, useState } from 'react';
import { Feed } from '../lib/types';
import '../styles/feed-upsert-form.less';
import { useAppContext } from './App';

interface Props {
  feed: Feed;
  saved: (feed: Feed) => void;
  closeModal: () => void;
}

export function FeedUpsertForm({ feed, saved, closeModal }: Props)
  : JSX.Element {
  const { database } = useAppContext();

  const [title, setTitle] = useState(feed.title);
  const [url, setUrl] = useState(feed.url);
  const [category, setCategory] = useState(feed.category);
  const [blockedWords, setBlockedWords] = useState(feed.blockedWords);
  const [scriptToParse, setScriptToParse] = useState(feed.scriptToParse);
  const [scriptToPaginate, setScriptToPaginate]
    = useState(feed.scriptToPaginate);
  const [scriptToInline, setScriptToInline] = useState(feed.scriptToInline);

  const [confirmDeletion, setConfirmDeletion] = useState(false);

  const [showScripting, setShowScripting] = useState(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await database.upsertFeed({
      ...feed,
      title,
      url,
      category,
      blockedWords,
      scriptToParse,
      scriptToPaginate,
      scriptToInline,
    });

    closeModal();
    saved(feed);
  };

  const doDelete = async () => {
    if (confirmDeletion === false) {
      setConfirmDeletion(true);
      setTimeout(() => setConfirmDeletion(false), 1000);

    } else {
      await database.deleteFeed(feed);
      closeModal();
    }
  };

  return <form className="feed-upsert-form" onSubmit={e => save(e)}>
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
      <div className="field">
        <label>Blocked words</label>
        <input
          type="text"
          placeholder="Blocked words"
          value={blockedWords ?? ''}
          onChange={e => setBlockedWords(e.target.value)}></input>
      </div>
      <h2 onClick={() => setShowScripting(!showScripting)}>
        Scripting {showScripting ? '⌃' : '⌄'}
      </h2>
      <div className={'section' + (showScripting ? '' : ' hidden')}>
        <div className="field-ta">
          <label
            title={'Has `url: string` and `body: string` in context.\n' +
              'Returns a FeedItem {link: string, title: string, pubDate: ' +
              'Date, comments: string, description: string, contentEncoded: ' +
              'string}.\n' +
              'You MUST use the `return` keyword on the last line.'}>
            Script to parse the response
          </label>
          <textarea
            spellCheck={false}
            value={scriptToParse}
            onChange={e => setScriptToParse(e.target.value)}></textarea>
        </div>
        <div className="field-ta">
          <label title={'Has `url: string` and `body: string` in context.\n' +
            'Returns a url string.\n' +
            'You MUST use the `return` keyword on the last line.'}>
            Script to get the next page URL
          </label>
          <textarea
            spellCheck={false}
            value={scriptToPaginate}
            onChange={e => setScriptToPaginate(e.target.value)}></textarea>
        </div>
        <div className="field-ta">
          <label title={'Has `url: string` and `item: {description: ' +
            'string, contentEncoded: string in context.\n' +
            'Returns  Promise<string> with the content.\n' +
            'You MUST use the `return` keyword on the last line.'}>
            Script to inline the contents of each item
          </label>
          <textarea
            spellCheck={false}
            value={scriptToInline}
            onChange={e => setScriptToInline(e.target.value)}></textarea>
        </div>
      </div>
    </div>
    <div className="actions">
      {title && <span onClick={() => doDelete()}>
        {confirmDeletion ? 'Are you sure?' : 'Delete'}
      </span>}
      <input type="submit" value="Save" />
    </div>
  </form>;
}
