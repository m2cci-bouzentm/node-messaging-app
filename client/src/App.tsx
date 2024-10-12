import { useEffect, useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { BrowserRouter as Router, Route, Link, Routes, Navigate } from 'react-router-dom';
import NotAuthenticatedNav from './components/NotAuthenticatedNav';
import SignUpComponent from './components/SignUpComponent';
import LoginComponent from './components/LoginComponent';
import SettingsComponent from './components/SettingsComponent';
import MainComponent from './components/MainComponent';
import { User } from './types';
import AuthenticatedNav from './components/AuthenticatedNav';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // authenticate user
    // create ws connect
    // get user token from local storage

    fetch(import.meta.env.VITE_API_BASE_URL + '/verify')
      .then((res) => res.json())
      .then(user => {
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch(err=>{
        console.log('Verifying Logging error...');
        console.log(err);
      });

    return () => {};
  }, []);

  return (
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
          <Route path="/" element={<MainComponent />} />
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
        </Routes>
      </main>

      <footer className="py-[100px]"></footer>
    </Router>
  );
}

export default App;
