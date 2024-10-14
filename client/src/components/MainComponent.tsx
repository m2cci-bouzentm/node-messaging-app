import { ReactEventHandler, useEffect, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ChatComponent from './ChatComponent';
import { Conversation, User } from '@/types';
import { Input } from './ui/input';
import { Avatar, AvatarImage } from './ui/avatar';
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
  const users = useUsers(isLoggedIn, userToken);
  const [searchedUsers, setSearchedUsers] = useState<User[] | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    setSearchedUsers(users);
  }, [users]);

  const handleUserSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchedUsers = users?.filter((user) => user.username.includes(e?.currentTarget.value));
    if (searchedUsers) {
      setSearchedUsers(searchedUsers);
    }
  };

  // create conversation OR gets an existing one
  const handleCreateConversation = (receiverId: string) => {
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
        console.log(conversation);
        setConversation(conversation);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const isConnectedUser = (connectedUsers: User[], checkedUser: User): boolean => {
    return connectedUsers.some((user) => user.id === checkedUser.id);
  };
  return (
    <div className="flex h-[600px] items-start justify-between">
      {/* TODO add old conversations list */}
      <aside className="w-[30%] h-[75%]">
        <ScrollArea className="h-full w-full rounded-md border">
          <div className="users-list p-4">
            <h2 className="mb-4 text-lg font-medium leading-none">Users</h2>
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
                  onClick={() => handleCreateConversation(user.id)}
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
        </ScrollArea>
      </aside>

      <ChatComponent
        userToken={userToken}
        currentUser={currentUser}
        receiverId={receiverId}
        conversation={conversation}
        setConversation={setConversation}
        isConnectedUser={isConnectedUser}
        connectedUsers={connectedUsers}
      />
    </div>
  );
};

export default MainComponent;
