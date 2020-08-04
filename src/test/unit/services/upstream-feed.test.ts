import { expect } from 'chai';
import fs from 'fs';
import 'mocha';
import {
  loadFeedItems,
  upstreamFeedItemToDbFeedItemId
} from '../../../main/services/upstream-feed';
import { clearMockedFetches, mockFetch } from '../../fetch-mock';

require('jsdom-global')();
global.DOMParser = window.DOMParser;

const defaultFeed = {
  id: '1',
  title: 'the title',
  url: '',
  category: '',
  blockedWords: '',
  readItemsIds: [],
  scriptToParse: '',
  scriptToPaginate: '',
  scriptToInline: ''
};

const proxyUrl = 'http://localhost/proxy';

const redditAwwUrl = 'https://www.reddit.com/r/aww.json?limit=2';
const redditProgrammingUrl = 'https://www.reddit.com/r/programing.rss';
const ycombinatorUrl = 'https://news.ycombinator.com/rss';

describe('upstreamFeedItemToDbFeedItemId', () => {
  it('returns the feed item id', () => {
    const item = {
      title: 'the title',
      link: 'the link',
      pubDate: new Date(2020, 1, 1, 0, 0, 0),
      comments: '',
      description: '',
      contentEncoded: '',
    };
    expect(upstreamFeedItemToDbFeedItemId(item)).to.equal('1815958510');
  });
});

describe('loadFeedItems', () => {
  beforeEach(() => {
    clearMockedFetches();
  });

  describe('when there is a script to parse the contents', () => {
    it('returns the parsed content', async () => {
      mockFetch(
        `${proxyUrl}/${redditAwwUrl}`,
        fs.readFileSync('./src/test/fixtures/redditAww.json').toString());

      // doing this to validate that the `url` and `body` parameters
      // are passed in the parse function
      const scriptToParse = `
        return [url.substring(0, 4), body.substring(0, 4)];
      `;

      const feed = {
        ...defaultFeed,
        url: redditAwwUrl,
        scriptToParse,
      };

      const [items, _] = await loadFeedItems(feed, feed.url, proxyUrl);
      expect(items).to.deep.equal(['http', '{\n  ']);
    });
  });

  describe('when it is a json reddit feed', () => {
    it('returns the parsed content', async () => {
      mockFetch(
        `${proxyUrl}/${redditAwwUrl}`,
        fs.readFileSync('./src/test/fixtures/redditAww.json').toString());

      const feed = {
        ...defaultFeed,
        url: redditAwwUrl,
      };

      const [items, _] = await loadFeedItems(feed, feed.url, proxyUrl);

      expect(items).to.deep.equal([{
        link: 'https://www.reddit.com/r/aww/comments/i2zgx0',
        title: 'Baby stares at a woman then smirks',
        pubDate: new Date('2020-08-03T23:51:33.000Z'),
        comments: '',
        description: '',
        contentEncoded:
          '<video loop muted controls>\n      ' +
          '<source\n        ' +
          'src="https://v.redd.it/e1nkl2r27te51/DASH_1080.mp4?source=' +
          'fallback"\n        type="video/mp4"/>\n    </video>'
      }, {
        link: 'https://www.reddit.com/r/aww/comments/i2y0lu',
        title: 'This is Maya. Her owner built her a luxury log cabin.',
        pubDate: new Date('2020-08-03T22:30:04.000Z'),
        comments: '',
        description: '',
        contentEncoded:
          '<video loop muted controls>\n      ' +
          '<source\n        ' +
          'src="https://v.redd.it/z107bfdrrse51/DASH_1080.mp4?source=' +
          'fallback"\n        type="video/mp4"/>\n    </video>'
      }]);
    });
  });

  describe('when it is an atom feed', () => {
    it('returns the parsed content', async () => {
      mockFetch(
        `${proxyUrl}/${redditProgrammingUrl}`,
        fs.readFileSync('./src/test/fixtures/redditProgramming.xml')
          .toString());

      const feed = {
        ...defaultFeed,
        url: redditProgrammingUrl,
      };

      const [items, _] = await loadFeedItems(feed, feed.url, proxyUrl);

      expect(items).to.deep.equal([{
        title: 'Writing the same CLI application twice using Go and Rust: a ' +
          'personal experience',
        link:
          'https://www.reddit.com/r/programming/comments/i3529m/' +
          'writing_the_same_cli_application_twice_using_go/',
        pubDate: new Date('2020-08-03T20:37:50.000Z'),
        comments: '',
        description: '',
        contentEncoded:
          '&#32; submitted by &#32; <a href="https://www.reddit.com/user/' +
          'pcuchi"> /u/pcuchi </a> <br/> <span><a href="https://cuchi.me/' +
          'posts/go-vs-rust">[link]</a></span> &#32; <span><a href="https://' +
          'www.reddit.com/r/programming/comments/i3529m/writing_the_same_cli' +
          '_application_twice_using_go/">[comments]</a></span>'
      }, {
        title:
          'GitHub Actions improvements for fork and pull request workflows ' +
          '- The GitHub Blog',
        link:
          'https://www.reddit.com/r/programming/comments/i34ub3/github_' +
          'actions_improvements_for_fork_and_pull/',
        pubDate: new Date('2020-08-03T20:26:36.000Z'),
        comments: '',
        description: '',
        contentEncoded:
          '&#32; submitted by &#32; <a href="https://www.reddit.com/user/' +
          'dayanruben"> /u/dayanruben </a> <br/> <span><a href="https://' +
          'github.blog/2020-08-03-github-actions-improvements-for-fork-and' +
          '-pull-request-workflows/">[link]</a></span> &#32; <span><a href=' +
          '"https://www.reddit.com/r/programming/comments/i34ub3/github_' +
          'actions_improvements_for_fork_and_pull/">[comments]</a></span>'
      }]);
    });
  });

  describe('when it is an RSS feed', () => {
    it('returns the parsed content', async () => {
      mockFetch(
        `${proxyUrl}/${ycombinatorUrl}`,
        fs.readFileSync('./src/test/fixtures/ycombinator.rss')
          .toString());

      const feed = {
        ...defaultFeed,
        url: ycombinatorUrl,
      };

      const [items, _] = await loadFeedItems(feed, feed.url, proxyUrl);

      expect(items).to.deep.equal([{
        title: 'Physical attractiveness bias in the legal system',
        link: 'https://www.thelawproject.com.au/insights/attractiveness-' +
          'bias-in-the-legal-system',
        pubDate: new Date('2020-08-03T22:50:09.000Z'),
        comments: 'https://news.ycombinator.com/item?id=24044409',
        description: 'Comments',
        contentEncoded: ''
      }, {
        title:
          'A ride that takes 10^20k years to complete in Roller Coaster ' +
          'Tycoon 2 [video]',
        link: 'https://www.youtube.com/watch?v=KVgoy_a_gWI',
        pubDate: new Date('2020-08-03T19:34:55.000Z'),
        comments: 'https://news.ycombinator.com/item?id=24042305',
        description: 'Comments',
        contentEncoded: ''
      }]);
    });
  });
});
