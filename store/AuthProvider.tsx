import Constants from "expo-constants";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { User } from "@react-native-google-signin/google-signin";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  driveBackupAvailable: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IS_EXPO_GO = Constants.appOwnership === "expo";

const DEV_USER = {
  user: {
    id: "tradebook-dev-user",
    name: "TradeBook User",
    email: "dev@tradebook.local",
    photo: null,
    familyName: "User",
    givenName: "TradeBook",
  },
  scopes: [],
  idToken: null,
  serverAuthCode: null,
} as User;

function getGoogleSignin() {
  if (IS_EXPO_GO) {
    return null;
  }

  const module = require("@react-native-google-signin/google-signin");

  return module.GoogleSignin;
}

function getGoogleAuth() {
  if (IS_EXPO_GO) {
    return null;
  }

  return require("@/utils/googleAuth");
}

async function checkGoogleDriveBackup() {
  if (IS_EXPO_GO) {
    return false;
  }

  try {
    const { findGoogleDriveBackup } = await import("@/utils/googleDrive");

    const backup = await findGoogleDriveBackup();

    return backup !== null;
  } catch (error) {
    console.warn("Google Drive backup detection failed:", error);

    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [signingIn, setSigningIn] = useState(false);

  const [driveBackupAvailable, setDriveBackupAvailable] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      if (IS_EXPO_GO) {
        setUser(DEV_USER);
        return;
      }

      const GoogleSignin = getGoogleSignin();

      if (!GoogleSignin) {
        setUser(null);
        return;
      }

      const currentUser = await GoogleSignin.getCurrentUser();

      setUser(currentUser);

      if (currentUser) {
        const hasBackup = await checkGoogleDriveBackup();

        setDriveBackupAvailable(hasBackup);
      }
    } catch (error) {
      console.error("Failed to check Google account:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(): Promise<boolean> {
    try {
      setSigningIn(true);

      if (IS_EXPO_GO) {
        setUser(DEV_USER);
        setDriveBackupAvailable(false);
        return false;
      }

      const googleAuth = getGoogleAuth();

      if (!googleAuth) {
        return false;
      }

      const result = await googleAuth.signInWithGoogle();

      if (!result.success) {
        return false;
      }

      setUser(result.user);

      try {
        await googleAuth.requestGoogleDriveAccess();

        const hasBackup = await checkGoogleDriveBackup();

        setDriveBackupAvailable(hasBackup);

        return hasBackup;
      } catch (error) {
        console.error("Google Drive access was not granted:", error);

        setDriveBackupAvailable(false);

        return false;
      }
    } finally {
      setSigningIn(false);
    }
  }

  async function signOut() {
    try {
      if (IS_EXPO_GO) {
        setUser(null);
        setDriveBackupAvailable(false);
        return;
      }

      const googleAuth = getGoogleAuth();

      if (!googleAuth) {
        setUser(null);
        setDriveBackupAvailable(false);
        return;
      }

      await googleAuth.signOutFromGoogle();

      setUser(null);
      setDriveBackupAvailable(false);
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
        driveBackupAvailable,
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
