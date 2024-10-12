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

const messages = [
  { id: 1, text: "What are you up to today? What are you up to today? What are you up to today? Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates, odio eligendi reiciendis aut minima deleniti ipsum tempore quidem enim numquam. Hello, how are you? <br />  I am good, thank you! How about you?" },
  { id: 2, text: 'I am good, thank you! How about you?' },
  { id: 3, text: 'I am doing well, thanks for asking! Hello, how are you? <br />  I am good, thank you! How about you?' },
  { id: 4, text: 'What are you up to today? What are you up to today? What are you up to today? Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates, odio eligendi reiciendis aut minima deleniti ipsum tempore quidem enim numquam' },
  { id: 5, text: 'Just working on some projects. You?' },
  { id: 6, text: 'Same here, trying to finish some tasks.' },
  { id: 7, text: 'Do you have any plans for the weekend?' },
  { id: 8, text: 'Not yet, maybe just relax and watch some movies.' },
  { id: 9, text: 'That sounds nice. Any movie recommendations?' },
  { id: 10, text: 'I heard the new sci-fi movie is really good.' },
  { id: 11, text: 'Great, I will check it out. Thanks!' },
  { id: 12, text: 'No problem! Have a great day!' },
];

interface chatAppProps{
  className: string;
}

const ChatComponent = ({className}: chatAppProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
          </Avatar>
          <div>
            <CardTitle>@user_2024</CardTitle>
            <CardDescription className='text-sm'> Online</CardDescription>
          </div>

        </div>
      </CardHeader>

      <Separator className="mb-4" />

      <ScrollArea className="h-[75%]">
        <CardContent className="space-y-8 text-sm flex flex-col">
          {messages.map((message) => (
            <MessageItem key={message.id} messageText={message.text} id={message.id} />
          ))}
        </CardContent>
      </ScrollArea>

      <CardFooter className="space-x-4 z-10">
        <Input type="message" className='z-10' placeholder="Type a message..." />
        <Button> Send </Button>
      </CardFooter>
    </Card>
  );
};

export default ChatComponent;
