import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  DatePicker,
  InputNumber,
  Select,
  Popconfirm,
  message,
  Spin,
  Segmented,
  Checkbox,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { ordersApi } from "../data/orders";
import type {
  OrderData,
  CitySearchResult,
  CargoType,
  SizesType,
} from "../data/orders";
import dayjs from "dayjs";
import Flag from "react-world-flags";
import { FormModes, Lang, OrdersTypes } from "../utils/constants";
import { GlobalContext } from "../main";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
const { Title } = Typography;
const { TextArea } = Input;

const today = dayjs();
interface OrderFormProps {
  type?: OrdersTypes;
  mode: FormModes;
  orderId?: number;
}

const OrderForm: FC<OrderFormProps> = ({ type, mode, orderId }) => {
  const [form] = Form.useForm();
  const [cities, setCities] = useState<CitySearchResult[]>([]);
  const [search, setSearch] = useState<string>("");
  const [fromCity, setFromCity] = useState<number>(0);
  const [toCity, setToCity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [sizesTypes, setSizesTypes] = useState<SizesType[]>([]);
  const [isExactSizes, setIsExactSizes] = useState<boolean>(true);
  const { userContext } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<OrdersTypes>(
    type || OrdersTypes.DELIVERY
  );
  const { t } = useTranslation();
  const lang = userContext?.lang || Lang.EN;
  //TODO: remove mock userId
  const userId = userContext?.data || "19b31340-f88c-48dc-bc97-cbe80427ba37";

  const onFinish = async (values: OrderData) => {
    let finishResult = false;
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



    const prepOrderData: OrderData = {
      ...formattedValues,
    };
    prepOrderData.from_city = fromCity;
    prepOrderData.to_city = toCity;

    if (mode === FormModes.CREATE) {
      if (userId && type) {
        const order = await ordersApi.createOrder(userId, type, prepOrderData);
        if (order) {
          message.success(t(`order-created-${orderType}`));
          finishResult = true;
        } else {
          message.error(t(`order-create-error-${orderType}`));
        }
      }
    } else {
      if (orderId) {
        const order = await ordersApi.updateOrder(orderId, prepOrderData);
        if (order) {
          message.success(t(`order-updated-${orderType}`));
          finishResult = true;
        } else {
          message.error(t(`order-update-error-${orderType}`));
        }
      }
    }
    setOrderLoading(false);
    if (finishResult) {
      navigate("/orders/my");
    }
  };
  const handleSearch = async (value: string) => {
    setSearch(value);
    setLoading(true);
    const cities = await ordersApi.searchCities(search);
    setCities(cities);
    setLoading(false);
  };

  const handleCancel = () => {
    navigate("/orders/my");
  };

  const setFieldsValue = async (values: OrderData) => {
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
      self_service: values.self_service,
      cargo_types: values.cargo_types,
      description: values.description,
      sizes: values.sizes,
    });
  };
  const getOrder = async () => {
    await setOrderLoading(true);
    if (orderId) {
      const order = await ordersApi.getOrders({ orderId: orderId });
      //TODO check if can be edited
      const orderData = order?.data[0]?.data;
      setOrderType(order?.data[0]?.type);
      if (orderData) {
        setFieldsValue(orderData);
      }
    }
    await setOrderLoading(false);
  };


  const getTitle = useMemo(() => {
    return (
      t(`order-${orderType}`) +
      (mode === FormModes.CREATE ? "" : ` #${orderId}`)
    );
  }, [mode, orderId, orderType]);

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
    const getCargoTypes = async () => {
      await setOrderLoading(true);
      const cargoTypes = await ordersApi.getCargoTypes();
      setCargoTypes(cargoTypes);
      await setOrderLoading(false);
    };
    const getSizesTypes = async () => {
      await setOrderLoading(true);
      const sizesTypes = await ordersApi.getSizesTypes();
      setSizesTypes(sizesTypes);
      await setOrderLoading(false);
    };
    getCargoTypes();
    getSizesTypes();
  }, [mode, orderId]);

  return (
    <div>
      <Title level={2}>{getTitle}</Title>
      <Spin
        spinning={orderLoading}
        indicator={<LoadingOutlined style={{ fontSize: 72 }} spin />}
      >
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
                    <div
                      style={{ display: "flex", alignItems: "left", gap: 10 }}
                    >
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
                    <div
                      style={{ display: "flex", alignItems: "left", gap: 10 }}
                    >
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

          {orderType === OrdersTypes.DELIVERY && (
            <div
              style={{ display: "flex", gap: "8px", flexDirection: "column" }}
            >
              <Segmented
                options={[
                  { label: t("exact-sizes"), value: true },
                  { label: t("approximate-sizes"), value: false },
                ]}
                size="large"
                value={isExactSizes}
                style={{ width: "min-content" }}
                onChange={(value) => setIsExactSizes(value)}
              />
              {isExactSizes ? (
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
              ) : (
                <div>
                  <Form.Item
                    name="sizes"
                    rules={[{ required: true, message: t("sizes-error") }]}
                  >
                    <Select
                      size="large"
                      allowClear
                      style={{ width: "100%", textAlign: "left" }}
                      placeholder={t("sizes-placeholder")}
                      defaultValue={[]}
                      showSearch={false}
                      placement="topLeft"
                      options={sizesTypes.map((size) => ({
                        key: size.id,
                        value: size.id,
                        label: size[`name_${lang}`],
                      }))}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          )}
          {orderType === OrdersTypes.PICKUP && (
            <Form.Item
              name="sizes"
              label={t("sizes_to_pickup")}
              rules={[{ required: true, message: t("sizes-error") }]}
            >
              <Select
                size="large"
                mode="multiple"
                allowClear
                style={{ width: "100%", textAlign: "left" }}
                placeholder={t("sizes-placeholder")}
                defaultValue={[]}
                showSearch={false}
                placement="topLeft"
                options={sizesTypes.map((size) => ({
                  key: size.id,
                  value: size.id,
                  label: size[`name_${lang}`],
                }))}
              />
            </Form.Item>
          )}
          {orderType === OrdersTypes.DELIVERY && (
            <Form.Item
              name="cargo_types"
              label={t("cargo-types")}
              rules={[{ required: true, message: t("cargo-type-error") }]}
            >
              <Select
                size="large"
                mode="multiple"
                allowClear
                style={{ width: "100%", textAlign: "left" }}
                placeholder={t("cargo-type-placeholder")}
                defaultValue={[]}
                showSearch={false}
                placement="topLeft"
                options={cargoTypes.map((type) => ({
                  key: type.id,
                  value: type.id,
                  label: type[`name_${lang}`],
                }))}
              />
            </Form.Item>
          )}
          {orderType === OrdersTypes.DELIVERY && (
            <Form.Item
              name="ready_to_send"
              valuePropName="checked"
              style={{ textAlign: "left" }}
            >
              <Checkbox>
                <span style={{ fontSize: "16px" }}>{t("ready-to-send")}</span>
              </Checkbox>
            </Form.Item>
          )}
          {orderType === OrdersTypes.PICKUP && (
            <Form.Item
              name="ready_to_receive"
              valuePropName="checked"
              style={{ textAlign: "left" }}
            >
              <Checkbox>
                <span style={{ fontSize: "16px" }}>
                  {t("ready-to-receive")}
                </span>
              </Checkbox>
            </Form.Item>
          )}
          <Form.Item
            name="self_service"
            valuePropName="checked"
            style={{ textAlign: "left" }}
          >
            <Checkbox>
              <span style={{ fontSize: "16px" }}>
                {t(`self-service-${orderType}`)}
              </span>
            </Checkbox>
          </Form.Item>
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
      </Spin>
    </div>
  );
};

export default OrderForm;
