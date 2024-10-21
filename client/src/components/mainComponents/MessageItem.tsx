import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { validURL, formatDate } from '@/helpers';
import { MessageItemProps } from './types';

const MessageItem = ({ message, currentUser }: MessageItemProps) => {
  return (
    <>
      {/* receiver's messages */}
      {message?.senderId !== currentUser?.id ? (
        <div className="flex justify-start">
          <div className="avatar self-end md:p-2 pt-0">
            <Avatar>
              <AvatarImage
                src={
                  validURL(message?.sender?.avatarUrl || '')
                    ? message?.sender?.avatarUrl
                    : 'https://github.com/shadcn.png'
                }
              />
            </Avatar>
          </div>
          <Card className="message w-[65%] sm:w-[45%] space-y-2 flex flex-col justify-start items-start !rounded-bl-none rounded-xl bg-secondary text-main py-2 mb-8 min-w-max">
            <CardContent className="w-full px-4 py-0 self-start">
              {message && validURL(message?.content) ? (
                <img src={message?.content} alt="img" className="w-[220px] sm:w-[300px]" />
              ) : (
                message?.content
              )}
            </CardContent>
            <CardDescription className="pr-2 mt-auto text-xs text-main ml-auto">
              {message?.sender?.username} {'• ' + formatDate(message?.sentOn || 0)}
            </CardDescription>
          </Card>
        </div>
      ) : (
        /* user's messages */
        <div className="flex justify-end">
          <Card className="message ml-auto w-[65%] sm:w-[45%] space-y-2 flex flex-col justify-start !rounded-br-none rounded-xl bg-main text-secondary py-2 mb-8 min-w-max">
            <CardContent className="w-full px-4 py-0 relative self-start">
              {message && validURL(message?.content) ? (
                <img src={message?.content} alt="img" className="w-[220px] sm:w-[300px]" />
              ) : (
                message?.content
              )}
            </CardContent>
            <CardDescription className="pr-2 ml-auto mr-0 text-xs text-secondary">
              {formatDate(message?.sentOn || 0)}
            </CardDescription>
          </Card>

          <div className="avatar md:p-2 pt-0 self-end">
            <Avatar>
              <AvatarImage
                src={
                  validURL(currentUser?.avatarUrl || '')
                    ? currentUser?.avatarUrl
                    : 'https://github.com/shadcn.png'
                }
              />
            </Avatar>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageItem;
