import SendPage from "../pages/Send";
import OrdersPage from "../pages/Orders";
import MyOrdersPage from "../pages/MyOrders";
import DeliverPage from "../pages/Deliver";
import ChatPage from "../pages/Chat";

export const routes = [
  {
    path: '/send',
    name: 'send',
    component: SendPage,
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersPage,
  },
  {
    path: '/my-orders',
    name: 'my-orders',
    component: MyOrdersPage,
  },
  {
    path: '/deliver',
    name: 'deliver',
    component: DeliverPage,
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatPage,
  },
];
