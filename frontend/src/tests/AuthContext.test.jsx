import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, AuthContext } from '../context/AuthContext.jsx';
import api from '../api/client.js';

vi.mock('../api/client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('AuthContext Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with null user when no token exists in localStorage', async () => {
    let contextValue;
    const TestConsumer = () => {
      const auth = React.useContext(AuthContext);
      contextValue = auth;
      return <div>User: {auth.user ? auth.user.email : 'None'}</div>;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(contextValue.user).toBeNull();
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.isAdmin).toBe(false);
  });

  it('should restore authenticated session from /api/auth/me when token is present', async () => {
    localStorage.setItem('token', 'valid-jwt-token');
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: { id: 'usr-1', email: 'admin@apex.com', role: 'ADMIN' }
        }
      }
    });

    let contextValue;
    const TestConsumer = () => {
      const auth = React.useContext(AuthContext);
      contextValue = auth;
      return <div>Role: {auth.user?.role}</div>;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(contextValue.user).toEqual({ id: 'usr-1', email: 'admin@apex.com', role: 'ADMIN' });
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.isAdmin).toBe(true);
  });

  it('should store token and user upon successful login', async () => {
    api.get.mockRejectedValueOnce(new Error('no token'));
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          token: 'signed-token-123',
          user: { id: 'usr-2', email: 'buyer@test.com', role: 'CUSTOMER' }
        }
      }
    });

    let contextValue;
    const TestConsumer = () => {
      const auth = React.useContext(AuthContext);
      contextValue = auth;
      return <button onClick={() => auth.login('buyer@test.com', 'secret123')}>Login</button>;
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await contextValue.login('buyer@test.com', 'secret123');
    });

    expect(localStorage.getItem('token')).toBe('signed-token-123');
    expect(contextValue.user.email).toBe('buyer@test.com');
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.isAdmin).toBe(false);
  });

  it('should clear token and user on logout', async () => {
    localStorage.setItem('token', 'dummy-token');
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { user: { id: 'usr-1', email: 'buyer@test.com', role: 'CUSTOMER' } }
      }
    });

    let contextValue;
    const TestConsumer = () => {
      const auth = React.useContext(AuthContext);
      contextValue = auth;
      return <button onClick={auth.logout}>Logout</button>;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    act(() => {
      contextValue.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(contextValue.user).toBeNull();
    expect(contextValue.isAuthenticated).toBe(false);
  });
});
