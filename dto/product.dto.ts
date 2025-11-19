export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  sold_count: number;
  stock_quantity: number;
  category_id: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithCategoryDto {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  sold_count: number;
  stock_quantity: number;
  category_id: number;
  category: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TopSellingProductsResponseDto {
  success: boolean;
  data: ProductWithCategoryDto[];
}

export interface TopSellingProductsWithLimitResponseDto {
  success: boolean;
  data: ProductWithCategoryDto[];
  count: number;
}

export interface ProductResponseDto {
  success: boolean;
  data: ProductWithCategoryDto;
}

export interface AllProductsResponseDto {
  success: boolean;
  data: ProductWithCategoryDto[];
}
