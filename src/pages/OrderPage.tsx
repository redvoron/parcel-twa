import { useParams, useNavigate } from "react-router-dom";
import OrderForm from "../components/OrderForm";
import { FormModes, OrdersTypes } from "../utils/constants";
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";
import OrderView from "../components/OrderView";

const OrderPage = ({ mode }: { mode: FormModes }) => {
  const { orderId, type } = useParams();
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
      {mode === FormModes.VIEW && orderId ? (
        <OrderView orderId={parseInt(orderId) } />
      ) : (
        <OrderForm
          mode={mode as FormModes}
          orderId={orderId ? parseInt(orderId) : undefined}
          type={type as OrdersTypes}
        />
      )}
    </div>
  );
};

export default OrderPage;
