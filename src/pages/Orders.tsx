import { useTranslation } from "react-i18next";

import OrdersTable from "../components/OrdersTable";
import { OrdersViewType } from "../utils/constants";
import OrderForm from "../components/OrderForm";
import { FormModes, OrdersTypes } from "../utils/constants";

const OrdersPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("orders")}</h1>
      <OrdersTable viewType={OrdersViewType.USER} />
      <OrderForm mode={FormModes.CREATE} type={OrdersTypes.DELIVERY} />
    </div>
  );
};

export default OrdersPage;