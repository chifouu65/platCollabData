export interface Comment {
  _id?: string;
  content: string;
  author: string; // You can use a user ID or name
  timestamp: Date;
}
