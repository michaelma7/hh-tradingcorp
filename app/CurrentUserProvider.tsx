'use client';
import { createContext, useContext, useState } from 'react';

type userContextValue = {
  currentUser: string;
  changeUser: (val: string) => void;
};

export const UserContext = createContext<userContextValue | undefined>(
  undefined,
);

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
