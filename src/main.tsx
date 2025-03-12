import i18n from "./i18n";
import React, { createContext, useEffect, useState } from "react";
import { ConfigProvider, Flex, Spin, FloatButton, Modal } from "antd";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import WebApp from "@twa-dev/sdk";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { authenticateUser } from "./data/users.ts";
import {
  AuthResultType,
  GlobalContextType,
  Lang,
  UserContext,
} from "./utils/constants";

const isDev = true;
const defaultUserContext: UserContext = {
  lang: Lang.EN,
  result: AuthResultType.ERROR,
  message: "",
  data: "",
};

const globalContext: GlobalContextType = {
  webApp: WebApp,
  userContext: defaultUserContext,
};
export const GlobalContext = createContext<GlobalContextType>(globalContext);

const telegramTheme = {
  token: {
    colorPrimary: "#007bff", // Основной синий цвет Telegram
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
  const [isModalOpen, setIsModalOpen] = useState(false);


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const telegramUserData = await authenticateUser(WebApp.initData);
        const userContext: UserContext = {
          ...telegramUserData,
          lang: Lang.EN,
        };
        if (
          WebApp.initDataUnsafe &&
          Object.values(Lang).includes(
            WebApp.initDataUnsafe.user?.language_code as Lang
          )
        ) {
          const lang = WebApp.initDataUnsafe.user?.language_code as Lang;
          i18n.changeLanguage(lang);
          userContext.lang = lang;
        }
        setContext({ webApp: WebApp, userContext });
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
        {isDev && (
          <>
            <FloatButton icon={<UserOutlined />} onClick={showModal} style={{ position: 'absolute', top: 10, right: 10 }}/>
            <Modal
              title="User info"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
          >
            {JSON.stringify(context.userContext)}
            {JSON.stringify(context.webApp)}
            </Modal>
          </>
        )}
      </ConfigProvider>
    </GlobalContext.Provider>
  );
}

WebApp.ready();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
