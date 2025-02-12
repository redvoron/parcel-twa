import { useParams } from "react-router-dom";
import OrderForm from "../components/OrderForm";
import { FormModes, OrdersTypes } from "../utils/constants";

const OrderPage = ({ mode }: { mode: FormModes }) => {
  const { orderId, type } = useParams();

  return (
    <div>
      <OrderForm
        mode={mode as FormModes}
        orderId={orderId ? parseInt(orderId) : undefined}
        type={type as OrdersTypes}
      />
    </div>
  );
};

export default OrderPage;
