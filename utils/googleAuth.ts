import {
  GoogleSignin,
  statusCodes,
  type User,
} from "@react-native-google-signin/google-signin";

const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (!WEB_CLIENT_ID) {
  throw new Error(
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not configured.",
  );
}

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

export async function signInWithGoogle(): Promise<{
  success: true;
  user: User;
  idToken: string | null;
} | {
  success: false;
  cancelled: true;
}> {
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const response = await GoogleSignin.signIn();

    if (!response.data?.user) {
      throw new Error(
        "Google Sign-In completed without a user.",
      );
    }

    const googleUser = response.data.user;

    const user: User = {
      user: googleUser,
      scopes: response.data.scopes ?? [],
      idToken: response.data.idToken ?? null,
      serverAuthCode: response.data.serverAuthCode ?? null,
    };

    return {
      success: true,
      user,
      idToken: response.data.idToken ?? null,
    };
  } catch (error: any) {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      return {
        success: false,
        cancelled: true,
      };
    }

    console.error("Google Sign-In failed:", error);

    throw error;
  }
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error("Google Sign-Out failed:", error);
    throw error;
  }
}