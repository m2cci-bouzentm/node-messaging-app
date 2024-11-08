/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, Navigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import NotAuthenticatedNav from './components/navComponents/NotAuthenticatedNav';
import SignUpComponent from './components/SignUpComponent';
import LoginComponent from './components/LoginComponent';
import SettingsComponent from './components/SettingsComponent';
import MainComponent from './components/MainComponent';
import AuthenticatedNav from './components/navComponents/AuthenticatedNav';

import { authenticateUserHookParams, User } from './types';

import io, { Socket } from 'socket.io-client';
import { SocketContext } from './context';
import { NotificationsProvider } from '@toolpad/core/useNotifications';

const useSocket = (isLoggedIn: boolean): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    // connect only if user is logged in
    const socket = io(import.meta.env.VITE_API_BASE_URL);
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn]);

  return socket;
};

const useAuthenticateUserOnMount = ({
  setCurrentUser,
  setUserToken,
  setIsLoggedIn
}: authenticateUserHookParams) => {

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (!storedToken) {
      return;
    }

    fetch(import.meta.env.VITE_API_BASE_URL + '/verifyLogin', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error);
          });
        }
        return res.json();
      })
      .then((user) => {
        setCurrentUser(user);
        setUserToken(storedToken);
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.log('An error occurred when verifying user logging...');
        console.log(err);
        localStorage.removeItem('userToken');
      });
  }, []);
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const socket = useSocket(isLoggedIn);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);


  // authenticate user on mount
  useAuthenticateUserOnMount({ setCurrentUser, setUserToken, setIsLoggedIn });

  useEffect(() => {
    if (!socket || !currentUser) {
      return;
    }

    socket?.emit('user-connected', currentUser);
    socket?.on('share-connected-user', (connectedUsers) => {
      setConnectedUsers(connectedUsers);
    });

    window.addEventListener('beforeunload', disconnectUser);

    return () => {
      window.removeEventListener('beforeunload', disconnectUser);
    };
  }, [socket, currentUser, isLoggedIn]);

  const disconnectUser = () => {
    socket?.emit('user-disconnected', currentUser);
  };

  return (
    <SocketContext.Provider value={socket}>
        <Router>
          <NavigationMenu className="min-w-full z-20 relative lg:w-[80%] self-center py-5 px-2 lg:p-10 flex justify-between text-main">
            <NavigationMenuList>
              <NavigationMenuItem className="hidden sm:block md:text-[24px]">
                <Link className="font-bold" to="/">
                  MyChatApp
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>

            <div className="space-x-6 flex not-authenticated">
              {isLoggedIn ? (
                <AuthenticatedNav
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  setIsLoggedIn={setIsLoggedIn}
                />
              ) : (
                <NotAuthenticatedNav />
              )}
            </div>
          </NavigationMenu>

          <NotificationsProvider>
            <main className="w-[100%] md:w-[80%] xl:w-[60%] relative flex flex-col m-auto text-main">
              <Routes>
                {isLoggedIn ? (
                  // authenticated_only_routes
                  <>
                    <Route
                      path="/"
                      element={
                        <MainComponent
                          connectedUsers={connectedUsers}
                          isLoggedIn={isLoggedIn}
                          currentUser={currentUser}
                          userToken={userToken}
                        />
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <SettingsComponent
                          currentUser={currentUser}
                          userToken={userToken}
                          setUserToken={setUserToken}
                          setCurrentUser={setCurrentUser}
                        />
                      }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </>
                ) : (
                  // no_authenticated_routes
                  <>
                    <Route
                      path="/login"
                      element={
                        <LoginComponent
                          setUserToken={setUserToken}
                          setCurrentUser={setCurrentUser}
                          setIsLoggedIn={setIsLoggedIn}
                        />
                      }
                    />
                    <Route
                      path="/signup"
                      element={
                        <SignUpComponent
                          setUserToken={setUserToken}
                          setCurrentUser={setCurrentUser}
                          setIsLoggedIn={setIsLoggedIn}
                        />
                      }
                    />
                    <Route path="*" element={<Navigate to="/login" />} />
                  </>
                )}
              </Routes>
            </main>
          </NotificationsProvider>

          {/* <footer className="py-[100px]"></footer> */}
        </Router>
    </SocketContext.Provider>
  );
}

export default App;
