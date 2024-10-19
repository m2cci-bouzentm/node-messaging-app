import { ReactEventHandler, SetStateAction } from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Conversation, User } from '@/types';
import { Button } from '../ui/button';
import { BsThreeDots } from 'react-icons/bs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface GroupListItemComponentProps {
  currentUser: User | null;
  handleGetGroup: (group: Conversation) => void;
  group: Conversation | null;
  groups: Conversation[] | null;
  setGroups: React.Dispatch<SetStateAction<Conversation[] | null>>;
  userToken: string | null;
  setReceiverId: React.Dispatch<SetStateAction<string | null>>;
}

const GroupListItemComponent = ({
  currentUser,
  handleGetGroup,
  group,
  groups,
  setGroups,
  userToken,
  setReceiverId,
}: GroupListItemComponentProps) => {


  
  const handleGroupQuit: ReactEventHandler = (e): void => {
    e.stopPropagation();

    if (!group || !currentUser) {
      return;
    }

    fetch(import.meta.env.VITE_API_BASE_URL + '/conversation/groups', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'Application/json',
      },
      body: JSON.stringify({ groupId: group?.id, userId: currentUser?.id }),
    })
      .then((res) => res.json())
      .then((group) => {
        if (groups) {
          const restOfGroups = groups?.filter((g) => g.id !== group.id);
          setGroups(restOfGroups);
          setReceiverId(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="flex space-x-2 items-center py-1">
        <div
          onClick={() => group && handleGetGroup(group)}
          className="flex w-full space-x-2 items-center cursor-pointer  hover:bg-hover py-1"
        >
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
          </Avatar>
          <div className="text-sm w-full p-4">{group?.name}</div>
        </div>

        <Popover>
          <PopoverTrigger>
            <BsThreeDots className="cursor-pointer z-20 hover:scale-110 transition-all" />
          </PopoverTrigger>
          <PopoverContent className="w-max">
            <Button
              onClick={handleGroupQuit}
              variant="destructive"
              className="setting-menu m-auto mb-1 text-sm rounded-lg"
            >
              Quit
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />
    </>
  );
};

export default GroupListItemComponent;
