import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { MessageCircleMore, HomeIcon, UserRoundIcon } from "lucide-react";

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
        icon={<HomeIcon />}
        size="large"
        color="primary"
        variant="link"
        onClick={() => navigate("/")}
      ></Button>
      <Button
        type="link"
        icon={<UserRoundIcon />}
        size="large"
        onClick={() => navigate("/chat")}
      ></Button>
      <Button
        type="link"
        icon={<MessageCircleMore />}
        onClick={() => navigate("/orders/my")}
      ></Button>
    </div>
  );
};

export default BottomMenu;
