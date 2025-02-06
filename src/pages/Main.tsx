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
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleCellClick = (path: string) => {
    navigate(path);
  };
  const userData: string = WebApp.initData;
  const handleAuth = async () => {
    setLoading(true);
    const response = await authenticateUser(userData);
    setAuthResponse(response);
    setLoading(false);
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
      <Button onClick={handleAuth} loading={loading}>Auth User</Button>
      {authResponse && <div>{authResponse}</div>}
    </div>
  );
};

export default MainPage;
