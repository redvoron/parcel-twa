import { useContext, useEffect, useMemo, useState } from "react";
import { Order, ordersApi } from "../data/orders";
import { Avatar, Badge, Card, Divider, List } from "antd";
import { useTranslation } from "react-i18next";
import { Lang } from "../utils/constants";
import { GlobalContext } from "../main";
import dayjs from "dayjs";
import Flag from "react-world-flags";
import { messagesApi, Conversation } from "../data/messages";
import { getUserTitle } from "../utils/functions";
import { Link } from "react-router-dom";

const gridStyleHalf: React.CSSProperties = {
  width: "50%",
  textAlign: "left",
};

const gridStyleFull: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const OrderView = ({ orderId }: { orderId: number }) => {
  const { t } = useTranslation();
  const { userContext } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [plan, setPlan] = useState<{ name_ru: string; name_en: string }>({
    name_ru: "",
    name_en: "",
  });
  const lang = userContext?.lang || Lang.EN;
  //TODO: remove mock userId
  const userId = userContext?.data || "19b31340-f88c-48dc-bc97-cbe80427ba37";

  const getTitle = useMemo(() => {
    if (!order?.type) {
      return "";
    }
    return t(`order-${order?.type}`) + ` #${orderId}`;
  }, [orderId, order?.type]);

  const getOrder = async () => {
    setLoading(true);
    const getConverstions = async () => {
      const conversations = await messagesApi.getConversations(userId, orderId);
      setConversations(conversations);
    };
    if (orderId) {
      const order = await ordersApi.getOrders({ orderId: orderId });
      //TODO check if can be edited
      const orderData = order?.data[0];
      setOrder(orderData);
      await getConverstions();
      if (orderData?.data?.price?.planId) {
        const plan = await ordersApi.getPlan(orderData?.data?.price?.planId);
        setPlan(plan);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    getOrder();
  }, []);

  return (
    <div>
      <Card title={getTitle} loading={loading}>
        <Card.Grid style={gridStyleHalf}>
          <b>{t("from-city")}:</b>
          <p style={{ display: "flex", alignItems: "center" }}>
            <Flag
              width={20}
              style={{ marginRight: 2 }}
              code={order?.from_city_data?.country_code}
            />
            {order?.from_city_data?.[`name_${lang}`]}
          </p>
          <p>{dayjs(order?.data.from_date).format("DD.MM.YYYY")}</p>
        </Card.Grid>
        <Card.Grid style={gridStyleHalf}>
          <b>{t("to-city")}:</b>
          <p style={{ display: "flex", alignItems: "center" }}>
            <Flag
              width={20}
              style={{ marginRight: 2 }}
              code={order?.to_city_data?.country_code}
            />
            {order?.to_city_data?.[`name_${lang}`]}
          </p>
          <p>{dayjs(order?.data.to_date).format("DD.MM.YYYY")}</p>
        </Card.Grid>
        {order?.data.price?.value && (
          <Card.Grid style={gridStyleFull}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <b>{t("price")}:</b> {order?.data.price?.value}{" "}
              {order?.data.price?.currency}
            </span>
            {plan[`name_${lang}`] && (
              <span>
                <b>{t("plan")}:</b> {plan[`name_${lang}`]}
              </span>
            )}
          </Card.Grid>
        )}
      </Card>

      {conversations && conversations.length > 0 && (
        <>
          <Divider />
          <List
            header={t("conversations")}
            bordered
            loading={loading}
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item key={item.userId}>
                <Link
                  to={`/chat/${orderId}/${item.userId}`}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <Badge count={item.unreadCount}>
                    <Avatar src={item.avatar} />
                  </Badge>
                  <span>
                    {getUserTitle({
                      username: item.username,
                      first_name: item.firstName,
                      last_name: item.lastName,
                    })}
                  </span>
                </Link>
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
};

export default OrderView;
