import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { validURL } from '@/helpers';
import { SocketContext } from '@/context';
import { AuthenticatedNavProps } from './types';


const AuthenticatedNav = ({
  currentUser,
  setIsLoggedIn,
  setCurrentUser,
}: AuthenticatedNavProps) => {
  const [isSettingsMenu, setIsSettingsMenu] = useState<boolean | null>(null);
  const socket = useContext(SocketContext);

  const handleUserLogOut = (): void => {
    setIsSettingsMenu(false);
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('userToken');
    socket?.emit('user-disconnected', currentUser);
  };
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage
          src={
            validURL(currentUser?.avatarUrl || '')
              ? currentUser?.avatarUrl
              : 'https://github.com/shadcn.png'
          }
        />
      </Avatar>
      <div className="flex items-center space-x-2 relative">
        <span>{currentUser?.username}</span>
        <IoIosArrowDown
          onClick={() => setIsSettingsMenu(!isSettingsMenu)}
          className="cursor-pointer hover:scale-110 transition-all"
        />

        {isSettingsMenu && (
          <div className="settings-menu absolute z-20 top-[25px] right-0 flex flex-col items-center text-sm rounded-lg bg-slate-50 ">
            <Link
              onClick={() => setIsSettingsMenu(false)}
              to="/settings"
              className="w-full p-2 pr-8 rounded-lg cursor-pointer hover:bg-gray-200"
            >
              Settings
            </Link>
            <Link
              to="/"
              onClick={handleUserLogOut}
              className="w-full p-2 pr-8 rounded-lg cursor-pointer hover:bg-gray-200"
            >
              Log Out
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthenticatedNav;
