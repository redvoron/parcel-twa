import supabase from "./supabaseClient";
import {
  AuthResult,
  AuthResultType,
  UserProfileFields,
} from "../utils/constants";

export const updateUserMeta = async (userId: string, userMeta: string) => {
  try {
    const params = new URLSearchParams(userMeta);
    const userDataStr = params.get("user");
    if (!userDataStr) {
      throw new Error("No user data found in meta");
    }

    const meta = {
      user: JSON.parse(userDataStr),
      chat_instance: params.get("chat_instance"),
      chat_type: params.get("chat_type"),
      auth_date: params.get("auth_date"),
      hash: params.get("hash"),
    };

    const { data, error } = await supabase
      .from("users")
      .update({ meta })
      .eq("auth_id", userId);
    if (error) {
      console.error("Error updating user meta:", error);
    }
    return data;
  } catch (error) {
    console.error("Error updating user meta:", error);
  }
};

export const authenticateUser = async (
  initData: string
): Promise<AuthResult> => {
  if (!initData) {
    return {
      result: AuthResultType.ERROR,
      message: "No Telegram init data found",
      data: "",
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

    const responseData = await response.json();
    const { auth_id, token, email } = responseData;

    if (!auth_id || !token || !email) {
      throw new Error("Missing required fields in response");
    }
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: token,
      options: {
        data: {
          auth_id,
        },
      },
    });
    if (
      signUpError &&
      !signUpError.message.includes("User already registered")
    ) {
      return {
        result: AuthResultType.ERROR,
        message: "User registration error",
        data: signUpError.message,
      };
    }
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: token,
      });
    if (signInError) {
      return {
        result: AuthResultType.ERROR,
        message: "Authentication error",
        data: signInError.message,
      };
    }
    await updateUserMeta(signInData.user.id, initData);
    return {
      result: AuthResultType.SUCCESS,
      message: signUpError
        ? "User authenticated"
        : "User created and authenticated",
      data: signInData.user.id,
    };
  } catch (error) {
    return {
      result: AuthResultType.ERROR,
      message: `Auth request failed`,
      data: JSON.stringify(error),
    };
  }
};

export const updateUserPhoneByTelegramId = async (
  telegramId: string,
  phone_number: string
) => {
  const { data, error } = await supabase
    .from("users")
    .update({ phone_number })
    .eq("telegram_id", telegramId);
  if (error) {
    console.error("Error updating user phone:", error);
  }
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .rpc("get_user_profile", {
      auth_id_param: userId,
    })
    .single();
  if (error) {
    console.error("Error getting profiles:", error);
  }
  return data;
};

export const updateUserProfile = async (
  userId: string,
  profile: UserProfileFields
) => {
  const { data, error } = await supabase
    .from("users")
    .update(profile)
    .eq("auth_id", userId)
    .select();
  if (error) {
    console.error("Error updating user profile:", error);
  }
  return data;
};
