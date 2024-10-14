import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Message, User } from '@/types';
import { validURL } from '@/helpers';

interface MessageItemProps {
  receiver: User | null;
  message: Message | null;
  currentUser: User | null;
}

const MessageItem = ({ receiver, message, currentUser }: MessageItemProps) => {
  const formatDate = (messageSentOnDate: Date | 0): string => {
    const messageDate = new Date(messageSentOnDate);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    return isToday
      ? messageDate.getHours() + ':' + messageDate.getMinutes().toString().padStart(2, '0')
      : messageDate.toDateString();
  };
  return (
    <>
      {/* receiver's messages */}
      {message?.senderId !== currentUser?.id ? (
        <Card className="message flex flex-col justify-start items-start w-[45%] rounded-xl self-start bg-secondary text-main py-2 px-0">
          <div className="flex">
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
            <CardContent className="w-full pr-2 p-0 self-start">{message?.content}</CardContent>
          </div>

          <CardDescription className="pr-2 text-xs text-main ml-auto">
            {formatDate(message?.sentOn || 0)}
          </CardDescription>
        </Card>
      ) : (
        /* user's messages */
        <Card className="message flex flex-col justify-end  w-[45%] rounded-xl self-end bg-main text-secondary py-2 px-0">
          <div className="flex">
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
          </div>

          <CardDescription className="pl-2 text-xs text-secondary mr-auto">
            {formatDate(message?.sentOn || 0)}
          </CardDescription>
        </Card>
      )}
    </>
  );
};

export default MessageItem;
