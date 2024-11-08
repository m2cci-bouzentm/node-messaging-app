import { Conversation, User } from '@/types';
import { Dispatch, SetStateAction } from 'react';

export interface MainComponentProps {
  connectedUsers: User[];
  isLoggedIn: boolean;
  currentUser: User | null;
  userToken: string | null;
}
export interface useConversationsResult {
  conversations: Conversation[] | null;
  setConversations: Dispatch<SetStateAction<Conversation[] | null>>;
}
export interface UseGroupsReturnType {
  groups: Conversation[] | null;
  setGroups: Dispatch<SetStateAction<Conversation[] | null>>;
}

export interface LoginComponentProps {
  setUserToken: (token: string) => void;
  setCurrentUser: (user: User) => void;
  setIsLoggedIn: (userState: boolean) => void;
}

export interface SettingsComponentProps {
  currentUser: User | null;
  userToken: string | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface SignUpComponentProps {
  setUserToken: (token: string) => void;
  setCurrentUser: (user: User) => void;
  setIsLoggedIn: (userState: boolean) => void;
}
