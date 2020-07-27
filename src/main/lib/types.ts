export const CategoryFeed: Feed = {
  id: '',
  title: '',
  link: '',
  description: '',
  category: '',
};

export interface Feed {
  id: string;
  title: string;
  link: string;
  description: string;
  category: string | null;
}

export interface FeedItem {
  id: string;
  feedId: string;
  read: boolean;
  title: string;
  link: string;
  pubDate: Date;
  comments: string;
  description: string;
  contentEncoded: string;
}
