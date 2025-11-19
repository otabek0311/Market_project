export interface CartSummaryDto {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
  subtotal: number;
}

export interface CheckoutRequestDto {
  shipping_address?: string;
  payment_method?: string;
}

export interface CheckoutResponseDto {
  message: string;
  order_details: {
    items: CartSummaryDto[];
    total_items: number;
    total_price: number;
    orders_created: number;
  };
}

export interface CartDetailDto {
  items: CartSummaryDto[];
  total_items: number;
  total_price: number;
}
