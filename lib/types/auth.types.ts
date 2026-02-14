/**
 * Authentication Types
 * Type definitions for authentication flow
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user?: any;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
