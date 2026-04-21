'use client';
import { createContext, useContext, useState } from 'react';

type currentUserType = {
  role: string;
  email: string;
};
type userContextType = {
  currentUser: currentUserType;
  setCurrentUser: (val: currentUserType) => void;
};

export const UserContext = createContext<userContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState({ role: 'user', email: '' });

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useProvider = () => useContext(UserContext);
