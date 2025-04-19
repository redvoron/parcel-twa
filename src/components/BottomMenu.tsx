import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeIcon, UserRoundIcon, FileQuestionIcon } from "lucide-react";



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
        height: "75px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
        borderTop: "1px solid #e0e0e0",
        paddingBottom: "14px",
        backgroundColor: "white",
        boxSizing: "border-box"
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
      <Button
        type="link"
        icon={<FileQuestionIcon />}
        size="large"
        style={{
          outline: "none",
          backgroundColor: "transparent"
        }}
        className="no-hover"
        onClick={() => navigate("/help")}
      ></Button>

      
        <Button
          type="link"
          icon={<UserRoundIcon />}
          onClick={() => navigate("/profile")}
          style={{
            outline: "none",
            backgroundColor: "transparent"
          }}
          className="no-hover"
        />
    </div>
  );
};

export default BottomMenu;
