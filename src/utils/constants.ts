import WebApp from "@twa-dev/sdk";

export enum OrdersStatus {
  CREATED = "created",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DELIVERED = "delivered",
  DELIVERING = "delivering",
  DELETED = "deleted",
}

export enum OrdersTypes {
  DELIVERY = "delivery",
  PICKUP = "pickup",
}

export enum UserActions {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}

export enum OrdersViewType {
  DELIVERY = "delivery",
  PICKUP = "pickup",
  MY = "my",
  USER = "user",
}

export enum OrdersTableColumns {
  TYPE = "type",
  STATUS = "status",
  ACTION = "action",
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
}

export type AuthResult = {
  result: AuthResultType;
  message: string;
  data: string;
}

export type UserContext = AuthResult & {
  lang: Lang;
}

export enum AuthResultType {
  SUCCESS = "success",
  ERROR = "error",
}

export enum FormModes {
  CREATE = "create",
  EDIT = "edit",
}
export interface GlobalContextType {
  webApp: typeof WebApp;
  userContext: UserContext | null;
}

export enum Lang {
  RU = "ru",
  EN = "en",
}