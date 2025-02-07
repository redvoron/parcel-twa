import supabase from "./supabaseClient";
import { AuthResult, AuthResultType } from "../utils/constants";

export const updateUserMeta = async (userId: string, userMeta: string) => {
  console.log("userMeta", userMeta);
  const meta = JSON.parse(userMeta);
  console.log("meta", meta);
  const { data, error } = await supabase
    .from("users")
    .update({ meta })
    .eq("id", userId);
  if (error) {
    console.error("Error updating user meta:", error);
  }
  return data;
};

export const authenticateUser = async (
  initData: string
): Promise<AuthResult> => {
  if (!initData) {
    return {
      result: AuthResultType.ERROR,
      message: "No Telegram init data found",
      data: null,
    };
  }

  try {
    console.log('Send request to telegram-auth');
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ initData }),
      }
    );
    console.log('Response from telegram-auth', response);
    if (!response.ok) {
      return {
        result: AuthResultType.ERROR,
        message: `HTTP error! : ${response.status}`,
        data: response.statusText,
      };
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    const { auth_id, token, email, email_confirmed } = responseData;
    
    if (!auth_id || !token || !email) {
      throw new Error('Missing required fields in response');
    }

    if (email_confirmed) {
      console.log('Email confirmed, try to sign in');
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: token,
        });
      console.log('Sign in data', signInData);
      if (signInError) {
        return {
          result: AuthResultType.ERROR,
          message: "Ошибка аутентификации Supabase",
          data: signInError.message,
        };
      }
      console.log('Update user meta');
      await updateUserMeta(signInData.user.id, initData);
      return {
        result: AuthResultType.SUCCESS,
        message: "User authenticated",
        data: signInData,
      };
    } else {
      console.log('Email not confirmed, try to sign up');
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: token,
          options: {
            data: {
              auth_id,
            },
          },
        });
      console.log('Sign up data', signUpData);
      if (signUpError) {
        return {
          result: AuthResultType.ERROR,
          message: "User registration error",
          data: signUpError.message,
        };
      }
      signUpData?.user?.id &&
        (await updateUserMeta(signUpData.user.id, initData));
      console.log('User created and authenticated');
      return {
        result: AuthResultType.SUCCESS,
        message: "User created and authenticated",
        data: signUpData,
      };
    }
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return {
      result: AuthResultType.ERROR,
      message: `Auth request failed`,
      data: error,
    };
  }
};
