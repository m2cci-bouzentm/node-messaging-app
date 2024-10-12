import {
  Card,
  CardContent,
   CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface MessageItemProps {
  messageText: string;
  id: number;
}

const MessageItem = ({ messageText, id }: MessageItemProps) => {
  return (
    <>
      {id % 2 === 0 ? (
        <Card className="flex justify-start items-start w-[45%] rounded-xl self-start bg-secondary py-2 px-0">
          <CardHeader className='flex items-center p-4 pt-0'>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
            </Avatar>
          </CardHeader>
          <CardContent className='w-full p-0 pr-2 self-start' >{messageText}</CardContent>
        </Card>
      ) : (
        <Card className="flex justify-end items-center w-[45%] rounded-xl self-end bg-main text-secondary py-2 px-0">
          <CardContent className='w-full p-0 pl-4 self-start' dangerouslySetInnerHTML={{ __html: messageText }}></CardContent>
          <CardFooter className='p-4 pt-0'>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
            </Avatar>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default MessageItem;
