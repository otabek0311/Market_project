export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  createdAt?: Date;
}

export interface AuthResponseDto {
  message: string;
  token?: string;
  user: UserResponseDto;
}

export interface LoginResponseDto {
  message: string;
  token: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface RegisterResponseDto {
  message: string;
  user: UserResponseDto;
}

export interface ProfileResponseDto {
  user: UserResponseDto;
}
