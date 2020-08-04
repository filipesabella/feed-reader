import { expect } from 'chai';
import 'mocha';
import { nextPageUrl } from '../../../main/services/feed-pagination';

require('jsdom-global')();
global.DOMParser = window.DOMParser;

describe('when it has no idea how to paginate', () => {
  it('returns null', () => {
    expect(nextPageUrl('', '', '')).to.equal(null);
  });
});

describe('when there is a custom script for pagination', () => {
  it('returns the second page url', () => {
    const url = 'http://localhost/the-url';
    const responseBody = 'the body';
    const scriptToPaginate = 'return url + "_" + body + "_" + "test"';
    const nextPage = nextPageUrl(url, responseBody, scriptToPaginate);

    expect(nextPage).to.equal('http://localhost/the-url_the body_test');
  });
});

describe('when it is a json reddit feed', () => {
  const rootUrl = 'http://localhost/the-url/reddit.com/something.json';
  const secondPage = rootUrl + '?after=the-last-id';
  const thirdPage = rootUrl + '?after=the-very-last-id';

  const body = (lastId: string) => JSON.stringify({
    data: {
      after: lastId
    }
  });

  it('returns the second page url', () => {
    const url = rootUrl;
    const responseBody = body('the-last-id');
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(url, responseBody, scriptToPaginate);

    expect(nextPage).to.equal(secondPage);
  });

  it('returns the third page url', () => {
    const url = secondPage;
    const responseBody = body('the-very-last-id');
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(url, responseBody, scriptToPaginate);

    expect(nextPage).to.equal(thirdPage);
  });
});

describe('when it is a wordpress feed', () => {
  const rootUrl = 'http://localhost/the-url';
  const secondPage = rootUrl + '?paged=2';
  const thirdPage = rootUrl + '?paged=3';

  const wordPressFeed = `
    <channel>
      <generator>this is a wordpress feed</generator>
    </channel>
  `;

  it('returns the second page url', () => {
    const url = rootUrl;
    const responseBody = wordPressFeed;
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(url, responseBody, scriptToPaginate);

    expect(nextPage).to.equal(secondPage);
  });

  it('returns the third page url', () => {
    const url = secondPage;
    const responseBody = wordPressFeed;
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(url, responseBody, scriptToPaginate);

    expect(nextPage).to.equal(thirdPage);
  });
});

describe('when it is a tumblr feed', () => {
  const rootUrl = 'http://localhost/the-url/rss';
  const secondPage = rootUrl.replace('/rss', '/page/4/rss');
  const thirdPage = rootUrl.replace('/rss', '/page/5/rss');

  const tumblrFeed = `
    <rss>
      <channel>
        <generator>this is a tumblr feed</generator>
        <item></item>
        <item></item>
        <item></item>
      </channel>
    </rss>
  `;

  it('returns the second page url', () => {
    const url = rootUrl;
    const responseBody = tumblrFeed;
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(url, responseBody, scriptToPaginate);

    expect(nextPage).to.equal(secondPage);
  });

  it('returns the third page url', () => {
    const url = secondPage;
    const responseBody = tumblrFeed;
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(url, responseBody, scriptToPaginate);

    expect(nextPage).to.equal(thirdPage);
  });
});


describe('when it is a reddit xml feed', () => {
  const rootUrl = 'http://localhost/reddit.com';
  const secondPage = rootUrl + '?after=the-last-id';
  const thirdPage = rootUrl + '?after=the-very-last-id';

  const redditFeed = (lastId: string) => `
    <feed>
      <entry></entry>
      <entry></entry>
      <entry><id>${lastId}</id></entry>
    </feed>
  `;

  it('returns the second page url', () => {
    const url = rootUrl;
    const responseBody = redditFeed;
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(
      url,
      responseBody('the-last-id'),
      scriptToPaginate);

    expect(nextPage).to.equal(secondPage);
  });

  it('returns the third page url', () => {
    const url = secondPage;
    const responseBody = redditFeed;
    const scriptToPaginate = '';
    const nextPage = nextPageUrl(
      url,
      responseBody('the-very-last-id'),
      scriptToPaginate);

    expect(nextPage).to.equal(thirdPage);
  });
});
