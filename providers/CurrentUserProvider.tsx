'use client';
import { createContext, useContext, useState } from 'react';

type userContextType = {
  currentUser: string;
  changeUser: (val: string) => void;
};

export const UserContext = createContext<userContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState('');
  const changeUser = (val: string) => setCurrentUser(val);
  return (
    <UserContext.Provider value={{ currentUser, changeUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useProvider = () => useContext(UserContext);
