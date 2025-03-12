import { useParams, useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";
import ChatMain from "../components/ChatMain";

const ChatPage = () => {
  const { userId, orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(() => {
      navigate(-1);
    });
    return () => {
      WebApp.BackButton.hide();
    };
  }, [navigate]);
  
  return (
    <div className="page">
      <ChatMain companionId={userId} orderId={orderId} />
    </div>
  );
};

export default ChatPage;