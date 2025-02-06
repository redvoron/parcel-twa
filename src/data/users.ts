import { User } from "@supabase/supabase-js";
import supabase from "./supabaseClient";

export const createUser = async (user: User) => {
  const { data, error } = await supabase.from("users").insert(user);
  if (error) {
    throw error;
  }
  return data;
};

export const updateUser = async (user: User) => {
  const { data, error } = await supabase.from("users").update(user).eq("id", user.id);
  if (error) {
    throw error;
  }
  return data;
};

export const authenticateUser = async (initData: string): Promise<string> => {

  if (!initData) {
      return 'No Telegram init data found';
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      return(`HTTP error! status: ${response.status}`);
    }

    const { auth_id, token, email } = await response.json();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: token,
      options: {
        data: {
          auth_id,
        }
      }
    });

    if (signUpError) {
      // Если пользователь уже существует, пробуем войти
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: token,
      });

      if (signInError) {
        return `Supabase auth error ${auth_id}: ${JSON.stringify(signInError.message)}`;
      }
      return `Authenticated user: ${JSON.stringify(signInData)}`;
    }

    return `Created and authenticated user: ${JSON.stringify(signUpData)}`;
  } catch (error) {
      return(`Auth request failed: ${JSON.stringify(error)}`);
  }
  
}