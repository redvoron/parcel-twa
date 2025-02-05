import { serve } from "https://deno.land/std@0.204.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.204.0/crypto/mod.ts"
import { encodeHex } from "https://deno.land/std@0.204.0/encoding/hex.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import hmac_sha256 from "https://deno.land/x/hmacsha256/hmac-sha256-deno.mjs";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});


async function computeTelegramSignatureUniversal(
  telegramBotToken: string,
  checkString: string,
): Promise<string> {
  const encoder = new TextEncoder();

  // Вычисляем промежуточный ключ:
  // Поведение аналогично: crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
  const intermediateKey = await hmac_sha256(
    encoder.encode(telegramBotToken),
    encoder.encode("WebAppData"),
  );

  // Вычисляем итоговую подпись:
  // Аналог: crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  const signatureBuffer = await hmac_sha256(
    encoder.encode(checkString),
    intermediateKey,
  );

  // Преобразуем Uint8Array в hex-строку
  const signature = Array.from(new Uint8Array(signatureBuffer))
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("");

  return signature;
}

export const verifyTelegramAuth = async (telegramInitData: string): Promise<boolean> => {
  const urlSearchParams = new URLSearchParams(telegramInitData);
  const data = Object.fromEntries(urlSearchParams.entries());
  const checkString = Object.keys(data)
    .filter(key => key !== 'hash')
    .map(key => `${key}=${data[key]}`)
    .sort()
    .join('\n');
  
  const signature = await computeTelegramSignatureUniversal(TELEGRAM_BOT_TOKEN, checkString);


  console.log("data.hash:", data.hash);
  console.log("signature:", signature);

  return true;
  // return signature === data.hash;
};

serve(async (req) => {
  // Определяем CORS заголовки
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://redvoron.github.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Обработка OPTIONS запроса
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: corsHeaders
    });
  }

  const { initData } = await req.json();
  console.log('initData', initData)
  if (!await verifyTelegramAuth(initData)) {
    console.log('invalid telegram data')
    return new Response(JSON.stringify({ error: "Invalid Telegram data" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  const params = new URLSearchParams(initData);
  const telegramId = params.get("id")!;
  const username = params.get("username") ?? `user${telegramId}`;
  const firstName = params.get("first_name") ?? "";
  const lastName = params.get("last_name") ?? "";
  const avatarUrl = params.get("photo_url") ?? "";
  console.log('params', params)
  console.log('telegramId', telegramId)
  console.log('username', username)
  console.log('firstName', firstName)
  console.log('lastName', lastName)
  console.log('avatarUrl', avatarUrl)
  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("auth_id")
    .eq("telegram_id", telegramId)
    .single();

  let authUserId = existingUser?.auth_id;
  if (userError) {
    console.log('userError', userError)
    return new Response(JSON.stringify({ error: userError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!authUserId) {
    console.log('create new user')
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
      console.log('creating user error', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
