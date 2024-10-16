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
  FormEvent,
  FormEventHandler,
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
import CloseIcon from './ui/CloseIcon';
import { Socket } from 'socket.io-client';
import { IoImageOutline } from 'react-icons/io5';

const sendMessageToReceiverInRealTime = (
  message: string,
  receiverId: string,
  currentUser: User,
  conversation: Conversation,
  setConversation: Dispatch<SetStateAction<Conversation | null>>,
  socket: Socket | null
) => {
  const emittedMsg: Message = {
    id: uuid(), // as temp id just for rendering purposes
    senderId: currentUser?.id,
    sender: currentUser,
    receiverId,
    content: message,
    conversationId: conversation.id,
    sentOn: new Date(),
  };

  conversation.messages?.push(emittedMsg);
  setConversation({ ...conversation });

  // emit send message event to the server
  socket?.emit('send-chat-message', emittedMsg, conversation.id);
};

const saveMessage = (
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
  setReceiverId: Dispatch<SetStateAction<string | null>>;
  conversation: Conversation | null;
  setConversation: Dispatch<SetStateAction<Conversation | null>>;
  isConnectedUser: (connectedUsers: User[], user: User) => boolean;
  connectedUsers: User[];
}

const ChatComponent = ({
  userToken,
  currentUser,
  receiverId,
  setReceiverId,
  conversation,
  setConversation,
  isConnectedUser,
  connectedUsers,
}: chatAppProps) => {
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [receiver, setReceiver] = useState<User | null>(null);
  const socket = useContext(SocketContext);

  const scrollAresRef = useRef<HTMLDivElement | null>(null);

  // get conversation and receiver information
  useEffect(() => {
    if (!receiverId) {
      return;
    }

    getReceiver(userToken, receiverId, setReceiver);
  }, [receiverId]);

  // listen to receiving message event
  useEffect(() => {
    if (!conversation) {
      return;
    }

    scrollToLastMsg(scrollAresRef.current);

    // join the room of the conversation whenever it changes
    socket?.emit('join-room', conversation?.id);

    // listen to received messages in real time WHEN mounting AND whenever the conversation changes
    socket?.on('receive-chat-message', (message: Message) => {
      // in case of multiple emitted events for the same msg
      if (conversation.messages?.includes(message)) {
        return;
      }

      conversation.messages?.push(message);
      setConversation({ ...conversation });
      scrollToLastMsg(scrollAresRef.current);
    });
  }, [conversation]);

  const handleMessageSend: ReactEventHandler = () => {
    const message = messageInputRef.current?.value;

    // real time chatting logic AND saving the msg into the db :
    if (userToken && currentUser && receiverId && message && conversation) {
      sendMessageToReceiverInRealTime(
        message,
        receiverId,
        currentUser,
        conversation,
        setConversation,
        socket
      );
      // save the new messages into the db logic :
      saveMessage(userToken, currentUser.id, receiverId, message, conversation.id);
      messageInputRef.current.value = '';

      scrollToLastMsg(scrollAresRef.current);
    }
  };
  const handleCloseChat = (): void => {
    setConversation(null);
    setReceiverId(null);
  };
  const scrollToLastMsg = (scrollAresRef: HTMLDivElement | null): void => {
    setTimeout(() => {
      scrollAresRef?.scrollIntoView(false);
    }, 100);
  };
  const handleImageSend: FormEventHandler = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      console.log(target.files[0]);
    }
  };
  return (
    receiverId && (
      <Card className="w-[60%] h-[90%] transition-all ">
        <CardHeader>
          <div className="flex items-center justify-between">
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
                <CardTitle className="flex items-center space-x-2">
                  <div>@{receiver && receiver.username}</div>
                  {receiver && isConnectedUser(connectedUsers, receiver) && (
                    <div className="online-status h-2 w-2 bg-green-500 text-green-500 rounded-full"></div>
                  )}
                </CardTitle>
                {receiver && isConnectedUser(connectedUsers, receiver) && (
                  <CardDescription className="text-sm"> Online</CardDescription>
                )}
              </div>
            </div>

            <CloseIcon clickEventHandler={handleCloseChat} />
          </div>
        </CardHeader>

        <Separator className="mb-4" />

        {/* TODO send pictures and host them */}
        {/* TODO add remove a conversation from the ui, and the user from this conversation */}
        <ScrollArea className="h-[65%] scrollable">
          <CardContent ref={scrollAresRef} className="space-y-8 text-sm flex flex-col">
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

        <CardFooter className="w-full p-2 lg:p-6 py-4 justify-between items-center z-10">
          <div className="relative flex items-center flex-none">
            <Input
              onInputCapture={handleImageSend}
              accept="image/*,.pdf"
              type="file"
              className="absolute w-10 h-10 z-10 opacity-0 cursor-pointer"
            />
            <IoImageOutline className="text-4xl text-main z-0 absolute" />
          </div>

          <div className="space-x-4 w-[90%] flex items-center ">
            <Input
              ref={messageInputRef}
              onKeyDown={(e) =>
                e.code === 'Enter' || e.code === 'NumpadEnter' ? handleMessageSend(e) : null
              }
              type="text"
              className="z-10 h-12"
              placeholder="Type a message..."
            />
            <Button type="submit" onClick={handleMessageSend}>
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  );
};

export default ChatComponent;
