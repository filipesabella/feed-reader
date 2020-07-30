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
    ['7', redditEyeBleach],
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
    blockedWords: '',
    readItemsIds: [],
    scriptToParse: '',
    scriptToInline: `
// BOOM already sent inline content for this item
if (item.contentEncoded !== '') return Promise.resolve('');

return fetch('https://cors-anywhere.herokuapp.com/' + url)
  .then(r => r.text())
  .then(body => {
    const doc = new DOMParser().parseFromString(body, 'text/html');
    doc.querySelectorAll(\`
      .post-header-content,
      .single-post__footer,
      script,
      .post-content ~ *\`).forEach(e => e.remove());
    return doc.querySelector('.single-post-container').outerHTML;
  });
`,
    scriptToPaginate: '',
  });
}

async function hackernews(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '2',
    title: 'Y Combinator',
    url: 'https://news.ycombinator.com/rss',
    category: 'programming',
    blockedWords: '',
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
    blockedWords: '',
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
    blockedWords: 'top java',
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
    blockedWords: '',
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
    category: 'cute',
    blockedWords: '',
    readItemsIds: [],
    scriptToParse: '',
    scriptToInline: '',
    scriptToPaginate: '',
  });
}

async function redditEyeBleach(db: DixieNonSense): Promise<void> {
  await db.feeds.put({
    id: '7',
    title: '/r/eyebleach',
    url: 'https://www.reddit.com/r/eyebleach.json?limit=5',
    category: 'cute',
    blockedWords: '',
    readItemsIds: [],
    scriptToParse: '',
    scriptToInline: '',
    scriptToPaginate: '',
  });
}
