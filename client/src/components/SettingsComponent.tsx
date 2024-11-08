import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';
import {  SettingsComponentProps } from './types';
import {  validationError } from '@/types';
import { validURL } from '@/helpers';


const SettingsComponent = ({
  currentUser,
  userToken,
  setCurrentUser,
  setUserToken,
}: SettingsComponentProps) => {
  const form = useForm();

  const [usernameError, setUsernameError] = useState<validationError | null>(null);
  const [emailError, setEmailError] = useState<validationError | null>(null);
  const [passwordError, setPasswordError] = useState<validationError | null>(null);
  const [avatarUrlError, setAvatarUrlError] = useState<validationError | null>(null);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<HTMLInputElement>(null);

  const handleUsernameChange = async () => {
    const username = usernameRef?.current?.value;
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/settings/username', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        id: currentUser?.id,
        username,
      }),
    });
    const data = await res.json();

    if (typeof data.errors !== 'undefined') {
      return setUsernameError(data.errors[0]);
    }

    if (usernameRef.current) {
      usernameRef.current.value = '';
    }

    setUsernameError(null);
    setCurrentUser(data.userWithoutPw);
    setUserToken(data.token);
    localStorage.setItem('userToken', data.token);
  };

  const handleEmailChange = async () => {
    const email = emailRef?.current?.value;
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/settings/email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        id: currentUser?.id,
        email,
      }),
    });
    const data = await res.json();

    if (typeof data.errors !== 'undefined') {
      return setEmailError(data.errors[0]);
    }

    if (emailRef.current) {
      emailRef.current.value = '';
    }

    setEmailError(null);
    setCurrentUser(data.userWithoutPw);
    setUserToken(data.token);
    localStorage.setItem('userToken', data.token);
  };

  const handlePasswordChange = async () => {
    const password = passwordRef?.current?.value;
    const passwordConfirmation = passwordConfirmationRef?.current?.value;
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/settings/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        id: currentUser?.id,
        password,
        passwordConfirmation,
      }),
    });
    const data = await res.json();

    if (typeof data.errors !== 'undefined') {
      return setPasswordError(data.errors[0]);
    }

    if (passwordRef.current && passwordConfirmationRef.current) {
      passwordRef.current.value = '';
      passwordConfirmationRef.current.value = '';
    }

    setPasswordError(null);
    setCurrentUser(data.userWithoutPw);
    setUserToken(data.token);
    localStorage.setItem('userToken', data.token);
  };

  const handleAvatarUrlChange = async () => {
    const avatarUrl = avatarUrlRef?.current?.value;

    if (avatarUrl && !validURL(avatarUrl)) {
      return setEmailError({ msg: 'Not valid url' });
    }

    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/settings/avatarUrl', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        id: currentUser?.id,
        avatarUrl,
      }),
    });
    const data = await res.json();

    if (typeof data.errors !== 'undefined' || !res.ok) {
      return setAvatarUrlError(data.errors[0]);
    }

    if (avatarUrlRef.current) {
      avatarUrlRef.current.value = '';
    }

    setAvatarUrlError(null);
    setCurrentUser(data.userWithoutPw);
    setUserToken(data.token);
    localStorage.setItem('userToken', data.token);
  };
  return (
    <div className="w-[70%] m-auto">
      <Form {...form}>
        <h1 className="font-bold text-4xl ">Settings</h1>
        <div className="settings-container space-y-12 w-[70%] m-auto">
          <div className="settings-section space-y-6">
            <h2 className="font-semibold text-xl">Change Username</h2>
            <FormItem>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input id="username" type="text" name="username" ref={usernameRef} />
            </FormItem>
            {usernameError && <FormMessage>{usernameError.msg}</FormMessage>}
            <Button onClick={handleUsernameChange} className="w-full">
              Save Change
            </Button>
          </div>
          <hr />
          <div className="settings-section space-y-6">
            <h2 className="font-semibold text-xl">Change Email</h2>
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input id="email" type="text" name="email" ref={emailRef} />
            </FormItem>
            {emailError && <FormMessage>{emailError.msg}</FormMessage>}
            <Button onClick={handleEmailChange} className="w-full">
              Save Change
            </Button>
          </div>
          <hr />
          <div className="settings-section space-y-6">
            <h2 className="font-semibold text-xl">Change Password</h2>
            <FormItem>
              <FormLabel htmlFor="password">New Password</FormLabel>
              <Input id="password" type="password" name="password" ref={passwordRef} />
            </FormItem>
            <FormItem>
              <FormLabel htmlFor="passwordConfirmation">Confirm New Password</FormLabel>
              <Input
                id="passwordConfirmation"
                type="password"
                name="passwordConfirmation"
                ref={passwordConfirmationRef}
              />
            </FormItem>
            {passwordError && <FormMessage>{passwordError.msg}</FormMessage>}
            <Button onClick={handlePasswordChange} className="w-full">
              Save Change
            </Button>
          </div>
          <hr />
          <div className="settings-section space-y-6">
            <h2 className="font-semibold text-xl">Change Avatar</h2>
            <FormItem>
              <FormLabel htmlFor="avatarUrl">Avatar URL</FormLabel>
              <Input id="avatarUrl" type="text" name="avatarUrl" ref={avatarUrlRef} />
            </FormItem>
            {avatarUrlError && <FormMessage>{avatarUrlError.msg}</FormMessage>}
            <Button onClick={handleAvatarUrlChange} className="w-full">
              Save Change
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default SettingsComponent;
