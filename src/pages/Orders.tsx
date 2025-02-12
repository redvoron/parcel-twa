import { useTranslation } from "react-i18next";

import OrdersTable from "../components/OrdersTable";
import { OrdersViewType } from "../utils/constants";
import { GetOrdersParams } from "../data/orders";
import { useParams } from "react-router-dom";

interface OrdersPageProps {
  type: OrdersViewType;
  extraParams?: GetOrdersParams;
}

const OrdersPage = ({ type, extraParams }: OrdersPageProps) => {
  const { t } = useTranslation();
  const { userId } = useParams();

  return (
    <div>
      <h1>{t("orders")}</h1>
      <OrdersTable viewType={type} userId={userId} extraParams={extraParams} />
    </div>
  );
};

export default OrdersPage;