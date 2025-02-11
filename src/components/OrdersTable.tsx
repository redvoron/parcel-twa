import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Order, ordersApi, GetOrdersParams } from "../data/orders";
import {
  OrdersStatus,
  OrdersTypes,
  OrdersViewType,
  OrdersTableColumns,
} from "../utils/constants";
import { Table, Tag } from "antd";
import type { TableProps } from "antd";

export type OrdersTableProps = {
  viewType: OrdersViewType;
  userId?: string;
  extraParams?: GetOrdersParams;
};

const DEFAULT_VISIBLE_COLUMNS = [
  OrdersTableColumns.CREATED_AT,
  OrdersTableColumns.UPDATED_AT,
];
const OrdersTable = ({ viewType, userId, extraParams }: OrdersTableProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<Order[]>([]);
  const [ordersTypes, setOrdersTypes] = useState<OrdersTypes[]>([]);
  const [ordersStatuses, setOrdersStatuses] = useState<OrdersStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<OrdersTableColumns[]>(
    DEFAULT_VISIBLE_COLUMNS
  );
  const ordersColumns: TableProps<Order>["columns"] = [
    {
      title: "Тип",
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
      title: "Статус",
      dataIndex: "action",
      key: "action",
      hidden: !visibleColumns.includes(OrdersTableColumns.STATUS),
      render: (text: string) => {
        return (
          <Tag color={text === OrdersStatus.DELIVERING ? "blue" : "green"}>
            {t(text)}
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
      title: "Дата создания",
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
      title: "Дата обновления",
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
    if (
      viewType === OrdersViewType.MY ||
      viewType === OrdersViewType.USER
    ) {
      columns.push(OrdersTableColumns.STATUS);
      columns.push(OrdersTableColumns.TYPE);
    }
    setVisibleColumns(columns);
  };

  const getData = async () => {
    setLoading(true);
    const data = await ordersApi.getOrders(getOrdersTableParams);
    console.log(data);
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
    <Table
      columns={ordersColumns}
      dataSource={data}
      loading={loading}
      rowKey={(record) => record.order_id}
    />
  );
};

export default OrdersTable;
