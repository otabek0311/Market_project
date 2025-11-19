export interface AddToCartDto {
  product_id: number;
  quantity: number;
}

export interface CartItemDto {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface CartResponseDto {
  items: CartItemDto[];
  total_price: number;
  total_items: number;
}
