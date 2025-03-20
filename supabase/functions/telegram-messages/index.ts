import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
const APP_URL = Deno.env.get('APP_URL')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const MESSAGE_READ_INTERVAL_MAX = 1000 * 60 * 15;

const supabase = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY ?? ''
)
const MESSAGE_TEXT = {
  en: 'You have <a href="{link}">new unread messages</a> for order №{order_id}',
  ru: 'У вас есть <a href="{link}">новые непрочитанные сообщения</a> для заказа №{order_id}',
}
Deno.serve(async () => {
  try {
    // Получаем непрочитанные сообщения старше 15 минут
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        order_id,
        sender_id,
        reciever_id,
        is_read,
        notifications_sent,
        created_at,
        sender:users!sender_id(username, first_name, last_name, meta),
        reciever:users!reciever_id(telegram_id)
      `)
      .eq('is_read', false)
      .eq('notifications_sent', false)
      .lt('created_at', new Date(Date.now() - MESSAGE_READ_INTERVAL_MAX).toISOString())
      .order('created_at')

    if (error) throw error

    // Группируем сообщения по получателю, отправителю и заказу
    const groupedMessages = messages?.reduce((acc, message) => {
      const key = `${message.reciever_id}-${message.sender_id}-${message.order_id}`
      if (!acc[key]) {
        acc[key] = {
          ids: [],
          order_id: message.order_id,
          sender_id: message.sender_id,
          reciever_id: message.reciever_id,
          reciever_telegram_id: message.reciever.telegram_id,
          reciever_lang: message.reciever.meta?.user?.language_code || 'en',
          count: 0,
          sender_name: message.sender.username || 
            `${message.sender.first_name} ${message.sender.last_name}`.trim()
        }
      }
      acc[key].ids.push(message.id)
      acc[key].count++
      return acc
    }, {} as Record<string, {
      ids: number[],
      order_id: number,
      sender_id: string,
      reciever_id: string,
      reciever_telegram_id: number,
      count: number,
      sender_name: string
    }>)

    // Обрабатываем каждую группу сообщений
    for (const group of Object.values(groupedMessages)) {
      try {
        if (group.reciever_telegram_id) {
          // Отправляем уведомление в Telegram
          const appLink = `${APP_URL}?start_param=order_${group.order_id}`
          const messageText = MESSAGE_TEXT[group.reciever_lang].replace('{link}', appLink).replace('{order_id}', group.order_id.toString())
          await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: group.reciever_telegram_id, 
              text: messageText,
              parse_mode: 'HTML'
            })
          })

          // Помечаем все сообщения группы как обработанные
          await supabase
            .from('messages')
            .update({ notifications_sent: true })
            .in('id', group.ids)
        }
      } catch (err) {
        console.error(`Error processing messages for order ${group.order_id}:`, err)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_groups: Object.keys(groupedMessages || {}).length 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})