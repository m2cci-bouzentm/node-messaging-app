import { useEffect, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ChatComponent from './ChatComponent';

const users = [
  { id: 1, username: 'john_doe' },
  { id: 2, username: 'jane_smith' },
  { id: 3, username: 'alice_jones' },
  { id: 4, username: 'bob_brown' },
  { id: 5, username: 'charlie_davis' },
  { id: 6, username: 'diana_evans' },
  { id: 7, username: 'frank_green' },
  { id: 8, username: 'grace_harris' },
  { id: 9, username: 'henry_lee' },
  { id: 10, username: 'irene_martin' },
  { id: 6, username: 'diana_evans' },
  { id: 7, username: 'frank_green' },
  { id: 8, username: 'grace_harris' },
  { id: 9, username: 'henry_lee' },
  { id: 10, username: 'irene_martin' },
  { id: 6, username: 'diana_evans' },
  { id: 7, username: 'frank_green' },
  { id: 8, username: 'grace_harris' },
  { id: 9, username: 'henry_lee' },
  { id: 10, username: 'irene_martin' },
  { id: 7, username: 'frank_green' },
  { id: 8, username: 'grace_harris' },
  { id: 9, username: 'henry_lee' },
  { id: 10, username: 'irene_martin' },
];
const MainComponent = () => {
  return (
    <div className="flex h-[700px] items-start justify-between">
      <aside className="w-[30%] h-full">
        <ScrollArea className="h-full w-full rounded-md border">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-medium leading-none">Friends</h2>
            {users.map((user) => (
              <>
                <div key={user.id} className="text-sm p-4">
                  {user.username}
                </div>
                <Separator  />
              </>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <ChatComponent className={"w-[60%] h-full"} />
    </div>
  );
};

export default MainComponent;
