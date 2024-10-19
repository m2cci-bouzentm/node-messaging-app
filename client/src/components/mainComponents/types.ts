import { User, Message, Conversation } from '@/types';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';

export interface MessageItemProps {
  message: Message | null;
  currentUser: User | null;
}
export interface GroupMultipleSelectProps {
  usersSelectRef: MutableRefObject<HTMLDivElement | null>;
  users: User[] | null;
}

export interface GroupListItemComponentProps {
  currentUser: User | null;
  handleGetGroup: (group: Conversation) => void;
  group: Conversation | null;
  groups: Conversation[] | null;
  setGroups: Dispatch<SetStateAction<Conversation[] | null>>;
  userToken: string | null;
  setReceiverId: Dispatch<SetStateAction<string | null>>;
}

export interface ConversationListItemComponentProps {
  currentUser: User | null;
  conversationId: string | null;
  conversations: Conversation[] | null;
  setConversations: Dispatch<SetStateAction<Conversation[] | null>>;
  userToken: string | null;
  receiver: User | null;
  setReceiverId: Dispatch<SetStateAction<string | null>>;
  connectedUsers: User[];
  isConnectedUser: (connectedUsers: User[], checkedUser: User) => boolean;
  handleCreateOrGetExistingConversation: (receiverId: string) => void;
}

export interface SaveMessageParams {
  userToken: string;
  senderId: string;
  receiversIds: string[] | null;
  receiverId: string | null;
  message: string;
  conversationId: string;
}

export interface chatComponentProps {
  userToken: string | null;
  currentUser: User | null;
  receiverId: string | null;
  setReceiverId: Dispatch<SetStateAction<string | null>>;
  conversation: Conversation | null;
  setConversation: Dispatch<SetStateAction<Conversation | null>>;
  isConnectedUser: (connectedUsers: User[], user: User) => boolean;
  connectedUsers: User[];
  conversations: Conversation[] | null;
  setConversations: Dispatch<SetStateAction<Conversation[] | null>>;
  moveConversationToTop: (
    conversations: Conversation[] | null,
    conversation: Conversation | null
  ) => Conversation[] | null;
  groups: Conversation[] | null;
  setGroups: Dispatch<SetStateAction<Conversation[] | null>>;
}

export interface AddGroupPopOverComponentProps {
  users: User[] | null;
  userToken: string | null;
  groups: Conversation[] | null;
  setGroups: Dispatch<SetStateAction<Conversation[] | null>>;
}
