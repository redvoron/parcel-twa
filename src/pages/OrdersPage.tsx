import OrdersTable from "../components/OrdersTable";
import { OrdersViewType } from "../utils/constants";
import { GetOrdersParams } from "../data/orders";
import { useNavigate, useParams } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useContext, useEffect } from "react";
import BottomMenu from "../components/BottomMenu";
import { GlobalContext } from "../main";

interface OrdersPageProps {
  type: OrdersViewType;
  extraParams?: GetOrdersParams;
}

const isDev = import.meta.env.DEV;

const OrdersPage = ({ type, extraParams }: OrdersPageProps) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userContext } = useContext(GlobalContext);
  //TODO: remove mock userId
  const currentUserId = userContext?.data || (isDev && "19b31340-f88c-48dc-bc97-cbe80427ba37") || "0";

  const reqUserId = userId ? userId : currentUserId;

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
      <OrdersTable viewType={type} userId={reqUserId} extraParams={extraParams} />
      <BottomMenu />
    </div>
  );
};

export default OrdersPage;