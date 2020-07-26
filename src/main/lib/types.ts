export interface Feed {
  id: string;
  title: string;
  link: string;
  description: string;
  items: FeedItem[];
  category: string | null;
}

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  comments: string;
  description: string;
  contentEncoded: string;
  read: boolean;
}
