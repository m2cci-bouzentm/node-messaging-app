import { Button } from '@/components/ui/button';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IoIosAdd } from 'react-icons/io';
import GroupMultipleSelect from '../mainComponents/GroupMultipleSelect';
import { TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { User } from '@/types';
import { PopoverClose } from '@radix-ui/react-popover';

interface AddGroupPopOverComponentProps {
  users: User[] | null;
  userToken: string | null;
}
const AddGroupPopOverComponent = ({ users, userToken }: AddGroupPopOverComponentProps) => {
  const [usersNarrowedSearch, setUsersNarrowedSearch] = useState<User[] | null>(null);

  const groupNameRef = useRef<HTMLDivElement | null>(null);
  const usersNarrowSearchRef = useRef<HTMLDivElement | null>(null);
  const usersSelectRef = useRef<HTMLDivElement | null>(null);
  const closePopOverRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setUsersNarrowedSearch(users);
  }, []);

  const handleCreateGroup = (): void => {
    const groupNameInput = groupNameRef?.current?.lastChild?.firstChild as HTMLInputElement;
    const usersSelect = usersSelectRef.current?.children[1] as HTMLInputElement;

    const groupName = groupNameInput?.value;
    const usersIds = usersSelect?.value.split(',');

    if (usersIds.length < 2 || groupName.trim().length === 0) {
      //TODO show popover error message: 'To create a group you must add at least two users to a conversation'
      return;
    }

    // query the api
    fetch(`${import.meta.env.VITE_API_BASE_URL}/conversation/groups`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: groupName, usersIds }),
    })
      .then((res) => res.json())
      .then((group) => {
        console.log(group);
        closePopOverRef?.current?.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleUsersSearch = (): void => {
    const usersNarrowSearch = usersNarrowSearchRef?.current?.lastChild
      ?.firstChild as HTMLInputElement;
    if (users) {
      const res = users?.filter((user) => user.username.includes(usersNarrowSearch?.value));
      setUsersNarrowedSearch(res);
    }
  };
  return (
    <Popover>
      <PopoverTrigger className="text-xl">
        <IoIosAdd />
      </PopoverTrigger>
      <PopoverContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Create a Group</h4>
        </div>

        <div className="w-full flex flex-col items-start justify-center space-y-2 !text-sm">
          <TextField
            className="w-full"
            id="groupName"
            label="Groupe Name"
            variant="outlined"
            ref={groupNameRef}
          />
          <TextField
            className="w-full"
            id="searchedUsers"
            label="Narrow search result"
            variant="outlined"
            ref={usersNarrowSearchRef}
            onChange={handleUsersSearch}
          />
          <GroupMultipleSelect users={usersNarrowedSearch} usersSelectRef={usersSelectRef} />
        </div>

        <Button onClick={handleCreateGroup}> Create </Button>
      </PopoverContent>

      <PopoverClose asChild className="hidden">
        <button ref={closePopOverRef}></button>
      </PopoverClose>
    </Popover>
  );
};

export default AddGroupPopOverComponent;
