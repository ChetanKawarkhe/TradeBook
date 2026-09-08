import React, { createContext, useContext, useEffect, useState } from "react";

import {
  GoogleSignin,
  type User,
} from "@react-native-google-signin/google-signin";

import { signInWithGoogle, signOutFromGoogle } from "@/utils/googleAuth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();

      setUser(currentUser);
    } catch (error) {
      console.error("Failed to check Google account:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn() {
    try {
      setSigningIn(true);

      const result = await signInWithGoogle();

      if (result.success) {
        setUser(result.user);
      }
    } finally {
      setSigningIn(false);
    }
  }

  async function signOut() {
    try {
      await signOutFromGoogle();
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signingIn,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
