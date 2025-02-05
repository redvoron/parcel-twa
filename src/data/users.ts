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

export const authenticateUser = async (initData: string) => {

  if (!initData) {
      console.error("No Telegram init data found");
      return;
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { auth_id } = await response.json();

      const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "telegram",
          token: auth_id,
      });

      if (error) {
          console.error("Supabase auth error:", error);
      } else {
          console.log("Authenticated user:", data);
      }
  } catch (error) {
      console.error("Auth request failed:", error);
  }
}