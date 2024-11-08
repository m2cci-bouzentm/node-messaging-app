
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  sentMessages?: Message[];
  receivedMessages?: Message[];
  conversations?: Conversation[];
  iat?: number;
  exp?: number;
}
export interface Message {
  id: string;
  content: string;
  sentOn: Date;
  sender?: User;
  senderId: string;
  receiver?: User;
  receiverId: string;
  receivers?: User[];
  conversation?: Conversation;
  conversationId: string;
}
export interface Conversation {
  id: string;
  createdOn: Date;
  updatedAt: Date;
  name?: string;
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
export interface authenticateUserHookParams {
  setCurrentUser: (currentUserState: User | null) => void;
  setUserToken: (userTokenState: string | null) => void;
  setIsLoggedIn: (isLoggedInStatus: boolean) => void;
}
