export interface Feed {
  title: string;
  link: string;
  description: string;
  items: FeedItem[];
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  comments: string;
  description: string;
}
