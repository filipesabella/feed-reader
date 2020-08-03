# A Feed Reader

Hi, I built a feed reader for myself, with the features I wanted.
You should probably not use it yourself.

I wanted something that:
* Supported loading and inlining of whatever page, not only through RSS and such. It's definitely not safe though
* Could filter out items by keyword, to remove those pesky not-really-programming-related submissions
* Could save a snapshot of a feed item's content

It does *not* have:
* Counts on unread items. It is not important for my use case
* Durable feeds: *everything* is client side
* Search: see previous point
* Proper error handling, you can look at the console if something looks strange

It does support out of the box:
* Atom and RSS feeds
* Reddit inlining of images and videos, through the .json URLs
* Pagination is a hot mess in the feed world, but it supports Reddit (json and xml), Wordpress, and Tumblr pagination without custom scripts

## If you insist on using it
You can open it [here TODO] and start using it right away.  
As mentioned, everything is on the client side, using the browser's database.

Click on very hard to spot (+) button on the bottom left corner, and add, for example:

https://reddit.com/aww/top.json

or

https://news.ycombinator.com/rss

You *must* deploy your own cors-proxy and configure it in the settings. [It takes 10 minutes](https://github.com/Rob--W/cors-anywhere).

You can backup your feeds in the settings, via gist id and github token.

## A custom feed example
When adding or editing a Feed, you can input custom scripts for loading, inlining, and paginating the feed.

For example, the [Astronomy Picture of the Day Archive](https://apod.nasa.gov/apod/archivepix.html) page does have a feed, but it is not very good as far as xml and RSS feed quality go.

To be able to load, inline, and paginate this feed, I use the following scripts, which you can configure in the _scripting_ section of the edit/add feed modal.

Script to parse the response:
```
const maxItems = 5;
const currentPage = url.includes('page=')
  ? parseInt(url.split('=').slice(-1)[0]) - 1
  : 0;

const doc = new DOMParser().parseFromString(body, 'text/html');
const links = Array.from(doc.querySelectorAll('body > b > a'));
return links.slice(currentPage * maxItems, currentPage * maxItems + maxItems)
  .map(link => {
    const date = link.previousSibling?.textContent?.trim().slice(0, -1) || '';
    return {
      link: `https://apod.nasa.gov/apod/${link.getAttribute('href')}`,
      title: link.innerHTML.replace('\n', ''),
      pubDate: new Date(date),
      comments: '',
      description: '',
      contentEncoded: '',
    };
  });
```

Script to get the next page's URL:
```
return url.includes('page=')
  ? url.replace(/(page=)(\d+)/, (_, prefix, n) => prefix + (parseInt(n) + 1))
  : url + '?page=2';
```

Script to inline the contents of each item:
```
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
    });

    doc.querySelectorAll('img').forEach(e => {
      const src = e.getAttribute('src');
      if (!src.startsWith('http')) {
        e.setAttribute('src', baseUrl + src);
      }
    });

    // remove header and footer
    doc
      .querySelectorAll('center p, center:last-child, script')
      .forEach(e => e.remove());

    return doc.body.outerHTML;
  });
```

A joy to read.

As you can see, they all have a `return` keyword. That is because of [this incredible security risk](https://github.com/filipesabella/feed-reader/blob/master/src/main/lib/window-functions.ts) and how it is used.

Please don't use the textareas for code editing, that would be crazy.

## Running locally

```
yarn
yarn dev
```

You can append `#reset` to the local URL to reset the database and insert
some seed data.

## Attributions

Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [Flaticon](https://www.flaticon.com>www.flaticon.com).
