interface Window {
  Telegram?: {
    WebApp: {
      requestContact: () => Promise<{ phone_number: string }>;
      initData: string;
      initDataUnsafe: {
        user?: {
          id: number;
          first_name: string;
          last_name?: string;
          username?: string;
          language_code?: string;
          start_param?: string;
        };
      };
      showPopup: (params: {
        title: string;
        message: string;
        buttons: Array<{
          type: "ok" | "close" | "cancel";
          text: string;
          id?: string;
        }>;
      }) => Promise<{ buttonId: string }>;
    };
  };
} 