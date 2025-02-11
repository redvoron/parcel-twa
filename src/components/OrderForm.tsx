import React, { useContext, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  DatePicker,
  InputNumber,
  Select,
} from "antd";
import { ordersApi } from "../data/orders";
import type { OrderData, CitySearchResult } from "../data/orders";
import dayjs from "dayjs";
import Flag from "react-world-flags";
import { FormModes, Lang, OrdersTypes } from "../utils/constants";
import { GlobalContext } from "../main";
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

    console.log("Отправка данных:", formattedValues);
    //TODO: remove this
    const userId = userContext?.data || "19b31340-f88c-48dc-bc97-cbe80427ba37";

    const prepOrderData: OrderData = {
      ...formattedValues,
    };
    prepOrderData.from_city = fromCity;
    prepOrderData.to_city = toCity;

    if (mode === FormModes.CREATE) {
      // Здесь будет вызов API для создания заказа
      if (userId && type) {
        const order = await ordersApi.createOrder(userId, type, prepOrderData);
        console.log("Заказ создан:", order);
      }
    } else {
      // Здесь будет вызов API для обновления заказа
      if (orderId) {
        const order = await ordersApi.updateOrder(orderId, prepOrderData);
        console.log("Заказ обновлен:", order);
      }
    }
    setOrderLoading(false);
  };
  const handleSearch = async (value: string) => {
    setSearch(value);
    setLoading(true);
    const cities = await ordersApi.searchCities(search);
    setCities(cities);
    setLoading(false);
  };

  const setFieldsValue = async (values: OrderData) => {
    // Get lang from user context
    const lang = Lang.RU;
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
      if (orderData) {
        setFieldsValue(orderData);
      }
    }
  };

  useEffect(() => {
    if (mode === FormModes.EDIT && orderId) {
      getOrder();
    }
  }, [mode, orderId]);

  return (
    <div>
      <Title level={2}>Создать заказ</Title>
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
            label="Откуда"
            rules={[{ required: true, message: "Выберите город отправления" }]}
          >
            <Select
              options={cities.map((city) => ({
                key: city.id,
                value: city.city_ru,
              }))}
              showSearch
              filterOption={false}
              onSearch={handleSearch}
              id="from_city"
              notFoundContent={!search || loading ? null : "Ничего не найдено"}
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
              placeholder="Выберите город"
            />
          </Form.Item>

          <Form.Item
            name="to_city"
            label="Куда"
            rules={[{ required: true, message: "Выберите город назначения" }]}
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
              notFoundContent={!search || loading ? null : "Ничего не найдено"}
              onSelect={(_value, option) => {
                setSearch("");
                setCities([]);
                setToCity(option.key);
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
              placeholder="Выберите город"
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
            label="Отправление"
            rules={[{ required: true, message: "Выберите дату отправления" }]}
          >
            <DatePicker
              inputReadOnly={true}
              style={{ width: "100%" }}
              minDate={today}
              onChange={(value) => {
                form.setFieldsValue({ from_date: value });
              }}
            />
          </Form.Item>

          <Form.Item
            name="to_date"
            label="Прибытие"
            rules={[{ required: true, message: "Выберите дату прибытия" }]}
          >
            <DatePicker
              inputReadOnly={true}
              style={{ width: "100%" }}
              minDate={today}
              onChange={(value) => {
                form.setFieldsValue({ to_date: value });
              }}
            />
          </Form.Item>
        </div>

        <div style={{ display: "table", width: "100%" }}>
          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                padding: "8px 16px 8px 0",
                textAlign: "left",
              }}
            >
              <label htmlFor="weight">Вес</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="weight"
                rules={[{ required: true, message: "Укажите вес" }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="weight"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="кг"
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                padding: "8px 16px 8px 0",
                textAlign: "left",
              }}
            >
              <label htmlFor="width">Ширина</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="width"
                rules={[{ required: true, message: "Укажите ширину" }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="width"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="см"
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                padding: "8px 16px 8px 0",
                textAlign: "left",
              }}
            >
              <label htmlFor="height">Высота</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="height"
                rules={[{ required: true, message: "Укажите высоту" }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="height"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="см"
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: "table-row" }}>
            <div
              style={{
                display: "table-cell",
                padding: "8px 16px 8px 0",
                textAlign: "left",
              }}
            >
              <label htmlFor="length">Длина</label>
            </div>
            <div style={{ display: "table-cell" }}>
              <Form.Item
                name="length"
                rules={[{ required: true, message: "Укажите длину" }]}
                style={{ marginBottom: "16px" }}
              >
                <InputNumber
                  id="length"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="см"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: "Добавьте описание заказа" }]}
        >
          <TextArea rows={4} placeholder="Опишите детали заказа" />
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
            {mode === FormModes.CREATE ? "Создать заказ" : "Обновить заказ"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OrderForm;
