import { useTranslation } from "react-i18next";
import BottomMenu from "../components/BottomMenu";
const ChatPage = () => {
  const { t } = useTranslation();
  return (
    <div className="page">
      <h1>{t("chat")}</h1>
      <BottomMenu />
    </div>
  );
};

export default ChatPage;