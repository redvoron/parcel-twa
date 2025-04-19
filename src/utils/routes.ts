export const routes = {
  orders: {
    path: '/orders',
    name: 'orders',
  },
  myOrders: {
    path: '/orders/my',
    name: 'orders-my',
  },
  orderEdit: {
    path: '/orders/edit/:orderId',
    name: 'orders-edit',
  },
  orderView: {
    path: '/orders/view/:orderId',
    name: 'orders-view',
  },
  orderMessage: {
    path: '/orders/message/:orderId',
    name: 'orders-message',
  },
  orderCreate: {
    path: '/orders/create/:type',
    name: 'orders-create',
  },
  deliveryOrders: {
    path: '/orders/delivery',
    name: 'orders-delivery',
  },
  pickupOrders: {
    path: '/orders/pickup',
    name: 'orders-pickup',
  },
  userOrders: {
    path: '/orders/user/:userId',
    name: 'orders-user',
  },
  deliver: {
    path: '/deliver',
    name: 'deliver',
  },
  chat: {
    path: '/chat/:orderId/:userId',
    name: 'chat',
  },
  help: {
    path: '/help',
    name: 'help',
  },
  profile: {
    path: '/profile',
    name: 'profile',
  },
};
