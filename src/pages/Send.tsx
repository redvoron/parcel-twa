import { useTranslation } from "react-i18next";

const SendPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("send")}</h1>
    </div>
  );
};

export default SendPage;