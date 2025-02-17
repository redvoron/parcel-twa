import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Order, ordersApi, GetOrdersParams } from "../data/orders";
import {
  OrdersStatus,
  OrdersTypes,
  OrdersViewType,
  OrdersTableColumns,
  Lang,
} from "../utils/constants";
import { Space, Table, Tag, Button } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import { ArrowRightOutlined, CalendarOutlined, CloseOutlined, InfoCircleOutlined, MessageOutlined } from "@ant-design/icons";
import Flag from "react-world-flags";
import { GlobalContext } from "../main";
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
  const [data, setData] = useState<Order[]>([]);
  const [ordersTypes, setOrdersTypes] = useState<OrdersTypes[]>([]);
  const [ordersStatuses, setOrdersStatuses] = useState<OrdersStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

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
                <Tag
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                  }}
                >
                  <Flag
                    code={record.from_city_data?.country_code}
                    style={{ width: 16, height: 12, marginRight: 4 }}
                  />
                  {record.from_city_data?.[
                    cityNameProp as keyof typeof record.from_city_data
                  ] || t("city_any")}
                </Tag>
              </div>
              
              <Tag style={{ fontSize: 14 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
                {record.data.from_date
                  ? new Date(record.data.from_date).toLocaleDateString()
                  : t("date_open")}
              </Tag>
            </Space>
            <ArrowRightOutlined style={{ marginRight: 4, color: "#007bff" }} />
            <Space direction="vertical">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Tag
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                  }}
                >
                  <Flag
                    code={record.to_city_data?.country_code}
                    style={{ width: 16, height: 12, marginRight: 4 }}
                  />
                  {record.to_city_data?.[
                    cityNameProp as keyof typeof record.to_city_data
                  ] || t("city_any")}
                </Tag>
              </div>
              <Tag style={{ fontSize: 14 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
              {record.data.to_date
                ? new Date(record.data.to_date).toLocaleDateString()
                : t("date_open")}
            </Tag>
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
      title: t("created_at"),
      dataIndex: "created_at",
      key: "created_at",
      hidden: !visibleColumns.includes(OrdersTableColumns.CREATED_AT),
      responsive: ["md"],
      render: (text: string) => {
        return new Date(text).toLocaleString();
      },
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: t("updated_at"),
      dataIndex: "updated_at",
      key: "updated_at",
      hidden: !visibleColumns.includes(OrdersTableColumns.UPDATED_AT),
      render: (text: string) => {
        return new Date(text).toLocaleString();
      },
      sorter: (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    },
    {
      title: '...',
      dataIndex: "actions",
      key: "actions",
      hidden: !visibleColumns.includes(OrdersTableColumns.ACTION),
      render: (_text, record: Order) => {
        return <Space direction="vertical" data-column="actions">
          <Button type="link" icon={<MessageOutlined />} onClick={() => onMessageClick(record)}/>
        </Space>;
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

  const onMessageClick = (record: Order) => {
    console.log(record);
  }

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
    changeVisibleColumns();
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
          expandedRowRender: (record) =>  {
            const description = record.data.description || t("no_description");
            const sizes_info = record.type === OrdersTypes.PICKUP ?
              record.data.sizes?.map((size) => t(`size_${size}`)).join(", ") || "" 
              : record.data.weight + t('kg') + ", " + record.data.height + "x" + record.data.width + "x" + record.data.length + t('cm');
            return (
              <Space direction="vertical">
               {sizes_info && <span>
                {t("sizes") + ": " + sizes_info}
                </span>}
                <span>
                {description}
                </span>

              </Space>
            );
          },
          expandIcon:({ expanded, onExpand, record }) =>
            expanded ? (
              <CloseOutlined onClick={e => onExpand(record, e)} />
            ) : (
              <InfoCircleOutlined onClick={e => onExpand(record, e)} />
            ),
        }}
        onRow={(record) => ({
          onClick: (e) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-column="actions"]')) {
              return;
            }
            const newExpandedRows = expandedRowKeys.includes(record.order_id)
              ? expandedRowKeys.filter(key => key !== record.order_id)
              : [...expandedRowKeys, record.order_id];
            setExpandedRowKeys(newExpandedRows);
          },
          style: { cursor: 'pointer' }
        })}
        expandedRowKeys={expandedRowKeys}
        dataSource={data}
        loading={loading}
        rowKey={(record) => record.order_id}
        scroll={{ x: "100%" }}
        size="small"
        pagination={{
          responsive: true,
          position: ["bottomCenter"],
          size: "small",
        }}
      />
    </>
  );
};

export default OrdersTable;
