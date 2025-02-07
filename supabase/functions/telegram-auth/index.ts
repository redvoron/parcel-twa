import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import hmac_sha256 from "https://deno.land/x/hmacsha256/hmac-sha256-deno.mjs";
import * as jwt from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_JWT_SECRET = Deno.env.get("PROJECT_JWT_SECRET")!;

const MAIL_DOMAIN = Deno.env.get("MAIL_DOMAIN") || 'parcel.app.user';
const APP_DOMAIN = Deno.env.get("APP_DOMAIN") || 'redvoron.github.io';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function computeTelegramSignatureUniversal(
  telegramBotToken: string,
  checkString: string
): Promise<string> {
  const encoder = new TextEncoder();

  const intermediateKey = await hmac_sha256(
    encoder.encode(telegramBotToken),
    encoder.encode("WebAppData")
  );

  const signatureBuffer = await hmac_sha256(
    encoder.encode(checkString),
    intermediateKey
  );

  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return signature;
}

export const verifyTelegramAuth = async (
  telegramInitData: string
): Promise<boolean> => {
  const urlSearchParams = new URLSearchParams(telegramInitData);
  const data = Object.fromEntries(urlSearchParams.entries());
  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join("\n");

  const signature = await computeTelegramSignatureUniversal(
    TELEGRAM_BOT_TOKEN,
    checkString
  );

  return signature === data.hash;
};

function extractUserData(initData: string) {
  const params = new URLSearchParams(initData);
  let userData = {} as {
    id?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };

  if (params.has("user")) {
    try {
      userData = JSON.parse(params.get("user") as string);
    } catch (error) {
      console.error("Ошибка парсинга JSON из параметра 'user':", error);
    }
  }

  const telegramId = userData.id ?? Number(params.get("id"));
  const username =
    userData.username || params.get("username") || `user${telegramId}`;
  const firstName = userData.first_name || params.get("first_name") || "";
  const lastName = userData.last_name || params.get("last_name") || "";
  const avatarUrl = userData.photo_url || params.get("photo_url") || "";

  return {
    telegramId,
    username,
    firstName,
    lastName,
    avatarUrl,
  };
}
async function createPasswordToken(telegramId: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SUPABASE_JWT_SECRET.slice(0, 72)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const token = await jwt.create(
    { alg: "HS256", typ: "JWT" },
    {
      sub: telegramId,
      username: `user_${telegramId}`,
      provider: "telegram",
    },
    key 
  );
  const result = token.slice(21,72).replace(".", '').split('').reverse().join('');
  
  return result;
}
serve(async (req) => {
  // Определяем CORS заголовки
  const corsHeaders = {
    "Access-Control-Allow-Origin": `https://${APP_DOMAIN}`,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  // Обработка OPTIONS запроса
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const { initData } = await req.json();
  if (!(await verifyTelegramAuth(initData))) {
    return new Response(JSON.stringify({ error: "Invalid Telegram data" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { telegramId, username, firstName, lastName, avatarUrl } =
    extractUserData(initData);
  const userPassword = await createPasswordToken(telegramId);
  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("auth_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let authUserId = existingUser?.auth_id;
  let emailConfirmed = true;
  if (!authUserId) {
    emailConfirmed = false;
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: `${telegramId}@${MAIL_DOMAIN}`,
      password: userPassword,
      user_metadata: {
        telegram_id: telegramId,
        username,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    authUserId = newUser?.user?.id;
    emailConfirmed = !!newUser?.user?.email_confirmed_at;
    await supabase.from("users").insert({
      auth_id: authUserId,
      telegram_id: telegramId,
      username,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
    });
  }

  return new Response(JSON.stringify({ auth_id: authUserId, token: userPassword, email: `${telegramId}@${MAIL_DOMAIN}`, email_confirmed: emailConfirmed }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
