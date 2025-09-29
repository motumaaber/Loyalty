import { User } from "@shared/schema";

export interface AuthUser extends Omit<User, 'password'> {}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  async login(username: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    
    return data;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = AuthService.getInstance();
