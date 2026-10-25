import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

describe('LoginPage Component Tests', () => {
  let mockLogin;

  beforeEach(() => {
    mockLogin = vi.fn();
  });

  const renderComponent = () => {
    const authValue = {
      login: mockLogin,
      isAuthenticated: false,
      user: null
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  it('should render email and password input fields and submit button', () => {
    renderComponent();

    expect(screen.getByPlaceholderText('driver@domain.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /authorize access/i })).toBeInTheDocument();
  });

  it('should submit credentials to auth context login', async () => {
    mockLogin.mockResolvedValueOnce({ user: { id: '1' } });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('driver@domain.com'), {
      target: { value: 'client@dealership.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'Password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /authorize access/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('client@dealership.com', 'Password123');
    });
  });

  it('should display error banner if login throws an error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('driver@domain.com'), {
      target: { value: 'wrong@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'WrongPass' }
    });

    fireEvent.click(screen.getByRole('button', { name: /authorize access/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
