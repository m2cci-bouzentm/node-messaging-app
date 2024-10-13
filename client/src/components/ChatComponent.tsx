import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import MessageItem from './MessageItem';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactEventHandler, useEffect, useRef, useState } from 'react';
import { Conversation, Message, User } from '@/types';
import { validURL } from '@/helpers';

const sendMessage = (
  userToken: string,
  senderId: string,
  receiverId: string,
  message: string,
  conversationId: string
): void => {
  fetch(`${import.meta.env.VITE_API_BASE_URL}/users/message/:${senderId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'Application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      content: message,
      senderId,
      receiverId,
      conversationId,
    }),
  }).catch((err) => {
    console.log(err);
  });
};
const getReceiver = (
  userToken: string | null,
  receiverId: string,
  setReceiver: (user: User | null) => void
): void => {
  fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${receiverId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then((res) => res.json())
    .then((user) => {
      setReceiver(user);
    })
    .catch((err) => {
      console.log(err);
    });
};

interface chatAppProps {
  userToken: string | null;
  currentUser: User | null;
  receiverId: string | null;
  conversation: Conversation | null;
}

const ChatComponent = ({ userToken, currentUser, receiverId, conversation }: chatAppProps) => {
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [receiver, setReceiver] = useState<User | null>(null);

  // get conversation and receiver information
  useEffect(() => {
    if (!receiverId) {
      return;
    }
    getReceiver(userToken, receiverId, setReceiver);
  }, [receiverId]);

  const handleMessageSend: ReactEventHandler = () => {
    const message = messageInputRef.current?.value;

    if (userToken && currentUser && receiverId && message && conversation) {
      sendMessage(userToken, currentUser.id, receiverId, message, conversation.id);
      messageInputRef.current.value = '';
    }
  };
  return (
    <Card className="w-[60%] h-[90%]">
      <CardHeader>
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage
              src={
                validURL(receiver?.avatarUrl || '')
                  ? receiver?.avatarUrl
                  : 'https://github.com/shadcn.png'
              }
            />
          </Avatar>
          <div>
            <CardTitle>@{receiver && receiver.username}</CardTitle>

            {/* TODO online status */}
            <CardDescription className="text-sm"> Online</CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator className="mb-4" />

      <ScrollArea className="h-[65%]">
        <CardContent className="space-y-8 text-sm flex flex-col">
          {conversation?.messages?.map((message) => (
            <MessageItem
              key={message.id}
              receiver={receiver}
              message={message}
              currentUser={currentUser}
            />
          ))}
        </CardContent>
      </ScrollArea>

      <CardFooter className="space-x-4 py-4 z-10">
        <Input
          ref={messageInputRef}
          type="message"
          className="z-10 h-12"
          placeholder="Type a message..."
        />
        <Button onClick={handleMessageSend}> Send </Button>
      </CardFooter>
    </Card>
  );
};

export default ChatComponent;
