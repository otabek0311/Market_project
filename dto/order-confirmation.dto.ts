export interface ShippingDetailsDto {
  full_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  postal_code: string;
}

export interface OrderConfirmationRequestDto {
  shipping_details: ShippingDetailsDto;
  payment_method: string;
}

export interface OrderConfirmationResponseDto {
  message: string;
  order_summary: {
    order_id: number;
    items: Array<{
      product_id: number;
      product_name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>;
    total_price: number;
    shipping_details: ShippingDetailsDto;
    payment_method: string;
    status: string;
    createdAt: Date;
  };
}
