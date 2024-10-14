import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, Navigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import NotAuthenticatedNav from './components/NotAuthenticatedNav';
import SignUpComponent from './components/SignUpComponent';
import LoginComponent from './components/LoginComponent';
import SettingsComponent from './components/SettingsComponent';
import MainComponent from './components/MainComponent';
import AuthenticatedNav from './components/AuthenticatedNav';

import { User } from './types';

import io, { Socket } from 'socket.io-client';
import { SocketContext } from './context';

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const socket = useSocket(isLoggedIn);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);

  //TODO will be an useAuthentication hook
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
      .then((res) => res.json())
      .then((user) => {
        setCurrentUser(user);
        setUserToken(storedToken);
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.log('An error occurred when verifying user logging...');
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (!socket || !currentUser) {
      return;
    }

    socket?.emit('user-connected', currentUser);
    socket?.on('share-connected-user', (connectedUsers) => {
      console.log(connectedUsers);
      setConnectedUsers(connectedUsers);
    });

    const disconnectBeforeUnload = () => {
      socket?.emit('user-disconnected', currentUser);
    };
    window.addEventListener('beforeunload', disconnectBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', disconnectBeforeUnload);
    };
  }, [socket, currentUser]);

  return (
    <SocketContext.Provider value={useSocket(isLoggedIn)}>
      <Router>
        <NavigationMenu className="min-w-full lg:w-[80%] self-center py-5 px-2 lg:p-10 flex justify-between text-main">
          <NavigationMenuList>
            <NavigationMenuItem className="text-[24px]">
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

        <main className="w-[90%] flex flex-col m-auto text-main">
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

        <footer className="py-[100px]"></footer>
      </Router>
    </SocketContext.Provider>
  );
}

export default App;
