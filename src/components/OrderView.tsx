import { useEffect, useMemo, useState } from "react";
import { Order, ordersApi } from "../data/orders";
import Title from "antd/es/typography/Title";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const OrderView = ({ orderId }: { orderId: number }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const getTitle = useMemo(() => {
    if (!order?.type) {
      return ''
    }
    return t(`order-${order?.type}`) + ` #${orderId}`;
  }, [orderId, order?.type]);

  const getOrder = async () => {
    setLoading(true);
    if (orderId) {
      const order = await ordersApi.getOrders({ orderId: orderId });
      //TODO check if can be edited
      const orderData = order?.data[0];
      setOrder(orderData);
    }
    setLoading(false);
  };

  useEffect(() => {
    getOrder();
  }, [orderId]);

  return (
    <div>
      <Spin
        spinning={loading}
        indicator={<LoadingOutlined style={{ fontSize: 72 }} spin />}
      >
        <Title level={2}>{getTitle}</Title>
      </Spin>
    </div>
  );
};

export default OrderView;
