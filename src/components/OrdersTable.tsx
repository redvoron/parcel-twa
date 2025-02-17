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
import { Space, Table, Tag, Typography } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
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
  OrdersTableColumns.DATES,
  OrdersTableColumns.DESCRIPTION,
  // OrdersTableColumns.UPDATED_AT,
  OrdersTableColumns.ACTION,
];

const OrdersTable = ({ viewType, userId, extraParams }: OrdersTableProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<Order[]>([]);
  const [ordersTypes, setOrdersTypes] = useState<OrdersTypes[]>([]);
  const [ordersStatuses, setOrdersStatuses] = useState<OrdersStatus[]>([]);
  const [loading, setLoading] = useState(false);
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
          <Space direction="vertical">
              <div style={{display: 'flex', alignItems: 'center'}}>
               <ArrowLeftOutlined style={{marginRight: 4, color: 'green'}}/>
                <Tag style={{display: 'flex', alignItems: 'center', fontSize: 14}}>
                  <Flag code={record.from_city_data?.country_code} style={{width: 16, height: 12, marginRight: 4}}/>
                  {record.from_city_data?.[cityNameProp as keyof typeof record.from_city_data] || t("city_any")}
                </Tag>
              </div>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <ArrowRightOutlined style={{marginRight: 4, color: 'blue'}} />
                <Tag style={{display: 'flex', alignItems: 'center', fontSize: 14}}>
                  <Flag code={record.to_city_data?.country_code} style={{width: 16, height: 12, marginRight: 4}}/>
                  {record.to_city_data?.[cityNameProp as keyof typeof record.to_city_data] || t("city_any")}
                </Tag>
              </div>
          </Space>
        );
      },  
    },
    {
      title: t("dates"),
      dataIndex: "data",
      key: "dates",
      hidden: !visibleColumns.includes(OrdersTableColumns.DATES),
        render: (_text: string, record: Order) => {
        return <Space direction="vertical">
          <Tag style={{fontSize: 14}}>
            {record.data.from_date ? new Date(record.data.from_date).toLocaleDateString() : t("date_open")}
          </Tag>
          <Tag style={{fontSize: 14}}>
            {record.data.to_date ? new Date(record.data.to_date).toLocaleDateString() : t("date_open")}
          </Tag>
        </Space>
      },
      sorter: (a, b) => {
        const aDate = a.data.from_date ? new Date(a.data.from_date).getTime() : 0;
        const bDate = b.data.from_date ? new Date(b.data.from_date).getTime() : 0;
        return aDate - bDate;
      },
    },
    {
      title: t("description"),
      dataIndex: "data",
      key: "description",
      hidden: !visibleColumns.includes(OrdersTableColumns.DESCRIPTION),
      render: (_text: string, record: Order) => {
        return       <Typography.Paragraph
        ellipsis={{
          rows: 2,
          expandable: 'collapsible',
          expanded: false,
          onExpand: (_, info) => {
            console.log(info);
          },
        }}
      >{record.data.description}</Typography.Paragraph>;
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
        ordersGetParams.action = [OrdersStatus.DELIVERING];
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

  const changeVisibleColumns = () => {
    const columns = DEFAULT_VISIBLE_COLUMNS;
    if (viewType === OrdersViewType.MY || viewType === OrdersViewType.USER) {
      columns.push(OrdersTableColumns.STATUS);
      columns.push(OrdersTableColumns.TYPE);
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

  useEffect(() => {
    getData();
  }, [userId, viewType]);

  return (
    <>
      <Title level={2}>---</Title>
      <Table
        columns={ordersColumns}
        dataSource={data}
        loading={loading}
        rowKey={(record) => record.order_id}
        scroll={{ x: '100%' }}
        size="small"
        pagination={{
          responsive: true,
          position: ['bottomCenter'],
          size: 'small'
        }}
      />
    </>
  );
};

export default OrdersTable;
