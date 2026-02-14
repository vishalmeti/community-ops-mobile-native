/**
 * Token Service
 * Singleton pattern for secure in-memory token management
 * Handles JWT token storage and retrieval
 */

class TokenService {
  private static instance: TokenService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }
  
  /**
   * Store access token in memory
   * @param token - JWT access token
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }
  
  /**
   * Retrieve access token from memory
   * @returns JWT access token or null
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }
  
  /**
   * Store refresh token in memory
   * @param token - JWT refresh token
   */
  public setRefreshToken(token: string): void {
    this.refreshToken = token;
  }
  
  /**
   * Retrieve refresh token from memory
   * @returns JWT refresh token or null
   */
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }
  
  /**
   * Clear all tokens from memory
   * Idempotent operation - safe to call multiple times
   */
  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
  
  /**
   * Check if user is authenticated
   * @returns boolean indicating authentication status
   */
  public isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export const tokenService = TokenService.getInstance();
