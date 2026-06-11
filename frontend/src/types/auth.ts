export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { msg: string; path: string }[];
}
