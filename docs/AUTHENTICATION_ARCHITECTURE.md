# Authentication Architecture Documentation

## Overview
This authentication system follows industry-standard design patterns and clean architecture principles with proper separation of concerns across multiple layers.

## Architecture Layers

### 1. **Configuration Layer** (`lib/config/`)
- **Purpose**: Centralized environment configuration
- **Pattern**: Singleton
- **Files**:
  - `environment.ts`: Environment variable management

**Key Features**:
- Single source of truth for environment variables
- Validation on initialization
- Type-safe access to configuration

### 2. **Type Layer** (`lib/types/`)
- **Purpose**: Type definitions and interfaces
- **Files**:
  - `auth.types.ts`: Authentication-related types
  - `types.ts`: Application domain types

**Key Features**:
- Strong typing for API contracts
- Separation of concerns between auth and domain types
- Clear interface definitions

### 3. **Service Layer** (`lib/services/`)
- **Purpose**: Business logic and external communication
- **Pattern**: Singleton for all services
- **Files**:
  - `token.service.ts`: In-memory JWT token management
  - `http.service.ts`: HTTP client with interceptors
  - `auth.service.ts`: Authentication business logic
  - `index.ts`: Service exports

#### Token Service
**Responsibilities**:
- Secure in-memory storage of JWT tokens
- Token lifecycle management
- Authentication state checking

**Design Patterns**:
- Singleton: Single instance across application
- Idempotency: Safe to call clearTokens() multiple times

**Security**:
- Tokens stored in memory (not persisted)
- Automatic cleanup on logout
- No exposure to external storage

#### HTTP Service
**Responsibilities**:
- Centralized HTTP communication
- Request/response interceptors
- Error handling and transformation
- Authentication header injection

**Design Patterns**:
- Singleton: Single HTTP client instance
- Interceptor Pattern: Automatic auth header injection
- Error Normalization: Consistent error format

**Features**:
- Automatic Bearer token injection
- 401 handling with token cleanup
- Type-safe request/response
- Centralized error handling

#### Auth Service
**Responsibilities**:
- Login/Signup operations
- User profile retrieval
- Logout operations
- Authentication state management

**Design Patterns**:
- Singleton: Single auth service instance
- Facade Pattern: Simplified API for authentication
- Idempotency: Safe logout operations

**API Methods**:
```typescript
login(credentials: LoginCredentials): Promise<AuthResponse>
signup(credentials: SignupCredentials): Promise<AuthResponse>
getCurrentUser(): Promise<UserProfile>
logout(): Promise<void>
isAuthenticated(): boolean
```

### 4. **Storage Layer** (`lib/storage.ts`)
- **Purpose**: Local data persistence
- **Responsibilities**:
  - AsyncStorage operations
  - Profile management
  - Application data caching

### 5. **Context Layer** (`lib/context.tsx`)
- **Purpose**: Global state management
- **Pattern**: React Context + Hooks
- **Responsibilities**:
  - User profile state
  - Application data state
  - Logout coordination

### 6. **Presentation Layer** (`app/auth/`)
- **Purpose**: UI components
- **Files**:
  - `login.tsx`: Login screen
  - `signup.tsx`: Signup screen

**Responsibilities**:
- User input handling
- Form validation
- Error display
- Navigation

## Authentication Flow

### Login Flow
```
1. User enters credentials
2. login.tsx validates input
3. authService.login() called
   ├─> httpService.post('/api/auth/login')
   ├─> tokenService.setAccessToken()
   └─> tokenService.setRefreshToken()
4. authService.getCurrentUser() called
   ├─> httpService.get('/api/auth/me') with Bearer token
   └─> Returns UserProfile
5. Profile stored in AsyncStorage
6. Context refreshed
7. Navigate to home
```

### Signup Flow
```
1. User enters registration data
2. signup.tsx validates input
3. authService.signup() called
   ├─> httpService.post('/api/auth/signup')
   ├─> tokenService.setAccessToken()
   └─> tokenService.setRefreshToken()
4. authService.getCurrentUser() called
5. Profile stored in AsyncStorage
6. Context refreshed
7. Navigate to home
```

