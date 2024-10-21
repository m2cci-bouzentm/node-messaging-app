/* eslint-disable react-hooks/exhaustive-deps */
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
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
import CloseIcon from '../ui/CloseIcon';
import { IoImageOutline } from 'react-icons/io5';

import MessageItem from './MessageItem';

import { SocketContext } from '../../context';
import { Socket } from 'socket.io-client';

import { Conversation, Message, User } from '@/types';
import { validURL } from '@/helpers';
import { v4 as uuid } from 'uuid';
import { chatComponentProps, SaveMessageParams } from './types';



const saveMessage = ({
  userToken,
  senderId,
  receiversIds,
  receiverId,
  message,
  conversationId,
}: SaveMessageParams): void => {
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
      receiversIds,
      conversationId,
    }),
  })
    .then((res) => res.json())
    .then((message) => {
      console.log('message', message);
    })
    .catch((err) => {
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

const ChatComponent = ({
  userToken,
  currentUser,
  receiverId,
  setReceiverId,
  conversation,
  setConversation,
  isConnectedUser,
  connectedUsers,
  conversations,
  setConversations,
  moveConversationToTop,
  groups,
  setGroups,
}: chatComponentProps) => {
  const messageInputRef = useRef<HTMLInputElement>(null);
  const scrollAresRef = useRef<HTMLDivElement | null>(null);

  const [receiver, setReceiver] = useState<User | null>(null);
  const socket = useContext(SocketContext);

  // get conversation and receiver information
  useEffect(() => {
    if (!receiverId) {
      return;
    }

    getReceiver(userToken, receiverId, setReceiver);

    messageInputRef.current!.value = '';
    // messageInputRef.current?.focus();
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

    return () => {
      socket?.removeAllListeners('receive-chat-message');
    };
  }, [conversation]);

  const sendMessageToReceiverInRealTime = (
    messageContent: string,
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
      receivers: conversation.users, // in case of a group chat
      content: messageContent,
      conversationId: conversation.id,
      sentOn: new Date(),
    };

    conversation.messages?.push(emittedMsg);
    setConversation({ ...conversation });

    // move current conversation/group to the top of the list
    const receivers = conversation.users?.filter((u) => u.id !== currentUser.id);
    const receiversIds = receivers?.map((u) => u.id);
    let currentConversation: Conversation | null;
    if (receiversIds && receiversIds.length > 1) {
      currentConversation = groups?.find((grp) => grp.id === emittedMsg.conversationId) || null;
      setGroups(moveConversationToTop(groups, currentConversation));
    } else {
      currentConversation = conversations?.find((conv) => conv.id === emittedMsg.conversationId) || null;
      setConversations(moveConversationToTop(conversations, currentConversation));
    }

    // emit send message event to the server
    socket?.emit('send-chat-message', emittedMsg, conversation);
  };

  // events handlers
  const handleMessageSend: ReactEventHandler = () => {
    const message = messageInputRef.current?.value;
    
    // real time chatting logic AND saving the msg into the db :
    if (userToken && currentUser && receiverId && message && conversation) {
      sendMessageToReceiverInRealTime(
        message,
        receiverId, // here the receiverId represent the groupId in case of a group
        currentUser,
        conversation,
        setConversation,
        socket
      );

      // save the new messages into the db :
      const receivers = conversation.users?.filter((u) => u.id !== currentUser.id);
      const receiversIds = receivers?.map((u) => u.id);

      if (receiversIds && receiversIds.length > 1) {
        // in case of a group with multiple receivers
        saveMessage({
          userToken,
          senderId: currentUser.id,
          receiversIds,
          receiverId: null,
          message,
          conversationId: conversation.id,
        });
      } else {
        saveMessage({
          userToken,
          senderId: currentUser.id,
          receiversIds: null,
          receiverId,
          message,
          conversationId: conversation.id,
        });
      }
      messageInputRef.current.value = '';
    }
  };
  const handleImageSend: FormEventHandler = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    if (userToken && currentUser && receiverId && conversation) {
      if (!target.files) return;
      const file = target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('receiverId', receiverId);
      formData.append('conversationId', conversation.id);

      const receivers = conversation.users?.filter((u) => u.id !== currentUser.id);
      const receiversIds = receivers?.map((u) => u.id);
      formData.append('receiversIds', JSON.stringify(receiversIds));

      // send file to the server to upload it THEN send it as a message
      fetch(import.meta.env.VITE_API_BASE_URL + '/users/message/uploadFile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((message) => {
          sendMessageToReceiverInRealTime(
            message.content,
            receiverId,
            currentUser,
            conversation,
            setConversation,
            socket
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const handleCloseChat = (): void => {
    setConversation(null);
    setReceiverId(null);
  };
  const scrollToLastMsg = (scrollAresRef: HTMLDivElement | null): void => {
    setTimeout(() => {
      scrollAresRef?.scrollIntoView(false);
    }, 0);
  };
  return (
    receiverId && (
      <Card className="h-[105%] w-full absolute z-10 md:h-[90%] md:w-[60%] md:relative transition-all ">
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
                  {/* if its a group chat then use its name rather than a receiver name which will be undefined */}
                  <div>@{receiver ? receiver.username : conversation?.name}</div>
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

        <ScrollArea className="h-[65%] scrollable">
          <CardContent ref={scrollAresRef} className="space-y-6 px-1 sm:p-6 md:space-y-8 text-sm flex flex-col">
            {conversation?.messages?.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUser={currentUser}
              />
            ))}
          </CardContent>
        </ScrollArea>

        <CardFooter className="w-full p-2 px-4 sm:p-2 lg:p-6 py-4 justify-between items-center z-10">
          <div className="relative flex items-center flex-none">
            <Input
              onInputCapture={handleImageSend}
              accept="image/*,.pdf"
              type="file"
              className="absolute w-10 sm:h-10 z-10 opacity-0 cursor-pointer"
            />
            <IoImageOutline className="text-4xl text-main z-0 absolute" />
          </div>

          <div className="space-x-2 sm:space-x-4 w-[80%] sm:w-[90%] flex sm:justify-end items-center ">
            <Input
              ref={messageInputRef}
              onKeyDown={(e) =>
                e.code === 'Enter' || e.code === 'NumpadEnter' ? handleMessageSend(e) : null
              }
              type="text"
              className="z-10 sm:h-12"
              placeholder="Type a message..."
            />
            <Button type="submit" className='px-3 sm:px-4' onClick={handleMessageSend}>
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  );
};

export default ChatComponent;
