import { ReactEventHandler, SetStateAction } from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { validURL } from '@/helpers';
import { Separator } from '../ui/separator';
import { Conversation, User } from '@/types';
import { Button } from '../ui/button';
import { BsThreeDots } from 'react-icons/bs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

  const handleConversationDelete: ReactEventHandler = (e): void => {
    e.stopPropagation();

    if (!conversationId || !currentUser) {
      return;
    }

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
      <div className="flex space-x-2 items-center py-1">
        <div
          onClick={() => receiver && handleCreateOrGetExistingConversation(receiver.id)}
          className="flex w-full space-x-2 items-center cursor-pointer  hover:bg-hover py-1"
        >
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

        <Popover>
          <PopoverTrigger>
            <BsThreeDots className="cursor-pointer z-20 hover:scale-110 transition-all" />
          </PopoverTrigger>
          <PopoverContent className="w-max">
            <Button
              onClick={handleConversationDelete}
              variant="destructive"
              className="setting-menu m-auto mb-1 text-sm rounded-lg"
            >
              Delete
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />
    </>
  );
};

export default ConversationListItemComponent;
