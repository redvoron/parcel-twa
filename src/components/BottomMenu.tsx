import { Button } from "antd";
import { HomeOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BottomMenu = () => {
  const navigate = useNavigate();
  return (
    <div
      className="bottom-menu"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
        borderTop: "1px solid #e0e0e0",
      }}
    >
      <Button
        icon={<HomeOutlined />}
        size="large"
        variant="outlined"
        style={{ color: "#007bff" }}
        onClick={() => navigate("/")}
      ></Button>
      <Button
        icon={<MessageOutlined />}
        size="large"
        variant="outlined"
        style={{ color: "#007bff" }}
        onClick={() => navigate("/orders/my")}
      ></Button>
      <Button
        icon={<UserOutlined />}
        size="large"
        variant="outlined"
        style={{ color: "#007bff" }}
        onClick={() => navigate("/chat")}
      ></Button>
    </div>
  );
};

export default BottomMenu;
