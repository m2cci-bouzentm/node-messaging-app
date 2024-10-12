export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  sentMessages?: Message[];
  receivedMessages?: Message[];
  conversations?: Conversation[];
}
export interface Message {
  id: string;
  content: string;
  sentOn: Date;
  sender?: User;
  senderId: string;
  receiver?: User;
  receiverId: string;
  conversation?: Conversation;
  conversationId: string;
}
export interface Conversation {
  id: string;
  createdOn: Date;
  messages?: Message[];
  users?: User[];
}
export interface validationError {
  msg: string;
  location?: string;
  path?: string;
  type?: string;
  value?: string;
}
