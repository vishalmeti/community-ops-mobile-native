/**
 * Environment Configuration
 * Singleton pattern for centralized environment variable access
 */

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  
  private readonly apiUrl: string;
  
  private constructor() {
    this.apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';
    this.validateConfig();
  }
  
  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }
  
  private validateConfig(): void {
    if (!this.apiUrl) {
      throw new Error('EXPO_PUBLIC_API_URL is not defined in environment variables');
    }
  }
  
  public getApiUrl(): string {
    return this.apiUrl;
  }
}

export const Environment = EnvironmentConfig.getInstance();
