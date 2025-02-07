import supabase from "./supabaseClient";
import { AuthResult, AuthResultType } from "../utils/constants";

export const updateUserMeta = async (userId: string, userMeta: string) => {
  const meta = JSON.parse(userMeta);
  console.log('meta', meta);
  const { data, error } = await supabase
    .from("users")
    .update({ meta })
    .eq("id", userId);
  if (error) {
    throw error;
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

    if (!response.ok) {
      return {
        result: AuthResultType.ERROR,
        message: `HTTP error! : ${response.status}`,
        data: response.statusText,
      };
    }

    const { auth_id, token, email, email_confirmed } = await response.json();
    if (email_confirmed) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: token,
        });

      if (signInError) {
        return {
          result: AuthResultType.ERROR,
          message: "Ошибка аутентификации Supabase",
          data: signInError.message,
        };
      }

      await updateUserMeta(signInData.user.id, initData);
      return {
        result: AuthResultType.SUCCESS,
        message: "User authenticated",
        data: signInData,
      };
    } else {

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password: token,
        options: {
          data: {
            auth_id,
          },
        },
      }
    );

    if (signUpError) {
      return {
        result: AuthResultType.ERROR,
        message: "User registration error",
        data: signUpError.message,
      };
    }
    signUpData?.user?.id && await updateUserMeta(signUpData.user.id, initData);

    return {
      result: AuthResultType.SUCCESS,
      message: "User created and authenticated",
        data: signUpData,
      };
    }
  } catch (error) {
    return {
      result: AuthResultType.ERROR,
      message: `Auth request failed`,
      data: error,
    };
  }
};
