interface Window {
  TelegramWebviewProxy?: {
    postEvent: (eventType: string, data: Record<string, unknown>) => void;
  };
} 