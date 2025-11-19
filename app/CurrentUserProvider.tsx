'use client';
import { createContext, useContext, useState } from 'react';

export const UserContext = createContext(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState('');
  const changeUser = (val) => setCurrentUser(val);
  return (
    <UserContext.Provider value={{ currentUser, changeUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useProvider = () => useContext(UserContext);
