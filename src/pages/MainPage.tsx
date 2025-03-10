import { useTranslation } from "react-i18next";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import BottomMenu from "../components/BottomMenu";
import { SendIcon, TruckIcon } from "lucide-react";
import { GlobalContext } from "../main";
import { useContext } from "react";
const MainPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { webApp } = useContext(GlobalContext);
  const user = webApp?.initDataUnsafe?.user;
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
  ];
  
  const handleCellClick = (path: string) => {
    navigate(path);
  };

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

      <BottomMenu />
    </div>
  );
};

export default MainPage;
