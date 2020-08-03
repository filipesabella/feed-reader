import { expect } from 'chai';
import 'mocha';
import { Database } from '../../main/lib/database';
import { loadFeedsItems, loadNextPages } from '../../main/services/feed';
import * as fixtures from '../fixtures/feeds';
import fs from 'fs';
import { mockFetch } from '../fetch-mock';

require('jsdom-global')();
global.DOMParser = window.DOMParser;

const apodUrl = 'https://apod.nasa.gov/apod/archivepix.html';
const redditAwwUrl = 'https://www.reddit.com/r/aww.json?limit=2';

mockFetch(
  `http://localhost/proxy/${apodUrl}`,
  fs.readFileSync('./src/test/fixtures/apod.html').toString());

mockFetch(
  `http://localhost/proxy/${redditAwwUrl}`,
  fs.readFileSync('./src/test/fixtures/redditAww.json').toString());

const database = {
  loadFeedsById: async (_: string[]) => {
    return [
      // test read items
      fixtures.apod(['1822198744']),
      // test blocked words
      fixtures.redditAww('baby'),
    ];
  },
  loadSavedFeedItemIds: async () => new Set<string>(['123', '456']),
} as Database;


it('loadFeedsItems', async () => {
  const feedIds = ['apod', 'redditaww'];
  const proxyUrl = 'http://localhost/proxy';
  const showUnreadItems = false;

  const [[items, nextPageUrls], savedItemIds] = await
    loadFeedsItems(database, feedIds, proxyUrl, showUnreadItems);

  expect(items).to.deep.equal(expectedItems);

  expect(nextPageUrls).to.deep.equal(expectedNextPages);

  expect(savedItemIds).to.deep.equal(new Set(['123', '456']));
});

it('loadNextPages', async () => {
  const nextPageData = [
    { feedId: 'apod', url: apodUrl },
    { feedId: 'redditaww', url: redditAwwUrl },
  ];

  const proxyUrl = 'http://localhost/proxy';
  const showUnreadItems = false;

  const [items, nextPageUrls] = await
    loadNextPages(database, nextPageData, proxyUrl, showUnreadItems);

  expect(items).to.deep.equal(expectedItems);

  expect(nextPageUrls).to.deep.equal(expectedNextPages);
});

const expectedItems = [{
  'link': 'https://www.reddit.com/r/aww/comments/i2y0lu',
  'title': 'This is Maya. Her owner built her a luxury log cabin.',
  'pubDate': new Date('2020-08-03T22:30:04.000Z'),
  'comments': '',
  'description': '',
  'contentEncoded': '<video loop muted controls>\n      <source\n        src="https://v.redd.it/z107bfdrrse51/DASH_1080.mp4?source=fallback"\n        type="video/mp4"/>\n    </video>',
  'id': '-1566550442',
  'feedId': 'redditaww',
  'read': false,
  'scriptToInline': ''
}, {
  'link': 'https://apod.nasa.gov/apod/ap200802.html',
  'title': 'APOD: 2020 August 2 – Two Worlds One      Sun',
  'pubDate': new Date('2020-08-02T03:00:00.000Z'),
  'comments': '',
  'description': '',
  'contentEncoded': '',
  'id': '1145313922',
  'feedId': 'apod',
  'read': false,
  'scriptToInline': ''
}, {
  'link': 'https://apod.nasa.gov/apod/ap200801.html',
  'title': 'The Elephant\'s Trunk Nebula in      Cepheus',
  'pubDate': new Date('2020-08-01T03:00:00.000Z'),
  'comments': '',
  'description': '',
  'contentEncoded': '',
  'id': '680875158',
  'feedId': 'apod',
  'read': false,
  'scriptToInline': ''
}];

const expectedNextPages = [{
  feedId: 'apod',
  url: 'https://apod.nasa.gov/apod/archivepix.html?page=2'
}, {
  'feedId': 'redditaww',
  'url': 'https://www.reddit.com/r/aww.json?limit=2&after=t3_i2y0lu'
}];
