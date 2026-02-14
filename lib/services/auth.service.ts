/**
 * Authentication Service
 * Business logic layer for authentication operations
 * Handles login, signup, and user profile retrieval
 */

import { httpService } from './http.service';
import { tokenService } from './token.service';
import { Environment } from '../config/environment';
import {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  ApiError,
} from '../types/auth.types';
import { UserProfile } from '../types';

class AuthService {
  private static instance: AuthService;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Login user with credentials
   * Stores JWT token in memory on success
   * @param credentials - User login credentials
   * @returns Authentication response with tokens
   * @throws ApiError on failure
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login to:', Environment.getApiUrl() + '/api/v1/auth/login');
      console.log('📧 Email:', credentials.email);
      
      const response = await httpService.post<AuthResponse>(
        '/api/v1/auth/login',
        credentials,
        false // Don't include auth header for login
      );
      
      console.log('✅ Login response:', response);
      
      // Store tokens in memory
      if (response.access_token) {
        tokenService.setAccessToken(response.access_token);
        console.log('🎫 Access token stored');
      }
      
      if (response.refresh_token) {
        tokenService.setRefreshToken(response.refresh_token);
        console.log('🔄 Refresh token stored');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error as ApiError;
    }
  }
  
  /**
   * Register new user
   * Stores JWT token in memory on success
   * @param credentials - User signup credentials
   * @returns Authentication response with tokens
   * @throws ApiError on failure
   */
  public async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await httpService.post<AuthResponse>(
        '/api/auth/signup',
        credentials,
        false // Don't include auth header for signup
      );
      
      // Store tokens in memory
      if (response.access_token) {
        tokenService.setAccessToken(response.access_token);
      }
      
      if (response.refresh_token) {
        tokenService.setRefreshToken(response.refresh_token);
      }
      
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }
  
  /**
   * Get current user profile
   * Requires valid JWT token
   * @returns User profile data
   * @throws ApiError on failure
   */
  public async getCurrentUser(): Promise<UserProfile> {
    try {
      // Verify token is available (automatically added by httpService)
      const token = tokenService.getAccessToken();
      console.log('👤 Getting current user profile. Token status:', token ? '✅ Present' : '❌ Missing');
      
      const profile = await httpService.get<UserProfile>('/api/v1/users/me');
      console.log('✅ User profile fetched successfully');
      return profile;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw error as ApiError;
    }
  }
  
  /**
   * Logout user
   * Clears tokens from memory
   * Idempotent operation
   */
  public async logout(): Promise<void> {
    try {
      // Optionally call backend logout endpoint
      // await httpService.post('/api/auth/logout');
      
      // Clear tokens from memory
      tokenService.clearTokens();
    } catch (error) {
      // Always clear tokens even if API call fails
      tokenService.clearTokens();
      throw error as ApiError;
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns boolean indicating authentication status
   */
  public isAuthenticated(): boolean {
    return tokenService.isAuthenticated();
  }
}

export const authService = AuthService.getInstance();
