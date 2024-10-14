import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Message, User } from '@/types';
import { validURL } from '@/helpers';

interface MessageItemProps {
  receiver: User | null;
  message: Message | null;
  currentUser: User | null;
}

const MessageItem = ({ receiver, message, currentUser }: MessageItemProps) => {
  return (
    <>
      {/* receiver's messages */}
      {message?.senderId !== currentUser?.id ? (
        <Card className="message flex justify-start items-start w-[45%] rounded-xl self-start bg-secondary py-2 px-0">
          <CardHeader className="flex items-center p-2 pt-0">
            <Avatar>
              <AvatarImage
                src={
                  validURL(receiver?.avatarUrl || '')
                    ? receiver?.avatarUrl
                    : 'https://github.com/shadcn.png'
                }
              />
            </Avatar>
          </CardHeader>
          <CardContent className="w-full p-0 pr-2 self-start">{message?.content}</CardContent>
        </Card>
      ) : (
        /* user's messages */
        <Card className="message flex justify-end items-center w-[45%] rounded-xl self-end bg-main text-secondary py-2 px-0">
          <CardContent className="w-full p-0 pl-4 self-start">{message?.content}</CardContent>
          <CardFooter className="p-4 pt-0">
            <Avatar>
              <AvatarImage
                src={
                  validURL(currentUser?.avatarUrl || '')
                    ? currentUser?.avatarUrl
                    : 'https://github.com/shadcn.png'
                }
              />
            </Avatar>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default MessageItem;
