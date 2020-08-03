import { DBFeed } from '../../main/lib/database';

export const redditAww = (blockedWords: string): DBFeed => ({
  id: 'redditaww',
  title: '/r/aww',
  url: 'https://www.reddit.com/r/aww.json?limit=2',
  category: 'cute',
  blockedWords,
  readItemsIds: [],
  scriptToParse: '',
  scriptToInline: '',
  scriptToPaginate: '',
});

export const apod = (readItemsIds: string[]): DBFeed => ({
  id: 'apod',
  title: 'APOD',
  url: 'https://apod.nasa.gov/apod/archivepix.html',
  category: null,
  blockedWords: '',
  readItemsIds,
  scriptToParse: `
const maxItems = 3;
const currentPage = url.includes('page=')
  ? parseInt(url.split('=').slice(-1)[0]) - 1
  : 0;

const doc = new DOMParser().parseFromString(body, 'text/html');
const links = Array.from(doc.querySelectorAll('body > b > a'));
return links.slice(currentPage * maxItems, currentPage * maxItems + maxItems)
  .map(link => {
    const date = link.previousSibling.textContent.trim().slice(0, -1) || '';
    return {
      link: \`https://apod.nasa.gov/apod/\${link.getAttribute('href')}\`,
      title: link.innerHTML.replace('\\n', ''),
      pubDate: new Date(date),
      comments: '',
      description: '',
      contentEncoded: '',
    };
  });
`,
  scriptToPaginate: `
if (url.includes('page=')) {
  return url.replace(/(page=)(\\d+)/, (_, prefix, n) => prefix + (parseInt(n) + 1));
} else {
  return url + '?page=2';
}
`,
  scriptToInline: '',
});
