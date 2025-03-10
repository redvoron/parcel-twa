import supabase from "./supabaseClient";
import { Lang, OrdersStatus, OrdersTypes } from "../utils/constants";
export type Order = {
  order_id: number
  type: OrdersTypes
  created_at: string
  updated_at: string
  action: OrdersStatus
  courier_id: string
  customer_id: string
  creator_id: string
  data: OrderData,
  from_city_data?: City,
  to_city_data?: City
}

export type OrderData = {
  from_city?: number
  to_city?: number
  from_date?: string
  to_date?: string
  weight?: number
  width?: number
  height?: number
  length?: number
  description?: string
  price?: number
  ready_to_send?: boolean
  ready_to_receive?: boolean,
  sizes?: number[]
  cargo_types?: number[]
  cargo_type_description?: string
  self_service?: boolean
}

export type OrderAction = {
  id: number
  order_id: number
  action: OrdersStatus
}

export interface GetOrdersParams {
  sortBy?: string,
  sortOrder?: string,
  filters?: { field: string; value: string }[],
  page?: number,
  pageSize?: number,
  action?: OrdersStatus[],
  type?: OrdersTypes,
  userId?: string,
  role?: OrdersTypes,
  orderId?: number
}

export type City = {
  id: number
  name_ru: string
  name_en: string
  country_ru: string
  country_en: string
  country_code: string
  lat: number
  lon: number
  population: number
}

export type CitySearchResult = {
  id: number
  city_ru: string
  city_en: string,
  country_code: string
}

export type CargoType = {
  id: number
  name_ru: string
  name_en: string
}

export type SizesType = {
  id: number
  name_ru: string
  name_en: string
}

export const ordersApi = {
  // Создание нового заказа
  async createOrder(
    userId: string,
    type: OrdersTypes,
    orderData: OrderData
  ): Promise<Order | null> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ type: type, data: orderData })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return null
    }

    if (order) {
      const { error: linkError } = await supabase
        .from('users_to_orders')
        .insert({
          customer_id: type === OrdersTypes.DELIVERY ? userId : null,
          courier_id: type === OrdersTypes.DELIVERY ? null : userId,
          order_id: order.id,
        })

      if (linkError) {
        console.error('Error linking user to order:', linkError)
        return null
      }
    }

    return order
  },
  async updateOrder(orderId: number, orderData: OrderData): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .update({data: orderData})
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error)
      return null
    }
    return data
  },
  // Получить заказ по id
  async getOrderById(orderId: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)  
      .single();

    if (error) {
      console.error('Error fetching order by id:', error)
      return null
    }

    return data
  },
  // Получить OtherUserId для заказа
  async getOtherUserIdForOrder(orderId: number, myUserId: string): Promise<string> {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_id, courier_id')
      .eq('id', orderId)  
      .single();

    if (error) throw error;
    return myUserId === data.customer_id ? data.courier_id : data.customer_id;
  },


  // Получение статуса заказа
  async getOrderStatus(orderId: number): Promise<OrderAction | null> {
    const { data, error } = await supabase
      .from('orders_status')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order status:', error)
      return null
    }

    return data
  },

  // Обновление статуса заказа
  async updateOrderStatus(
    orderId: number,
    action: string
  ): Promise<OrderAction | null> {
    const { data, error } = await supabase
      .from('orders_actions')
      .insert({
        order_id: orderId,
        action
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating order status:', error)
      return null
    }

    return data
  },

  // Назначение курьера на заказ
  async assignCourier(
    orderId: number,
    courierId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('users_to_orders')
      .update({ courier_id: courierId })
      .eq('order_id', orderId)

    if (error) {
      console.error('Error assigning courier:', error)
      return false
    }

    return true
  },

  // Назначение заказчика на заказ
  async assignCustomer(
    orderId: number,
    customerId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('users_to_orders')
      .update({ customer_id: customerId })
      .eq('order_id', orderId)

    if (error) {
      console.error('Error assigning customer:', error)
      return false
    }

    return true
  },

  // Получение действий заказа
  async getOrderActions(orderId: number): Promise<OrderAction[]> {
    const { data, error } = await supabase
      .from('orders_actions')
      .select('*')
      .eq('order_id', orderId)

    if (error) {
      console.error('Error fetching order actions:', error)
      return []
    }

    return data
  },

  // Получение списка заказов с разной сортировкой и филтром по остальным входным параметрам
  async getOrders({
    sortBy = 'created_at',
    sortOrder = 'desc',
    filters,
    page,
    pageSize,
    action,
    type,
    userId,
    role,
    orderId
  }: GetOrdersParams): Promise<{ data: Order[]; total: number; ordersTypes: OrdersTypes[]; ordersStatuses: OrdersStatus[] }> {
    let query = supabase
      .from('orders_full')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (page && pageSize) {
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
    }

    if (action) {
      query = query.in('action', action);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (userId) {
      query = query.or(`customer_id.eq.${userId},courier_id.eq.${userId}`);
    }

    if (role) {
      query = query.eq('type', role);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    if (filters?.length) {
      filters.forEach(({ field, value }) => {
        query = query.eq(`data->${field}`, value);
      });
    }



    const { data, error, count } = await query;

    if (error) {
      console.error('Ошибка при получении заказов:', error);
      return { data: [], total: 0, ordersTypes: [], ordersStatuses: [] };
    }

    return { 
      data: (data || []) as Order[], 
      total: count || 0,
      ordersTypes: data.map(order => order.type),
      ordersStatuses: data.map(order => order.action),
    };
  },

  // Получение списка городов
  async getCities(): Promise<City[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')

    if (error) {
      console.error('Error fetching cities:', error)
      return []
    }

    return data
  },

  // Получение города по id
  async getCityById(id: number): Promise<City | null> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching city by id:', error)
      return null
    } 

    return data
  },
  // поиск города по первым буквам
  async searchCities(query: string): Promise<CitySearchResult[]> {
    const { data, error } = await supabase
      .rpc('search_cities', { search_query: query })

    if (error) {
      console.error('Ошибка поиска городов:', error)
      return []
    }

    return data as CitySearchResult[]
  },
  async getCityName(id: number, lang: Lang): Promise<{city_name: string, country_code: string}> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching city name:', error)
      return {city_name: '', country_code: ''}
    }

    return {
      city_name: lang === Lang.RU ? `${data.name_ru}, ${data.country_ru}` : `${data.name_en}, ${data.country_en}`,
      country_code: data.country_code
    }
  },
  async getCargoTypes(): Promise<CargoType[]> {
    const { data, error } = await supabase
      .from('cargo_types')
      .select('*')

    if (error) {
      console.error('Error fetching cargo types:', error)
      return []
    }

    return data
  },
  async getSizesTypes(): Promise<SizesType[]> {
    const { data, error } = await supabase
      .from('sizes_types')
      .select('*')
      
    if (error) {
      console.error('Error fetching sizes types:', error)
      return []
    }

    return data
  }
}