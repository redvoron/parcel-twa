import { useTranslation } from "react-i18next";
import { Badge, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import BottomMenu from "../components/BottomMenu";
import { SendIcon, TruckIcon, UserRoundIcon } from "lucide-react";
import { GlobalContext } from "../main";
import { useContext, useEffect, useState } from "react";
import { howItWorks, rulesAndSafety } from "./HelpPage";
import { Lang } from "../utils/constants";
import { messagesApi } from "../data/messages";

const isDev = import.meta.env.DEV;

const MainPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { webApp } = useContext(GlobalContext);
  const user = webApp?.initDataUnsafe?.user;
  const { userContext } = useContext(GlobalContext);
  const lang = userContext?.lang || Lang.EN;
  const [messagesCount, setMessagesCount] = useState(0);
    //TODO: remove mock userId
  const userId = userContext?.data || (isDev && "19b31340-f88c-48dc-bc97-cbe80427ba37") || "0";

  const items = [
    {
      key: 'send',
      label: t("send-parcel"),
      icon: <SendIcon />,
      children: [
        {
          key: 'create-order-delivery',
          label: t("create-order-delivery"),
          onClick: () => handleCellClick("/orders/create/delivery"),
        },
        {
          key: 'view-orders-pickup',
          label: t("view-orders-pickup"),
          onClick: () => handleCellClick("/orders/pickup"),
        },
      ],
    },
    {
      key: 'transport',
      label: t("transport"),
      icon: <TruckIcon />,
      children: [
        {
          key: 'view-orders-delivery',
          label: t("view-orders-delivery"),
          onClick: () => handleCellClick("/orders/delivery"),
        },
        {
          key: 'create-order-pickup',
          label: t("create-order-pickup"),
          onClick: () => handleCellClick("/orders/create/pickup"),
        },
      ],
    },
    {
      key: 'help',
      label: t("orders-my"),
      icon: <Badge count={messagesCount}><UserRoundIcon /></Badge>,
      className: "ant-menu-submenu top-menu-item",
      onClick: () => handleCellClick("/orders/my"),
    },
    
  ];
  
  const handleCellClick = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    const fetchMessagesCount = async () => {
      const countByOrders = await messagesApi.getMessagesCountForUser(userId);
      const count = countByOrders.reduce((acc: number, curr: { unread: number }) => acc + curr.unread, 0);
      setMessagesCount(count);
    };
    fetchMessagesCount();
  }, []);
  
  return (
    <div className="page" >
      <h2>{t("welcome")}, {user?.first_name || user?.username}</h2>
        <Menu 
          mode="inline"
          items={items}
          style={{
            fontSize: "14px",
            backgroundColor: "transparent",
            border: "none",
          }}
          className="telegram-menu"
        />
      {howItWorks[lang]()}
      {rulesAndSafety[lang]()}
      <BottomMenu />
    </div>
  );
};

export default MainPage;
