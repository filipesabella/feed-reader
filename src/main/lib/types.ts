export interface Feed {
  id: string;
  title: string;
  link: string;
  url: string;
  description: string;
  category: string | null;
  scriptToParse: string;
  scriptToPaginate: string;
  scriptToInline: string;
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
  scriptToInline?: string;
}
