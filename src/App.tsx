import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainPage from "./pages/Main";
import OrdersPage from "./pages/Orders";
import { FormModes, OrdersViewType } from "./utils/constants";
import { routes } from "./utils/routes";
import OrderPage from "./pages/Order";

function App() {
  return (
    <BrowserRouter basename="/parcel-twa">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path={routes.myOrders.path} element={<OrdersPage type={OrdersViewType.USER} />} />
        <Route path={routes.deliveryOrders.path} element={<OrdersPage type={OrdersViewType.DELIVERY} />} />
        <Route path={routes.pickupOrders.path} element={<OrdersPage type={OrdersViewType.PICKUP} />} />
        <Route path={routes.userOrders.path} element={<OrdersPage type={OrdersViewType.USER} />} />
        <Route path={routes.orderEdit.path} element={<OrderPage mode={FormModes.EDIT} />} />
        <Route path={routes.orderCreate.path} element={<OrderPage mode={FormModes.CREATE} />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
