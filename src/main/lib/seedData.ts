import { DixieNonSense } from './db';

export async function seed(db: DixieNonSense): Promise<void> {
  const resetId = window.location.hash.split('=');

  const shouldInsert = ([id]: [string, any]) =>
    resetId.length < 2 || resetId[1] === id;

  const feeds: [string, (db: DixieNonSense) => Promise<void>][] = [
    ['1', wordpress],
    ['2', hackernews],
    ['3', tumblr],
    ['4', redditProgramming],
    ['5', nasa],
    ['6', redditAww],
  ];
  await Promise.all(feeds
    .filter(shouldInsert)
    .map(([_, fn]) => fn(db)));
}

async function wordpress(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '1',
    title: 'BOOOM',
    url: 'http://www.booooooom.com/feed',
    category: 'photography',
    readItemsIds: [],
    scriptToParse: '',
    scriptToInline: '',
    scriptToPaginate: '',
  });
}

async function hackernews(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '2',
    title: 'Y Combinator',
    url: 'https://news.ycombinator.com/rss',
    category: 'programming',
    readItemsIds: [],
    scriptToParse: '',
    scriptToInline: '',
    scriptToPaginate: '',
  });
}

async function tumblr(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '3',
    title: 'Lord of The Flies',
    url: 'https://lordofthegadflies.tumblr.com/rss',
    category: null,
    readItemsIds: [],
    scriptToParse: '',
    scriptToInline: '',
    scriptToPaginate: '',
  });
}

async function redditProgramming(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '4',
    title: '/r/programming',
    url: 'https://www.reddit.com/r/programming.rss',
    category: 'programming',
    readItemsIds: [],
    scriptToParse: '',
    scriptToInline: '',
    scriptToPaginate: '',
  });
}

async function nasa(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '5',
    title: 'APOD',
    url: 'https://apod.nasa.gov/apod/archivepix.html',
    category: null,
    readItemsIds: [],
    scriptToParse: `
const maxItems = 5;
const currentPage = url.includes('page=')
? parseInt(url.split('=').slice(-1)[0]) - 1
: 0;

const doc = new DOMParser().parseFromString(body, 'text/html');
const links = Array.from(doc.querySelectorAll('body > b > a'));
return links.slice(currentPage * maxItems, currentPage * maxItems + maxItems)
.map(link => {
  return {
    link: \`https://apod.nasa.gov/apod/\${link.getAttribute('href')}\`,
    title: link.innerHTML.replace('\\n', ''),
    pubDate: new Date(link.previousSibling?.textContent?.trim().slice(0, -1) || ''),
    comments: '',
    description: '',
    contentEncoded: '',
  };
});
`,
    scriptToPaginate: `
if (url.includes('page=')) {
return url.replace(/(page=)(\\d+)/,
  (_, prefix, n) => prefix + (parseInt(n) + 1));
} else {
return url + '?page=2';
}
`,
    scriptToInline: `
return fetch('https://cors-anywhere.herokuapp.com/' + url)
.then(r => r.text())
.then(body => {
  const doc = new DOMParser().parseFromString(body, 'text/html');
  const baseUrl = 'https://apod.nasa.gov/apod/';
  doc.querySelectorAll('a').forEach(e => {
    const href = e.getAttribute('href');
    if (!href.startsWith('http')) {
      e.setAttribute('href', baseUrl + href);
    }
  })
  doc.querySelectorAll('img').forEach(e => {
    const src = e.getAttribute('src');
    if (!src.startsWith('http')) {
      e.setAttribute('src', baseUrl + src);
    }
  });

  // remove header and footer
  doc.querySelector('center p')?.remove();
  doc.querySelector('center:last-child').remove();
  doc.querySelectorAll('script').forEach(e => e.remove());
  return doc.body.outerHTML;
});
`,
  });
}

async function redditAww(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '6',
    title: '/r/aww',
    url: 'https://www.reddit.com/r/aww.json?limit=5',
    category: '',
    readItemsIds: [],
    scriptToParse: `
const json = JSON.parse(body);
return json.data.children
  .filter(e => !e.data.stickied) // ignore announcements
  .map(e => {
    const imgUrl = url => {
      if (url.includes('imgur')) return url + '.png';
      else return url;
    };

    const content = () => {
      if (e.data.url.includes('gfycat')) {
        const doc = new DOMParser().parseFromString(
          e.data.secure_media_embed.content, 'text/html');
        return doc.documentElement.textContent || '';
      } else {
        return e.data.secure_media?.reddit_video?.fallback_url
          ? '<video loop muted controls>' +
              '<source src="' + e.data.secure_media.reddit_video.fallback_url + '" type="video/mp4"/>' +
            '</video>'
          : '<img style="max-width: 600px" src="' + imgUrl(e.data.url) + '"/>';
      }
    }

    return {
      link: 'https://www.reddit.com/r/aww/comments/' + e.data.id,
      title: e.data.title,
      pubDate: new Date(e.data.created),
      comments: 'https://www.reddit.com/r/aww/comments/' + e.data.id,
      description: '',
      contentEncoded: content(),
    };
  });
`,
    scriptToPaginate: `
const lastItemId = JSON.parse(body).data.after;
if (url.includes('after=')) {
  return url.replace(/after=.*?$/, 'after=' + lastItemId);
} else {
  return url += '&after=' + lastItemId;
}
`,
    scriptToInline: '',
  });
}
