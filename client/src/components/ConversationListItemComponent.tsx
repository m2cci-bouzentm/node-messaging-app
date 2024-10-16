import { ReactEventHandler, useState } from 'react';
import { Avatar, AvatarImage } from './ui/avatar';
import { validURL } from '@/helpers';
import { Separator } from './ui/separator';
import {  User } from '@/types';
import { Button } from './ui/button';

interface ConversationListItemComponentProps {
  receiver: User | null;
  connectedUsers: User[];
  isConnectedUser: (connectedUsers: User[], checkedUser: User) => boolean;
  handleCreateOrGetExistingConversation: (receiverId: string) => void;
}

const ConversationListItemComponent = ({
  receiver,
  connectedUsers,
  isConnectedUser,
  handleCreateOrGetExistingConversation,
}: ConversationListItemComponentProps) => {
  const [isConversationSettings, setIsConversationSettings] = useState<boolean>(false);

  const openConversationSettings: ReactEventHandler = (e): void => {
    e.preventDefault();
    setIsConversationSettings(!isConversationSettings);
  };
  const handleConversationDelete: ReactEventHandler = (e) => {
    e.stopPropagation();
    setIsConversationSettings(false);
  };

  return (
    <div
      onContextMenu={openConversationSettings}
      onClick={() => receiver && handleCreateOrGetExistingConversation(receiver.id)}
      className="cursor-pointer relative hover:bg-hover py-1"
    >
      <div className="flex space-x-2 relative z-0 items-center py-1">
        <Avatar>
          <AvatarImage
            src={
              receiver && validURL(receiver.avatarUrl || '')
                ? receiver.avatarUrl
                : 'https://github.com/shadcn.png'
            }
          />
        </Avatar>
        <div className="flex w-full justify-between items-center">
          <div className="text-sm p-4">{receiver && receiver.username}</div>
          {receiver && isConnectedUser(connectedUsers, receiver) && (
            <div className="online-status h-2 w-2 bg-green-500 text-green-500 rounded-full"></div>
          )}
        </div>
      </div>

      {isConversationSettings && (
        <div className="w-full flex items-center">
          <Button
            onClick={handleConversationDelete}
            variant="destructive"
            className="setting-menu m-auto mb-1 text-sm rounded-lg"
          >
            Delete
          </Button>
        </div>
      )}

      <Separator />
    </div>
  );
};

export default ConversationListItemComponent;
