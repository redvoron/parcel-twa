import { useTranslation } from "react-i18next";

const DeliverPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("deliver")}</h1>
    </div>
  );
};

export default DeliverPage;