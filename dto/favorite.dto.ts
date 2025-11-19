export interface AddToFavoritesDto {
  product_id: number;
}

export interface FavoriteResponseDto {
  id: number;
  user_id: number;
  product_id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInFavoriteDto {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  description: string;
}

export interface FavoriteWithProductDto {
  id: number;
  user_id: number;
  product_id: number;
  product: ProductInFavoriteDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetFavoritesResponseDto {
  success: boolean;
  data: FavoriteWithProductDto[];
}

export interface AddFavoriteResponseDto {
  success: boolean;
  message: string;
  data: FavoriteResponseDto;
}

export interface RemoveFavoriteResponseDto {
  success: boolean;
  message: string;
}

export interface ErrorResponseDto {
  success: boolean;
  message: string;
  error?: string;
}
