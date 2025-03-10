import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Order,
  ordersApi,
  GetOrdersParams,
  CargoType,
  SizesType,
} from "../data/orders";
import {
  CalendarClock,
  Eye,
  MessageCircleMore,
  Pencil,
  Plane,
} from "lucide-react";
import {
  OrdersStatus,
  OrdersTypes,
  OrdersViewType,
  OrdersTableColumns,
  Lang,
} from "../utils/constants";
import { Space, Table, Tag, Button, Badge } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import Flag from "react-world-flags";
import { GlobalContext } from "../main";
import { useNavigate } from "react-router-dom";
import { MessageCount, messagesApi } from "../data/messages";
export type OrdersTableProps = {
  viewType: OrdersViewType;
  userId?: string;
  extraParams?: GetOrdersParams;
};

const DEFAULT_VISIBLE_COLUMNS = [
  //OrdersTableColumns.CREATED_AT,
  OrdersTableColumns.DESTINATION,
  // OrdersTableColumns.UPDATED_AT,
  OrdersTableColumns.ACTION,
];

const OrdersTable = ({ viewType, userId, extraParams }: OrdersTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<Order[]>([]);
  const [ordersTypes, setOrdersTypes] = useState<OrdersTypes[]>([]);
  const [ordersStatuses, setOrdersStatuses] = useState<OrdersStatus[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [sizesTypes, setSizesTypes] = useState<SizesType[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [messagesCount, setMessagesCount] = useState<MessageCount[]>([]);
  const { userContext } = useContext(GlobalContext);
  const [visibleColumns, setVisibleColumns] = useState<OrdersTableColumns[]>(
    DEFAULT_VISIBLE_COLUMNS
  );
  const lang: Lang = userContext?.lang || Lang.RU;

  const ordersColumns: TableProps<Order>["columns"] = [
    {
      title: t("destination"),
      dataIndex: "data",
      key: "data",
      hidden: !visibleColumns.includes(OrdersTableColumns.DESTINATION),
      render: (_text: string, record: Order) => {
        const cityNameProp = `name_${lang}`;
        return (
          <Space direction="horizontal">
            <Space direction="vertical">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Flag
                  code={record.from_city_data?.country_code}
                  style={{ width: 16, height: 12, marginRight: 4 }}
                />
                <Tag
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                  }}
                >
                  {record.from_city_data?.[
                    cityNameProp as keyof typeof record.from_city_data
                  ] || t("city_any")}
                </Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <CalendarClock style={{ marginRight: 4, width: 16 }} />
                <Tag style={{ fontSize: 14 }}>
                  {record.data.from_date
                    ? new Date(record.data.from_date).toLocaleDateString()
                    : t("date_open")}
                </Tag>
              </div>
            </Space>
            <Space direction="vertical">
              <Plane
                style={{ color: "#6B7280", marginRight: 4, marginTop: 4 }}
              />
            </Space>

            <Space direction="vertical">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Flag
                  code={record.to_city_data?.country_code}
                  style={{ width: 16, height: 12, marginRight: 4 }}
                />
                <Tag
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                  }}
                >
                  {record.to_city_data?.[
                    cityNameProp as keyof typeof record.to_city_data
                  ] || t("city_any")}
                </Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <CalendarClock style={{ marginRight: 4, width: 16 }} />
                <Tag style={{ fontSize: 14 }}>
                  {record.data.to_date
                    ? new Date(record.data.to_date).toLocaleDateString()
                    : t("date_open")}
                </Tag>
              </div>
            </Space>
          </Space>
        );
      },
    },
    {
      title: t("type"),
      dataIndex: "type",
      key: "type",
      hidden: !visibleColumns.includes(OrdersTableColumns.TYPE),
      render: (text: string) => {
        return (
          <Tag color={text === OrdersTypes.DELIVERY ? "blue" : "green"}>
            {t(text)}
          </Tag>
        );
      },
      sorter: (a, b) => a.type.localeCompare(b.type),
      filters: [
        ...ordersTypes.map((type) => ({
          text: t(type),
          value: type,
        })),
      ],
    },
    {
      title: t("status"),
      dataIndex: "action",
      key: "action",
      hidden: !visibleColumns.includes(OrdersTableColumns.STATUS),
      render: (text: string) => {
        return (
          <Tag color={text === OrdersStatus.DELIVERING ? "blue" : "green"}>
            {t(`order_status_${text}`)}
          </Tag>
        );
      },
      sorter: (a, b) => a.action.localeCompare(b.action),
      filters: [
        ...ordersStatuses.map((status) => ({
          text: t(status),
          value: status,
        })),
      ],
    },
    {
      title: "...",
      dataIndex: "actions",
      key: "actions",
      fixed: "right",
      hidden: !visibleColumns.includes(OrdersTableColumns.ACTION),
      render: (_text, record: Order) => {
        const isMyOrder = record.creator_id === userId;
        // TODO Check messages
        const hasMessages = messagesCount.some(
          (message) => message.orderId === record.order_id && message.unread > 0
        );
        const canBeEditable =
          viewType === OrdersViewType.MY &&
          record.action === OrdersStatus.CREATED &&
          !hasMessages;
        return (
          <Space direction="vertical" data-column="actions">
            {viewType !== OrdersViewType.MY && !isMyOrder && (
              <Button
                type="link"
                icon={<MessageCircleMore />}
                onClick={(e) => onMessageClick(record, e)}
              />
            )}
            {canBeEditable && (
              <Button
                type="link"
                icon={<Pencil />}
                onClick={(e) => onEditClick(record, e)}
              />
            )}
            {!canBeEditable && isMyOrder && (
              <Badge
                size="small"
                count={
                  messagesCount.find(
                    (message) => message.orderId === record.order_id
                  )?.unread || 0 
                }
              >
                <Button
                  type="link"
                  icon={<Eye />}
                  onClick={(e) => onViewClick(record, e)}
                />
              </Badge>
            )}
          </Space>
        );
      },
    },
  ];
  const getOrdersTableParams = useMemo(() => {
    const ordersGetParams: GetOrdersParams = {
      ...extraParams,
    };
    switch (viewType) {
      case OrdersViewType.DELIVERY:
        ordersGetParams.action = [OrdersStatus.CREATED];
        ordersGetParams.type = OrdersTypes.DELIVERY;
        break;
      case OrdersViewType.PICKUP:
        ordersGetParams.action = [OrdersStatus.CREATED];
        ordersGetParams.type = OrdersTypes.PICKUP;
        break;
      case OrdersViewType.MY:
        ordersGetParams.userId = userId;
        break;
      case OrdersViewType.USER:
        ordersGetParams.userId = userId;
        break;
    }

    return ordersGetParams;
  }, [viewType, userId]);

  const getMessagesCount = async () => {
    if (userId) {
      const messagesCount = await messagesApi.getMessagesCountForUser(userId);
      setMessagesCount(messagesCount);
    }
  };
  const onMessageClick = (record: Order, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    navigate(`/orders/message/${record.order_id}`);
  };

  const onEditClick = (record: Order, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    navigate(`/orders/edit/${record.order_id}`);
  };

  const onViewClick = (record: Order, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    navigate(`/orders/view/${record.order_id}`);
  };
  const changeVisibleColumns = () => {
    const columns = DEFAULT_VISIBLE_COLUMNS;
    if (viewType === OrdersViewType.MY || viewType === OrdersViewType.USER) {
      // columns.push(OrdersTableColumns.STATUS);
      // columns.push(OrdersTableColumns.TYPE);
    }
    setVisibleColumns(columns);
  };

  const getData = async () => {
    setLoading(true);
    const data = await ordersApi.getOrders(getOrdersTableParams);
    setData(data.data);
    setOrdersTypes(data.ordersTypes);
    setOrdersStatuses(data.ordersStatuses);
    const cargoTypes = await ordersApi.getCargoTypes();
    setCargoTypes(cargoTypes);
    const sizesTypes = await ordersApi.getSizesTypes();
    setSizesTypes(sizesTypes);
    changeVisibleColumns();
    getMessagesCount();
    setLoading(false);
  };
  const getTableHeader = useMemo(() => {
    return t(`orders-${viewType}`);
  }, [viewType, userId]);

  useEffect(() => {
    getData();
  }, [userId, viewType]);

  return (
    <>
      <Title level={2}>{getTableHeader}</Title>
      <Table
        columns={ordersColumns}
        expandable={{
          expandedRowRender: (record) => {
            const description = record.data.description || t("no_description");
            const sizes_info =
              record.type === OrdersTypes.PICKUP
                ? record.data.sizes
                    ?.map((size) => t(`size_${size}`))
                    .join(", ") || ""
                : record.data.weight &&
                  record.data.height &&
                  record.data.width &&
                  record.data.length
                ? record.data.weight +
                  t("kg") +
                  ", " +
                  record.data.height +
                  "x" +
                  record.data.width +
                  "x" +
                  record.data.length +
                  t("cm")
                : "";
            const cargo_types_info =
              record.data.cargo_types
                ?.map(
                  (type) =>
                    cargoTypes.find((cargoType) => cargoType.id === type)?.[
                      `name_${lang}`
                    ] || ""
                )
                .join(", ") || "";
            const sizes_types_info =
              record.data.sizes
                ?.map(
                  (type) =>
                    sizesTypes.find((sizeType) => sizeType.id === type)?.[
                      `name_${lang}`
                    ] || ""
                )
                .join(", ") || "";
            return (
              <Space direction="vertical">
                {sizes_info && <span>{t("sizes") + ": " + sizes_info}</span>}
                {sizes_types_info && (
                  <span>{t("sizes-types") + ": " + sizes_types_info}</span>
                )}
                {cargo_types_info && (
                  <span>{t("cargo-types") + ": " + cargo_types_info}</span>
                )}

                <span>{description}</span>
              </Space>
            );
          },
          showExpandColumn: false,
          expandRowByClick: true,
          expandedRowKeys: expandedRowKeys,
          onExpand: (expanded, record) => {
            if (expanded) {
              setExpandedRowKeys([record.order_id]);
            } else {
              setExpandedRowKeys([]);
            }
          },
        }}
        dataSource={data}
        loading={loading}
        rowKey={(record) => record.order_id}
        scroll={{ x: "max-content", y: "calc(100vh - 246px)" }}
        size="small"
        pagination={{
          responsive: true,
          position: ["bottomCenter"],
          size: "small",
          hideOnSinglePage: true,
        }}
      />
    </>
  );
};

export default OrdersTable;
