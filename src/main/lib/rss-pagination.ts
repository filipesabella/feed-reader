export function nextPageUrl(
  url: string,
  responseBody: string,
  scriptToPaginate: string | null): string | null {
  if (scriptToPaginate) {
    // lol
    (window as any).eval(`function __paginate(url, body) {
      ${scriptToPaginate}
    }`);

    return (window as any).__paginate(url, responseBody);
  } else {
    const isRedditJson = () => !!url.match(/reddit\.com.*\.json/);

    if (isRedditJson()) {
      return redditJson(url, responseBody);
    } else {
      const rss = new DOMParser().parseFromString(responseBody, 'text/xml');
      const generator = rss.querySelector('channel > generator')
        ?.innerHTML.toUpperCase() || '';

      const isWordPress = () => generator.includes('WORDPRESS');
      const isTumblr = () => generator.includes('TUMBLR');
      const isReddit = () => url.includes('reddit.com');

      if (isWordPress()) {
        return wordpress(url, rss);
      } else if (isTumblr()) {
        return tumblr(url, rss);
      } else if (isRedditJson()) {
        return redditJson(url, responseBody);
      } else if (isReddit()) {
        return reddit(url, rss);
      }
    }
  }
  console.log('Don\'t know how to page for ' + url);
  return null;
}

function wordpress(url: string, rss: Document): string | null {
  if (url.includes('paged=')) {
    const currentPage = url.match(/paged=(\d+)/)![1];
    return url.replace(/(paged=)(\d+)/, (_, prefix, n) =>
      `${prefix}${parseInt(currentPage) + 1}`);
  } else {
    return `${url}?paged=2`;
  }
}

function tumblr(url: string, rss: Document): string | null {
  if (url.includes('/page/')) {
    return url.replace(/(\/page\/)(\d+)\//,
      (_, prefix, n) => `${prefix}${(parseInt(n) + 1)}/`);
  } else {
    const currentItems = rss.querySelectorAll('rss > channel > item').length;
    return url.replace('/rss', `/page/${currentItems + 1}/rss`);
  }
}

function redditJson(url: string, body: string): string | null {
  const lastItemId = JSON.parse(body).data.after;
  if (url.includes('after=')) {
    return url.replace(/after=.*?$/, `after=${lastItemId}`);
  } else {

    return (!url.includes('?') ? url + '?' : url + '&')
      + `after=${lastItemId}`;
  }
}

function reddit(url: string, rss: Document): string | null {
  const lastItemId = rss
    .querySelector('feed > entry:last-child > id')?.innerHTML;
  if (!lastItemId) return null;

  if (url.includes('?after=')) {
    return url.replace(/after=.*?$/, 'after=' + lastItemId);
  } else {
    return url += '?after=' + lastItemId;
  }
}
