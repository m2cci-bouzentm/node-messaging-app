/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { useNotifications } from '@toolpad/core/useNotifications';
import { Conversation, Message, useConversationsProps, User } from '@/types';

import ChatComponent from './mainComponents/ChatComponent';
import ConversationListItemComponent from './mainComponents/ConversationListItemComponent';

import { SocketContext } from '@/context';
import { validURL } from '@/helpers';

const useUsers = (isLoggedIn: boolean, userToken: string | null): User[] | null => {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    fetch(import.meta.env.VITE_API_BASE_URL + '/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((users) => {
        setUsers(users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [isLoggedIn]);

  return users;
};

const useConversations = (isLoggedIn: boolean, userToken: string | null): useConversationsProps => {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    fetch(import.meta.env.VITE_API_BASE_URL + '/conversation', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((conversations) => {
        console.log('conversation', conversations);
        setConversations(conversations);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [isLoggedIn]);

  return { conversations, setConversations };
};

const moveConversationToTop = (
  conversations: Conversation[] | null,
  conversation: Conversation | null
) => {
  if (conversations && conversation) {
    const restOfConversations = conversations.filter((conv) => conv.id !== conversation.id);
    return [conversation, ...restOfConversations];
  }
  return conversations;
};

interface MainComponentProps {
  connectedUsers: User[];
  isLoggedIn: boolean;
  currentUser: User | null;
  userToken: string | null;
}
const MainComponent = ({
  connectedUsers,
  isLoggedIn,
  currentUser,
  userToken,
}: MainComponentProps) => {
  const users: User[] | null = useUsers(isLoggedIn, userToken);
  const { conversations, setConversations }: useConversationsProps = useConversations(
    isLoggedIn,
    userToken
  );
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [searchedUsers, setSearchedUsers] = useState<User[] | null>(null);
  const [searchedConversations, setSearchedConversations] = useState<Conversation[] | null>(null);

  const [isUsersList, setIsUsersList] = useState<boolean>(true);
  const [isConvoList, setIsConvoList] = useState<boolean>(false);

  const socket = useContext(SocketContext);

  const notifications = useNotifications();

  useEffect(() => {
    setSearchedUsers(users);
    setSearchedConversations(conversations);
  }, [users, conversations]);

  useEffect(() => {
    // notify the user when he receives a message

    // join a secret room to receive messages notifications
    socket?.emit('join-room', currentUser?.id);

    // listen to received messages notifications
    socket?.on('notify-receive-chat-message', (message: Message) => {
      const notifMsg = validURL(message.content) ? 'sent you an image' : message.content;
      notifications.show(`${message.sender?.username}: ${notifMsg}`, {
        autoHideDuration: 2500,
      });

      const conversation = conversations?.find((conv) => conv.id === message.conversationId) || null;
      console.log(conversations, conversation);
      console.log('moveConversationToTop', moveConversationToTop(conversations, conversation));
      setConversations(moveConversationToTop(conversations, conversation));
    });

    return ()=> {
      socket?.removeAllListeners('notify-receive-chat-message');
    }
  }, [!conversations && conversations]);

  // create conversation OR gets an existing one AND set the receiver id
  const handleCreateOrGetExistingConversation = (receiverId: string) => {
    setReceiverId(receiverId);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/conversation/twoUsers`, {
      method: 'POST',
      headers: {
        'Content-type': 'Application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        senderId: currentUser?.id,
        receiverId,
      }),
    })
      .then((res) => res.json())
      .then((conversation) => {
        setConversation(conversation);
        if (conversations) {
          const isAlreadyExistingConvo = conversations.some((conv) => conv.id === conversation.id);
          // no need to update the state if the conversation already exists
          if (!isAlreadyExistingConvo) {
            const updatedConversations = conversations.filter(
              (conv) => conv.id !== conversation.id
            );
            setConversations([conversation, ...updatedConversations]);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // event handlers
  const handleUserSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchedUsers = users?.filter((user) => user.username.includes(e?.currentTarget.value));
    if (searchedUsers) {
      setSearchedUsers(searchedUsers);
    }
  };
  const handleConversationSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchedConversations = conversations?.filter((convo) => {
      const receiver =
        convo.users &&
        (convo.users[0].username !== currentUser?.username ? convo.users[0] : convo.users[1]);

      return receiver && receiver.username.includes(e?.currentTarget.value);
    });

    if (searchedConversations) {
      setSearchedConversations(searchedConversations);
    }
  };

  const isConnectedUser = (connectedUsers: User[], checkedUser: User): boolean => {
    return connectedUsers.some((user) => user.id === checkedUser.id);
  };

  const showUsersList = (): void => {
    setIsUsersList(true);
    setIsConvoList(false);
  };
  const showConvoList = (): void => {
    setIsUsersList(false);
    setIsConvoList(true);
  };

  return (
    <div className="flex h-[600px] items-start justify-between">
      <aside className="w-[30%] h-[75%]">
        <ScrollArea className="h-full w-full rounded-md border">
          <div className="aside-menu flex p-4 py-2 justify-between items-center">
            <h6
              onClick={showUsersList}
              className={
                'mb-4 font-medium cursor-pointer rounded-lg leading-none p-2 hover:bg-slate-100 ' +
                (isUsersList && 'bg-slate-100')
              }
            >
              Users
            </h6>
            <h6
              onClick={showConvoList}
              className={
                'mb-4 font-medium cursor-pointer rounded-lg leading-none p-2 hover:bg-slate-100 ' +
                (isConvoList && 'bg-slate-100')
              }
            >
              Conversations
            </h6>

            {/* TODO add group chats */}
            {/* <h6
              // onClick={showGroupsList}
              className={"mb-4 font-medium cursor-pointer rounded-lg leading-none p-2 hover:bg-slate-100 " + (false && "bg-slate-100")}
            >
              Groups
            </h6> */}
          </div>
          <Separator />
          {isUsersList && (
            <div className="users-list p-4 ">
              <Input
                onChange={handleUserSearch}
                type="text"
                placeholder="search for a user"
                className="my-4"
              />
              {searchedUsers &&
                searchedUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleCreateOrGetExistingConversation(user.id)}
                    className="cursor-pointer hover:bg-hover py-1"
                  >
                    <div className="flex space-x-2 items-center py-1">
                      <Avatar>
                        <AvatarImage
                          src={
                            validURL(user.avatarUrl || '')
                              ? user.avatarUrl
                              : 'https://github.com/shadcn.png'
                          }
                        />
                      </Avatar>
                      <div className="flex w-full justify-between items-center">
                        <div className="text-sm p-4">{user.username}</div>
                        {isConnectedUser(connectedUsers, user) && (
                          <div className="online-status h-2 w-2 bg-green-500 text-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
            </div>
          )}
          {isConvoList && (
            <div className="conversations-list p-4 ">
              <Input
                onChange={handleConversationSearch}
                type="text"
                placeholder="search for a conversation"
                className="my-4"
              />
              {searchedConversations &&
                searchedConversations.map((convo) => {
                  const receiver =
                    (convo.users &&
                      (convo.users[0].username !== currentUser?.username
                        ? convo.users[0]
                        : convo.users[1])) ||
                    null;
                  return (
                    <ConversationListItemComponent
                      key={convo.id}
                      currentUser={currentUser}
                      conversationId={convo.id}
                      conversations={conversations}
                      setConversations={setConversations}
                      userToken={userToken}
                      receiver={receiver}
                      setReceiverId={setReceiverId}
                      connectedUsers={connectedUsers}
                      isConnectedUser={isConnectedUser}
                      handleCreateOrGetExistingConversation={handleCreateOrGetExistingConversation}
                    />
                  );
                })}
            </div>
          )}
        </ScrollArea>
      </aside>

      <ChatComponent
        userToken={userToken}
        currentUser={currentUser}
        receiverId={receiverId}
        setReceiverId={setReceiverId}
        conversation={conversation}
        setConversation={setConversation}
        isConnectedUser={isConnectedUser}
        connectedUsers={connectedUsers}
        conversations={conversations}
        setConversations={setConversations}
        moveConversationToTop={moveConversationToTop}
      />
    </div>
  );
};

export default MainComponent;
