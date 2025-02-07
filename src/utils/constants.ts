import WebApp from "@twa-dev/sdk";

export enum OrdersStatus {
  PENDING = "pending",
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

export type AuthResult = {
  result: AuthResultType;
  message: string;
  data: unknown;
}

export enum AuthResultType {
  SUCCESS = "success",
  ERROR = "error",
}

export interface GlobalContextType {
  webApp: typeof WebApp;
  userContext: AuthResult | null;
}