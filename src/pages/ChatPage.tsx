import { useTranslation } from "react-i18next";

const ChatPage = () => {
  const { t } = useTranslation();
  return (
    <div className="page">
      <h1>{t("chat")}</h1>
    </div>
  );
};

export default ChatPage;