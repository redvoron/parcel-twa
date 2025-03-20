import { Badge, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeIcon, UserRoundIcon } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { messagesApi } from "../data/messages";
import { GlobalContext } from "../main";

const BottomMenu = () => {
  const [messagesCount, setMessagesCount] = useState(0);
  const { userContext } = useContext(GlobalContext);
  const navigate = useNavigate();
  //TODO: remove mock userId
  const userId = userContext?.data || "19b31340-f88c-48dc-bc97-cbe80427ba37";
  useEffect(() => {
    const fetchMessagesCount = async () => {
      const countByOrders = await messagesApi.getMessagesCountForUser(userId);
      const count = countByOrders.reduce((acc, curr) => acc + curr.unread, 0);
      setMessagesCount(count);
    };
    fetchMessagesCount();
  }, []);
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
        style={{
          outline: "none",
          backgroundColor: "transparent"
        }}
        className="no-hover"
      />
{/*       <Button
        type="link"
        icon={<UserRoundIcon />}
        size="large"
        style={{outline: "none"}}
        // onClick={() => navigate("/chat")}
      ></Button> */}
      <Badge count={messagesCount}>
        <Button
          type="link"
          icon={<UserRoundIcon />}
          onClick={() => navigate("/orders/my")}
          style={{
            outline: "none",
            backgroundColor: "transparent"
          }}
          className="no-hover"
        />
      </Badge>
    </div>
  );
};

export default BottomMenu;
