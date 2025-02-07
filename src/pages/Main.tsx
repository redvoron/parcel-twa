import { useTranslation } from "react-i18next";
import { routes } from "../utils/routes";
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
        {routes.map((route) => (
          <List.Item key={route.name}>
            <Button type="link" onClick={() => handleCellClick(route.path)}>
              {t(route.name)}
            </Button>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default MainPage;
