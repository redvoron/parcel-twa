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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: token,
    });

      if (error) {
          return(`Supabase auth error ${auth_id}: ${JSON.stringify(error.message)}`);
          
      } else {
          return(`Authenticated user: ${JSON.stringify(data)}`);
          
      }
  } catch (error) {
      return(`Auth request failed: ${JSON.stringify(error)}`);
  }
  
}