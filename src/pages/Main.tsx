import { useTranslation } from "react-i18next";
import { routes } from "../utils/routes";
import { Button, List } from "antd";
import { useNavigate } from "react-router-dom";
import { authenticateUser } from "../data/users";
import WebApp from "@twa-dev/sdk";
import { useState } from "react";
const MainPage = () => {
  const { t } = useTranslation();
  const [authResponse, setAuthResponse] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleCellClick = (path: string) => {
    navigate(path);
  };
  const userData: string = WebApp.initData;
  const handleAuth = async () => {
    const response = await authenticateUser(userData);
    setAuthResponse(response);
  };
  return (
    <div className="page">
      <h2>{t("welcome")}</h2>
      <List itemLayout="horizontal" bordered={false}>
        {routes.map((route) => (
          <List.Item key={route.name}>
            <Button type="link" onClick={() => handleCellClick(route.path)}>
              {t(route.name)}
            </Button>
          </List.Item>
        ))}
      </List>
      {JSON.stringify(userData)}
      <Button onClick={handleAuth}>Auth User</Button>
      {authResponse && <div>{authResponse}</div>}
    </div>
  );
};

export default MainPage;
