/**
 * HTTP Service
 * Centralized HTTP client with request/response interceptors
 * Handles authentication headers and error responses
 */

import { Environment } from '../config/environment';
import { tokenService } from './token.service';
import { ApiError } from '../types/auth.types';

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

class HttpService {
  private static instance: HttpService;
  private baseUrl: string;
  
  private constructor() {
    this.baseUrl = Environment.getApiUrl();
  }
  
  public static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }
  
  /**
   * Add authentication headers to request
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const token = tokenService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  /**
   * Handle API errors uniformly
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    
    try {
      const errorData = await response.json();
      
      // Support common error formats
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        // Handle FastAPI-style detail errors
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Extract the first error message if it's an array of validation errors
          const firstError = errorData.detail[0];
          errorMessage = firstError.msg || firstError.message || JSON.stringify(firstError);
        } else {
          errorMessage = JSON.stringify(errorData.detail);
        }
      }
      
      errorCode = errorData.code || errorCode;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    const error: ApiError = {
      message: errorMessage,
      code: errorCode,
      statusCode: response.status,
    };
    
    // Handle 401 Unauthorized - clear tokens
    if (response.status === 401) {
      tokenService.clearTokens();
    }
    
    throw error;
  }
  
  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('🌐 HTTP Request:', config.method, url);
    
    const headers = includeAuth
      ? { ...this.getAuthHeaders(), ...config.headers }
      : { 'Content-Type': 'application/json', ...config.headers };
    
    const requestInit: RequestInit = {
      method: config.method,
      headers,
    };
    
    if (config.body) {
      requestInit.body = JSON.stringify(config.body);
      console.log('📦 Request body:', config.body);
    }
    
    try {
      console.log('⏳ Fetching...');
      const response = await fetch(url, requestInit);
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        await this.handleError(response);
      }
      
      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }
      
      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ HTTP Error:', error);
      
      // Re-throw ApiError, wrap other errors
      if ((error as ApiError).statusCode !== undefined) {
        throw error;
      }
      
      const networkError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error - Unable to reach server',
        code: 'NETWORK_ERROR',
      };
      
      console.error('🔴 Network Error Details:', {
        url,
        method: config.method,
        error: error instanceof Error ? error.message : error,
      });
      
      throw networkError;
    }
  }
  
  /**
   * GET request
   */
  public async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }
  
  /**
   * POST request
   */
  public async post<T>(
    endpoint: string,
    body?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body }, includeAuth);
  }
  
  /**
   * PUT request
   */
  public async put<T>(
    endpoint: string,
    body?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body }, includeAuth);
  }
  
  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }
}

export const httpService = HttpService.getInstance();
