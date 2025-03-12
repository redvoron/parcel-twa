import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import OrdersPage from "./pages/OrdersPage";
import { FormModes, OrdersViewType } from "./utils/constants";
import { routes } from "./utils/routes";
import OrderPage from "./pages/OrderPage";
import ChatPage from "./pages/ChatPage";
function App() {
  return (
    <BrowserRouter basename="/parcel-twa">
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
    </BrowserRouter>
  );
}

export default App;
