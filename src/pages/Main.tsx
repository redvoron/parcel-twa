import { useTranslation } from "react-i18next";
import { Button, List } from "antd";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  
  const handleCellClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="page">
      <h2>{t("welcome")}</h2>
      <List itemLayout="horizontal" bordered={false}>

          <List.Item key='orders-my' title={t("orders-my")}>
            <Button type="link" onClick={() => handleCellClick("/orders/my")}>
              {t("orders-my")}
            </Button>
          </List.Item>
          <List.Item key='orders-delivery' title={t("orders-delivery")}>
            <Button type="link" onClick={() => handleCellClick("/orders/delivery")}>
              {t("orders-delivery")}
            </Button>
          </List.Item>
          <List.Item key='orders-pickup' title={t("orders-pickup")}>
            <Button type="link" onClick={() => handleCellClick("/orders/pickup")}>
              {t("orders-pickup")}
            </Button>
          </List.Item>
          <List.Item key='orders-user' title={t("orders-user")}>
            <Button type="link" onClick={() => handleCellClick("/orders/user/19b31340-f88c-48dc-bc97-cbe80427ba37")}>
              {t("orders-user")}
            </Button>
          </List.Item>
          <List.Item key='create-order-pickup' title={t("create-order-pickup")}>
            <Button type="link" onClick={() => handleCellClick("/orders/create/pickup")}>
              {t("create-order-pickup")}
            </Button>
          </List.Item>
          <List.Item key='create-order-delivery' title={t("create-order-delivery")}>
            <Button type="link" onClick={() => handleCellClick("/orders/create/delivery")}>
              {t("create-order-delivery")}
            </Button>
          </List.Item>
          <List.Item key='edit-order-delivery' title={t("edit-order-delivery")}>
            <Button type="link" onClick={() => handleCellClick("/orders/edit/6")}>
              {t("edit-order-delivery") + ' 6'}
            </Button>
          </List.Item>
          <List.Item key='edit-order-pickup' title={t("edit-order-pickup")}>
            <Button type="link" onClick={() => handleCellClick("/orders/edit/8")}>
              {t("edit-order-pickup") + ' 8'}
            </Button>
          </List.Item>
      </List>
    </div>
  );
};

export default MainPage;