### Logout Flow
```
1. User triggers logout
2. authService.logout() called
   ├─> tokenService.clearTokens()
   └─> Optional: API logout call
3. AsyncStorage cleared
4. Context state reset
5. Navigate to login
```

## Design Patterns Used

### 1. **Singleton Pattern**
- **Where**: All services (token, http, auth, environment)
- **Why**: Single source of truth, shared state, resource efficiency
- **Implementation**: Private constructor + getInstance()

### 2. **Facade Pattern**
- **Where**: authService
- **Why**: Simplified API for complex authentication operations
- **Benefit**: Hides complexity of token management and HTTP calls

### 3. **Interceptor Pattern**
- **Where**: httpService
- **Why**: Automatic request/response modification
- **Use Cases**: Auth header injection, error handling

### 4. **Idempotency**
- **Where**: logout(), clearTokens()
- **Why**: Safe to call multiple times without side effects
- **Benefit**: Robust error handling

### 5. **Dependency Injection**
- **Where**: Service layer
- **Why**: Loose coupling, testability
- **Implementation**: Services injected via imports

## Security Considerations

### Token Storage
- **In-Memory Only**: Tokens never persisted to disk
- **Automatic Cleanup**: Tokens cleared on 401 responses
- **No Exposure**: Tokens not accessible outside token service

### API Communication
- **HTTPS Only**: Production should use HTTPS
- **Bearer Token**: Standard JWT authentication
- **Error Handling**: No sensitive data in error messages

### Error Handling
- **Normalized Errors**: Consistent ApiError format
- **User-Friendly Messages**: Generic messages for security
- **Logging**: Server-side logging for debugging

## Environment Variables

```env
EXPO_PUBLIC_API_URL=http://localhost:5001
```

**Usage**:
```typescript
import { Environment } from '@/lib/config/environment';
const apiUrl = Environment.getApiUrl();
```

## API Endpoints Expected

### POST /api/auth/login
**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### POST /api/auth/signup
**Request**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### GET /api/auth/me
**Headers**:
```
Authorization: Bearer eyJhbGc...
```

**Response**:
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "123-456-7890",
  "apartmentNumber": "101",
  "buildingName": "Estate Hub",
  "floor": "1",
  "moveInDate": "2024-01-01T00:00:00.000Z",
  "isSetup": true
}
```

## Testing Considerations

### Unit Tests
- Test each service in isolation
- Mock dependencies
- Test error scenarios

### Integration Tests
- Test authentication flow end-to-end
- Test token refresh
- Test logout cleanup

### Example Test Structure
```typescript
describe('AuthService', () => {
  it('should store tokens on successful login', async () => {
    // Test implementation
  });
  
  it('should clear tokens on logout', async () => {
    // Test implementation
  });
});
```

## Future Enhancements

1. **Token Refresh**: Implement automatic token refresh
2. **Biometric Auth**: Add fingerprint/face ID support
3. **Session Management**: Track active sessions
4. **Rate Limiting**: Client-side request throttling
5. **Offline Support**: Queue requests when offline
6. **Error Retry**: Automatic retry with exponential backoff

## Best Practices Followed

✅ **Separation of Concerns**: Each layer has single responsibility
✅ **DRY Principle**: No code duplication
✅ **Type Safety**: Full TypeScript coverage
✅ **Error Handling**: Comprehensive try-catch blocks
✅ **Security**: Tokens in memory, no sensitive data exposure
✅ **Scalability**: Easy to add new services/features
✅ **Maintainability**: Clear structure, well-documented
✅ **Testability**: Services can be mocked/tested independently

## Code Quality Standards

- **Naming**: Clear, descriptive names
- **Comments**: JSDoc for public methods
- **Formatting**: Consistent code style
- **Error Messages**: User-friendly, actionable
- **Logging**: Strategic console.error for debugging
- **Validation**: Input validation at boundaries
