import { useTranslation } from "react-i18next";

import OrdersTable from "../components/OrdersTable";
import { OrdersViewType } from "../utils/constants";
import { GetOrdersParams } from "../data/orders";
import { useNavigate, useParams } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";

interface OrdersPageProps {
  type: OrdersViewType;
  extraParams?: GetOrdersParams;
}

const OrdersPage = ({ type, extraParams }: OrdersPageProps) => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(() => {
      navigate(-1);
    });
    return () => {
      WebApp.BackButton.hide();
    };
  }, [navigate]); 
  
  return (
    <div>
      <h1>{t("orders")}</h1>
      <OrdersTable viewType={type} userId={userId} extraParams={extraParams} />
    </div>
  );
};

export default OrdersPage;