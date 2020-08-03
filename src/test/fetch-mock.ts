let mocks = {} as { [url: string]: string };

export function mockFetch(url: string, responseBody: string) {
  mocks[url] = responseBody;
}

(global as any).fetch = (url: string) => {
  if (!mocks[url]) throw 'Did not mock fetch for url ' + url;

  return Promise.resolve({
    status: 200,
    text: () => Promise.resolve(mocks[url]),
  });
};
