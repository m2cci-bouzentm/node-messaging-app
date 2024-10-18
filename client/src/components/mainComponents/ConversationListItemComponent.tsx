import { ReactEventHandler, SetStateAction, useState } from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { validURL } from '@/helpers';
import { Separator } from '../ui/separator';
import { Conversation, User } from '@/types';
import { Button } from '../ui/button';
import { BsThreeDots } from 'react-icons/bs';

interface ConversationListItemComponentProps {
  currentUser: User | null;
  conversationId: string | null;
  conversations: Conversation[] | null;
  setConversations: React.Dispatch<SetStateAction<Conversation[] | null>>;
  userToken: string | null;
  receiver: User | null;
  setReceiverId: React.Dispatch<SetStateAction<string | null>>;
  connectedUsers: User[];
  isConnectedUser: (connectedUsers: User[], checkedUser: User) => boolean;
  handleCreateOrGetExistingConversation: (receiverId: string) => void;
}

const ConversationListItemComponent = ({
  currentUser,
  conversationId,
  conversations,
  setConversations,
  userToken,
  receiver,
  setReceiverId,
  connectedUsers,
  isConnectedUser,
  handleCreateOrGetExistingConversation,
}: ConversationListItemComponentProps) => {
  const [isConversationSettings, setIsConversationSettings] = useState<boolean>(false);

  const openConversationSettings: ReactEventHandler = (e): void => {
    e.preventDefault();
    setIsConversationSettings(!isConversationSettings);
  };
  const handleConversationDelete: ReactEventHandler = (e): void => {
    e.stopPropagation();

    if (!conversationId || !currentUser) {
      return;
    }

    setIsConversationSettings(false);
    fetch(import.meta.env.VITE_API_BASE_URL + '/conversation/twoUsers', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'Application/json',
      },
      body: JSON.stringify({ conversationId, userId: currentUser?.id }),
    })
      .then((res) => res.json())
      .then((conversation) => {
        if (conversations) {
          const updatedConversations = conversations.filter((conv) => conv.id !== conversation.id);
          setConversations(updatedConversations);
          setReceiverId(null);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div 
      onContextMenu={openConversationSettings}
      className="flex space-x-2 items-center">
        <div
          // onContextMenu={openConversationSettings}
          onClick={() => receiver && handleCreateOrGetExistingConversation(receiver.id)}
          className="cursor-pointer w-full relative hover:bg-hover py-1"
        >
          <div className="flex w-full space-x-2 relative z-0 items-center py-1">
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
              <div className="text-sm w-full p-4">{receiver && receiver.username}</div>
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
        </div>

        <BsThreeDots
          onClick={openConversationSettings}
          className="cursor-pointer z-20 hover:scale-110 transition-all"
        />
      </div>


      <Separator />
    </>
  );
};

export default ConversationListItemComponent;
