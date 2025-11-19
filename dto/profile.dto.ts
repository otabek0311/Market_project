export interface UpdateProfileDto {
  username?: string;
  phone?: string;
  profile_image?: string;
}

export interface ProfileDto {
  id: number;
  username: string;
  email: string;
  phone?: string;
  profile_image?: string;
  createdAt: Date;
}

export interface OrderDto {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: string;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
  createdAt: Date;
}

export interface ReviewDto {
  id: number;
  product_id: number;
  rating: number;
  comment?: string;
  product: {
    id: number;
    name: string;
    image_url?: string;
  };
  createdAt: Date;
}

export interface CancellationDto {
  id: number;
  order_id: number;
  product_id: number;
  reason: string;
  status: string;
  product: {
    id: number;
    name: string;
    image_url?: string;
  };
  createdAt: Date;
}

export interface WishlistDto {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    category_id: number;
  };
  createdAt: Date;
}
