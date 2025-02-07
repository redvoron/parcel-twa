import './i18n';
import React, { createContext } from 'react'
import { ConfigProvider } from 'antd';
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WebApp from '@twa-dev/sdk'
import { authenticateUser } from './data/users.ts';

const userContext = await authenticateUser(WebApp.initData);
const globalContext = {webApp: WebApp, userContext};
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

WebApp.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalContext.Provider value={globalContext}>
      <ConfigProvider theme={telegramTheme}>
        <App />
      </ConfigProvider>
    </GlobalContext.Provider>
  </React.StrictMode>,
)
