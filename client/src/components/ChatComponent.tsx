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
import {
  Dispatch,
  ReactEventHandler,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Conversation, Message, User } from '@/types';
import { validURL } from '@/helpers';
import { SocketContext } from '../context';
import { v4 as uuid } from 'uuid';

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
  setConversation: Dispatch<SetStateAction<Conversation | null>>;
}

const ChatComponent = ({
  userToken,
  currentUser,
  receiverId,
  conversation,
  setConversation,
}: chatAppProps) => {
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [receiver, setReceiver] = useState<User | null>(null);
  const socket = useContext(SocketContext);

  // get conversation and receiver information
  useEffect(() => {
    if (!receiverId) {
      return;
    }

    getReceiver(userToken, receiverId, setReceiver);
  }, [receiverId]);

  useEffect(() => {
    if (!conversation) {
      return;
    }
    // join the room of the conversation whenever it changes
    socket?.emit('join-room', conversation?.id);
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation) {
      return;
    }
    // listen to received messages in real time when mounting
    socket?.on('receive-chat-message', (message: Message) => {
      console.log('receive-chat-message');
      conversation.messages?.push(message);
      setConversation({ ...conversation });
    });
  }, [conversation?.id]);

  const handleMessageSend: ReactEventHandler = () => {
    const message = messageInputRef.current?.value;

    // real time chatting logic :
    if (userToken && currentUser && receiverId && message && conversation) {
      const tempMsg: Message = {
        id: uuid(), //as temp id just for rendering purposes
        senderId: currentUser?.id,
        receiverId,
        content: message,
        conversationId: conversation.id,
        sentOn: new Date(),
      };

      conversation.messages?.push(tempMsg);
      setConversation({ ...conversation });

      // emit send message event to the server
      socket?.emit('send-chat-message', tempMsg, conversation.id);
    }

    // save the new messages into the db logic :
    if (userToken && currentUser && receiverId && message && conversation) {
      sendMessage(userToken, currentUser.id, receiverId, message, conversation.id);
      messageInputRef.current.value = '';
    }
  };

  // const handleScrollDown = () => {
  //   console.log(scrollArea?.current);
  //   scrollArea.current?.scrollIntoView();
  // };

  return (
    receiverId && (
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

        {/* TODO scroll to latest messages */}
        {/* TODO add timestamp for messages*/}
        <ScrollArea className="h-[65%] scrollable">
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
    )
  );
};

export default ChatComponent;
