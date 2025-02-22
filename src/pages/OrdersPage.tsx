import OrdersTable from "../components/OrdersTable";
import { OrdersViewType } from "../utils/constants";
import { GetOrdersParams } from "../data/orders";
import { useNavigate, useParams } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";
import BottomMenu from "../components/BottomMenu";

interface OrdersPageProps {
  type: OrdersViewType;
  extraParams?: GetOrdersParams;
}

const OrdersPage = ({ type, extraParams }: OrdersPageProps) => {
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
    <div className="page">
      <OrdersTable viewType={type} userId={userId} extraParams={extraParams} />
      <BottomMenu />
    </div>
  );
};

export default OrdersPage;