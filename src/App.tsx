import "./App.css";
import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import OrdersPage from "./pages/OrdersPage";
import { FormModes, OrdersViewType } from "./utils/constants";
import { routes } from "./utils/routes";
import OrderPage from "./pages/OrderPage";
import ChatPage from "./pages/ChatPage";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

function App() {
  const [redirectedToOrder, setRedirectedToOrder] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const startParam = WebApp.initDataUnsafe.start_param;
    if (startParam && startParam.startsWith('order_')) {
      const orderId = startParam.split('_')[1];
      if (orderId && !redirectedToOrder) {
        setRedirectedToOrder(true);
        navigate(`/orders/view/${orderId}`);
      }
    }
  }, []);
  
  return (
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path={routes.myOrders.path} element={<OrdersPage type={OrdersViewType.MY} />} />
        <Route path={routes.deliveryOrders.path} element={<OrdersPage type={OrdersViewType.DELIVERY} />} />
        <Route path={routes.pickupOrders.path} element={<OrdersPage type={OrdersViewType.PICKUP} />} />
        <Route path={routes.userOrders.path} element={<OrdersPage type={OrdersViewType.USER} />} />
        <Route path={routes.orderEdit.path} element={<OrderPage mode={FormModes.EDIT} />} />
        <Route path={routes.orderCreate.path} element={<OrderPage mode={FormModes.CREATE} />} />
        <Route path={routes.orderView.path} element={<OrderPage mode={FormModes.VIEW} />} />
        <Route path={routes.chat.path} element={<ChatPage />} />
      </Routes>
  );
}

export default App;
