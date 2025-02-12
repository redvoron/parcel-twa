import React, { useContext, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  DatePicker,
  InputNumber,
  Select,
  Checkbox,
  Popconfirm,
  message,
} from "antd";
import { ordersApi } from "../data/orders";
import type { OrderData, CitySearchResult } from "../data/orders";
import dayjs from "dayjs";
import Flag from "react-world-flags";
import { FormModes, Lang, OrdersTypes } from "../utils/constants";
import { GlobalContext } from "../main";
import { useTranslation } from "react-i18next";
const { Title } = Typography;
const { TextArea } = Input;

const today = dayjs();
interface OrderFormProps {
  type?: OrdersTypes;
  mode: FormModes;
  orderId?: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ type, mode, orderId }) => {
  const [form] = Form.useForm();
  const [cities, setCities] = React.useState<CitySearchResult[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [fromCity, setFromCity] = React.useState<number>(0);
  const [toCity, setToCity] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [orderLoading, setOrderLoading] = React.useState<boolean>(false);
  const { userContext } = useContext(GlobalContext);
  const [orderType, setOrderType] = React.useState<OrdersTypes>(
    type || OrdersTypes.DELIVERY
  );
  const { t } = useTranslation();

  const onFinish = async (values: OrderData) => {
    setOrderLoading(true);
    const formattedValues: OrderData = {
      ...values,
      from_date: values.from_date
        ? dayjs(values.from_date).format("YYYY-MM-DD")
        : undefined,
      to_date: values.to_date
        ? dayjs(values.to_date).format("YYYY-MM-DD")
        : undefined,
    };

    //TODO: remove mock userId
    const userId = userContext?.data || "19b31340-f88c-48dc-bc97-cbe80427ba37";

    const prepOrderData: OrderData = {
      ...formattedValues,
    };
    prepOrderData.from_city = fromCity;
    prepOrderData.to_city = toCity;
    
    if (mode === FormModes.CREATE) {
      if (userId && type) {
        const order = await ordersApi.createOrder(userId, type, prepOrderData);
        if (order) {
          message.success(t("order-created"));
          console.log("Заказ создан:", order);
        } else {
          message.error(t("order-create-error"));
        }
      }
    } else {
      if (orderId) {
        const order = await ordersApi.updateOrder(orderId, prepOrderData);
        if (order) {
          message.success(t("order-updated"));
          console.log("Заказ обновлен:", order);
        } else {
          message.error(t("order-update-error"));
        }
      }
    }
    setOrderLoading(false);
    //TODO: redirect to orders list (my orders)
  };
  const handleSearch = async (value: string) => {
    setSearch(value);
    setLoading(true);
    const cities = await ordersApi.searchCities(search);
    setCities(cities);
    setLoading(false);
  };

  const handleCancel = () => {
    console.log("Cancel");
  };

  const setFieldsValue = async (values: OrderData) => {
    const lang = userContext?.lang || Lang.EN;
    if (values.from_city) {
      const cityName = await ordersApi.getCityName(values.from_city, lang);
      form.setFieldsValue({
        from_city: cityName.city_name,
      });
      setFromCity(values.from_city);
    }
    if (values.to_city) {
      const cityName = await ordersApi.getCityName(values.to_city, lang);
      form.setFieldsValue({
        to_city: cityName.city_name,
      });
      setToCity(values.to_city);
    }

    form.setFieldsValue({
      from_date: values.from_date ? dayjs(values.from_date) : undefined,
      to_date: values.to_date ? dayjs(values.to_date) : undefined,
      weight: values.weight,
      width: values.width,
      height: values.height,
      length: values.length,
      ready_to_send: values.ready_to_send,
      ready_to_receive: values.ready_to_receive,
      description: values.description,
    });
  };
  const getOrder = async () => {
    if (orderId) {
      const order = await ordersApi.getOrders({ orderId: orderId });
      //TODO check if can be edited
      const orderData = order?.data[0]?.data;
      setOrderType(order?.data[0]?.type);
      if (orderData) {
        setFieldsValue(orderData);
      }
    }
  };

  const getTitle = useMemo(() => {
    return (
      t(`order-${orderType}`) +
      (mode === FormModes.CREATE ? "" : ` #${orderId}`)
    );
  }, [mode, orderId, t, orderType]);

  const getButtonText = useMemo(() => {
    return t(`${mode}-order-${orderType}`);
  }, [mode, t, orderType]);

  const getCancelButtonText = useMemo(() => {
    return t(`cancel-order-${orderType}`);
  }, [t, orderType]);

  useEffect(() => {
    if (mode === FormModes.EDIT && orderId) {
      getOrder();
    }
  }, [mode, orderId]);

  return (
    <div>
      <Title level={2}>{getTitle}</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "0px",
          }}
        >
          <Form.Item
            name="from_city"
            label={t("from-city")}
            rules={[{ required: true, message: t("from-city-error") }]}
            style={{ textAlign: "left" }}
          >
            <Select
              options={cities.map((city) => ({
                key: city.id,
                value: city.city_ru,
              }))}
              size="large"
              showSearch
              filterOption={false}
              onSearch={handleSearch}
              id="from_city"
              notFoundContent={!search || loading ? null : t("nothing-found")}
              onSelect={(_value, option) => {
                setSearch("");
                setCities([]);
                setFromCity(option.key);
              }}
              optionRender={(option) => {
                return (
                  <div style={{ display: "flex", alignItems: "left", gap: 10 }}>
                    <Flag
                      code={
                        cities.find((city) => city.id === option.key)
                          ?.country_code as string
                      }
                      width={20}
                      height={15}
                    />
                    {option.value}
                  </div>
                );
              }}
              placeholder={t("from-city-placeholder")}
            />
          </Form.Item>
          <Form.Item
            name="to_city"
            label={t("to-city")}
            rules={[{ required: true, message: t("to-city-error") }]}
            style={{ textAlign: "left" }}
          >
            <Select
              options={cities.map((city) => ({
                key: city.id,
                value: city.city_ru,
              }))}
              showSearch
              filterOption={false}
              id="to_city"
              onSearch={handleSearch}
              notFoundContent={!search || loading ? null : t("nothing-found")}
              onSelect={(_value, option) => {
                setSearch("");
                setCities([]);
                setToCity(option.key);
              }}
              size="large"
              optionRender={(option) => {
                return (
                  <div style={{ display: "flex", alignItems: "left", gap: 10 }}>
                    <Flag
                      code={
                        cities.find((city) => city.id === option.key)
                          ?.country_code as string
                      }
                      width={20}
                      height={15}
                    />
                    {option.value}
                  </div>
                );
              }}
              placeholder={t("to-city-placeholder")}
            />
          </Form.Item>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="from_date"
            label={t("departure")}
            rules={[{ required: true, message: t("from-date-error") }]}
          >
            <DatePicker
              inputReadOnly={true}
              style={{ width: "100%" }}
              minDate={today}
              onChange={(value) => {
                form.setFieldsValue({ from_date: value });
              }}
              placeholder={t("select-date")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="to_date"
            label={t("arrival")}
            rules={[{ required: true, message: t("to-date-error") }]}
          >
            <DatePicker
              inputReadOnly={true}
              style={{ width: "100%" }}
              minDate={today}
              onChange={(value) => {
                form.setFieldsValue({ to_date: value });
              }}
              placeholder={t("select-date")}
              size="large"
            />
          </Form.Item>
        </div>

        <div style={{ display: "table", width: "100%" }}>
          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                paddingRight: "8px",
                paddingTop: "8px",
                textAlign: "left",
                verticalAlign: "top",
              }}
            >
              <label htmlFor="weight">{t("weight")}</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="weight"
                rules={[{ required: true, message: t("weight-error") }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="weight"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="кг"
                  placeholder={t("weight-placeholder")}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                paddingRight: "8px",
                paddingTop: "8px",
                textAlign: "left",
                verticalAlign: "top",
              }}
            >
              <label htmlFor="width">{t("width")}</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="width"
                rules={[{ required: true, message: t("width-error") }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="width"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="см"
                  placeholder={t("width-placeholder")}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                paddingRight: "8px",
                paddingTop: "8px",
                textAlign: "left",
                verticalAlign: "top",
              }}
            >
              <label htmlFor="height">{t("height")}</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="height"
                rules={[{ required: true, message: t("height-error") }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="height"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="см"
                  placeholder={t("height-placeholder")}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                paddingRight: "8px",
                paddingTop: "8px",
                textAlign: "left",
                verticalAlign: "top",
              }}
            >
              <label htmlFor="length">{t("length")}</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="length"
                rules={[{ required: true, message: t("length-error") }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="length"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="см"
                  placeholder={t("length-placeholder")}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>
        </div>
        {type === OrdersTypes.DELIVERY && (
          <Form.Item name="ready_to_send" style={{ textAlign: "left" }}>
            <Checkbox style={{ fontSize: "14px" }}>
              {t("ready-to-send")}
            </Checkbox>
          </Form.Item>
        )}
        {type === OrdersTypes.PICKUP && (
          <Form.Item name="ready_to_receive" style={{ textAlign: "left" }}>
            <Checkbox style={{ fontSize: "14px" }}>
              {t("ready-to-receive")}
            </Checkbox>
          </Form.Item>
        )}
        <Form.Item
          name="description"
          label={t("description")}
          rules={[{ required: true, message: t("description-error") }]}
        >
          <TextArea
            rows={4}
            placeholder={t("description-placeholder")}
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={orderLoading}
            size="large"
            disabled={orderLoading}
          >
            {getButtonText}
          </Button>
          {mode === FormModes.EDIT && (
            <Popconfirm
              title={t(`popup-title-cancel-order-${orderType}`)}
              description={t(`popup-text-cancel-order-${orderType}`)}
              okText={t("yes")}
              cancelText={t("no")}
              onConfirm={handleCancel}
              okButtonProps={{ danger: true, size: "large" }}
              cancelButtonProps={{ size: "large" }}
            >
              <Button
                type="primary"
                color="danger"
                variant="outlined"
                size="large"
                block
                loading={orderLoading}
                style={{ marginTop: "12px" }}
              >
                {getCancelButtonText}
              </Button>
            </Popconfirm>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default OrderForm;
