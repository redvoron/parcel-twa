import { useTranslation } from "react-i18next";

const MyOrdersPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("my-orders")}</h1>
    </div>
  );
};

export default MyOrdersPage;