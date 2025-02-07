import './i18n';
import React, { createContext, useEffect, useState } from 'react'
import { ConfigProvider, Flex, Spin } from 'antd';
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WebApp from '@twa-dev/sdk'
import { LoadingOutlined } from "@ant-design/icons";
import { authenticateUser } from './data/users.ts';

const globalContext = {webApp: WebApp, userContext: null};
export const GlobalContext = createContext(globalContext);

const telegramTheme = {
  token: {
    colorPrimary: "#0088cc", // Основной синий цвет Telegram
    colorTextBase: "#000", // Основной текст черный
    colorBgBase: "#ffffff", // Фон белый
    colorBorder: "#e0e0e0", // Цвет границ, как в Telegram
    borderRadius: 8, // Скругленные углы
    fontFamily: "'Segoe UI', Roboto, system-ui", // Шрифт, как в Telegram
    boxShadowBase: "none", // Убираем стандартные тени AntD
  },
};

function Root() {
  const [context, setContext] = useState(globalContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const userContext = await authenticateUser(WebApp.initData);
        setContext({webApp: WebApp, userContext});
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 72 }} spin />} />
      </Flex>
    );
  }

  return (
    <GlobalContext.Provider value={context}>
      <ConfigProvider theme={telegramTheme}>
        <App />
      </ConfigProvider>
    </GlobalContext.Provider>
  );
}

WebApp.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)