import { User } from "@/types";


export interface AuthenticatedNavProps {
  currentUser: User | null;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUser: (user: User | null) => void;
}