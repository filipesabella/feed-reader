let mocks = {} as { [url: string]: string };

export function mockFetch(url: string, responseBody: string): void {
  mocks[url] = responseBody;
}

export function clearMockedFetches(): void {
  mocks = {};
}

(global as any).fetch = (url: string) => {
  if (!mocks[url]) throw 'Did not mock fetch for url ' + url;

  return Promise.resolve({
    status: 200,
    text: () => Promise.resolve(mocks[url]),
  });
};
