import { Button } from '@/components/ui/button';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IoIosAdd } from 'react-icons/io';
import GroupMultipleSelect from '../mainComponents/GroupMultipleSelect';
import { TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { User, validationError } from '@/types';
import { PopoverClose } from '@radix-ui/react-popover';
import { AddGroupPopOverComponentProps } from './types';

const AddGroupPopOverComponent = ({
  users,
  userToken,
  groups,
  setGroups,
}: AddGroupPopOverComponentProps) => {
  const [usersNarrowedSearch, setUsersNarrowedSearch] = useState<User[] | null>(null);
  const [groupCreationError, setGroupCreationError] = useState<validationError | null>(null);

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
    console.log(usersIds);


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
        if (typeof group.errors !== 'undefined') {
          return setGroupCreationError(group.errors[0]);
        }
        if (groups) {
          setGroups([group, ...groups]);
        }
        closePopOverRef?.current?.click();
      })
      .catch((err) => {
        console.log(err);
      });

    setGroupCreationError(null);
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

        {groupCreationError && (
          <p className="text-[0.8rem] font-medium text-red-500 dark:text-red-900">
            {groupCreationError.msg}
          </p>
        )}

        <Button onClick={handleCreateGroup}> Create </Button>
      </PopoverContent>

      <PopoverClose asChild className="hidden">
        <button ref={closePopOverRef}></button>
      </PopoverClose>
    </Popover>
  );
};

export default AddGroupPopOverComponent;
