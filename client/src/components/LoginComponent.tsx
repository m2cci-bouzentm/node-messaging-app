import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginComponentProps } from './types';
 
interface LogInError {
  message: string;
}

const LoginComponent = ({ setUserToken, setCurrentUser, setIsLoggedIn }: LoginComponentProps) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [logInError, setLogInError] = useState<LogInError | null>(null);

  const navigate = useNavigate();
  const form = useForm();

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const logInRes = await res.json();
    
    // LogIn errors display
    if (typeof logInRes.message !== 'undefined') {
      return setLogInError(logInRes);
    }

    localStorage.setItem('userToken', logInRes.token);
    setUserToken(logInRes.token);
    setLogInError(null);
    setCurrentUser(logInRes.user);
    setIsLoggedIn(true);
    navigate('/');
  };
  return (
    <div className='w-[80%] m-auto'>
      <Form {...form}>
        <form onSubmit={handleUserLogin} className="space-y-8 w-[50%] m-auto">
          <FormItem>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input placeholder="" id="username" type="text" name="username" ref={usernameRef} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input placeholder="" id="password" type="password" name="password" ref={passwordRef} />
          </FormItem>
          {logInError && <FormMessage className="!m-0"> {logInError.message} </FormMessage>}
          <Button type="submit">Sign In</Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginComponent;
