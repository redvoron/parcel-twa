interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  start_param?: string;
  phone_number?: string;
}

interface WebApp {
  initData: string;
  initDataUnsafe: {
    user?: WebAppUser;
  };
  requestContact: () => Promise<{ phone_number: string }>;
}

interface Window {
  Telegram?: {
    WebApp: WebApp;
  };
  TelegramWebviewProxy?: {
    postEvent: (eventType: string, data: Record<string, unknown>) => void;
  };
} 