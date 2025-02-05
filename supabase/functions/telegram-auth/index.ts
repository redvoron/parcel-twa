import { serve } from "https://deno.land/std@0.204.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.204.0/crypto/mod.ts"
import { encodeHex } from "https://deno.land/std@0.204.0/encoding/hex.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function verifyTelegramAuth(initData: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash")!;
  params.delete("hash");

  const dataCheckArray = Array.from(params.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const key = new TextEncoder().encode(TELEGRAM_BOT_TOKEN);
  const message = new TextEncoder().encode(dataCheckArray);
  const hmac = new crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = crypto.subtle.sign("HMAC", hmac, message);
  const computedHash = encodeHex(new Uint8Array(signature));

  return computedHash === hash;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }
  
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { initData } = await req.json();
  if (!verifyTelegramAuth(initData)) {
    return new Response(JSON.stringify({ error: "Invalid Telegram data" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const params = new URLSearchParams(initData);
  const telegramId = params.get("id")!;
  const username = params.get("username") ?? `user${telegramId}`;
  const firstName = params.get("first_name") ?? "";
  const lastName = params.get("last_name") ?? "";
  const avatarUrl = params.get("photo_url") ?? "";

  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("auth_id")
    .eq("telegram_id", telegramId)
    .single();

  let authUserId = existingUser?.auth_id;
  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!authUserId) {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      user_metadata: {
        telegram_id: telegramId,
        username,
        first_name: firstName,
        lastName,
        avatarUrl,
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    authUserId = newUser.id;

    await supabase.from("users").insert({
      auth_id: authUserId,
      telegram_id: telegramId,
      username,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
    });
  }

  return new Response(
    JSON.stringify({ auth_id: authUserId }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
