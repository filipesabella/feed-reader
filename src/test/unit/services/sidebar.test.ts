import { expect } from 'chai';
import 'mocha';
import { loadSidebar } from '../../../main/services/sidebar';
import { Database, DBFeed } from '../../../main/lib/database';

const collapsedStates = { 'category2': true, 'category1': false };
(global as any).localStorage = {
  getItem: () => JSON.stringify(collapsedStates),
};

const database = {
  loadFeeds: async () => [{
    title: 'title1',
    category: 'category1'
  }, {
    title: 'title2',
    category: 'category1'
  }, {
    title: 'title3',
    category: 'category2'
  }, {
    title: 'title4',
    category: null,
  }],
} as Database;

describe('loadSidebar', () => {
  it('loads', async () => {
    const [
      feedsByCategory,
      loadedCollapsedStates,
    ] = await loadSidebar(database);

    expect(feedsByCategory).to.deep.equal({
      category1: [
        { title: 'title1', category: 'category1', collapsed: false },
        { title: 'title2', category: 'category1', collapsed: false }
      ],
      category2: [
        { title: 'title3', category: 'category2', collapsed: true }
      ],
      _: [{ title: 'title4', category: null, collapsed: false }]
    });

    expect(loadedCollapsedStates).to.deep.equal(collapsedStates);

  });
});
