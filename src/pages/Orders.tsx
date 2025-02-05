import { useTranslation } from "react-i18next";

const OrdersPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("orders")}</h1>
    </div>
  );
};

export default OrdersPage;