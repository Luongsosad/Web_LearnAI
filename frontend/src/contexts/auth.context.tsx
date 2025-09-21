'use client';

import { User } from '@/lib/types/User';
import React, { createContext, useContext } from 'react';

type AuthContextType = {
  user: User | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
});

export function AuthProvider({ user, children }: AuthContextType & { children: React.ReactNode }) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
