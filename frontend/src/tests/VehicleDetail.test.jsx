import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VehicleDetailPage } from '../pages/VehicleDetailPage.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../api/client.js';

vi.mock('../api/client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('VehicleDetailPage Tests', () => {
  const mockVehicle = {
    id: 'veh-999',
    vin: '1HGCR2F83HA999999',
    make: 'McLaren',
    model: '720S',
    year: 2023,
    price: 310000,
    mileage: 800,
    color: 'Papaya Spark',
    quantity: 2,
    status: 'AVAILABLE'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (authOverrides = {}) => {
    const authValue = {
      isAuthenticated: true,
      user: { id: 'usr-1', email: 'collector@apex.com' },
      ...authOverrides
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/vehicles/veh-999']}>
          <Routes>
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('should render vehicle technical specifications', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: { vehicle: mockVehicle } }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('McLaren')).toBeInTheDocument();
      expect(screen.getByText('720S')).toBeInTheDocument();
      expect(screen.getByText(/1HGCR2F83HA999999/)).toBeInTheDocument();
      expect(screen.getByText('Papaya Spark')).toBeInTheDocument();
    });
  });

  it('should open purchase dialog and execute acquisition transaction', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: { vehicle: mockVehicle } }
    });
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          orderId: 'ord-8888',
          vehicle: { ...mockVehicle, quantity: 1 }
        }
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /initiate vehicle acquisition/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /initiate vehicle acquisition/i }));

    expect(screen.getByText(/transactional execution/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm order/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/vehicles/veh-999/purchase', { quantity: 1 });
      expect(screen.getByText(/acquisition completed/i)).toBeInTheDocument();
      expect(screen.getByText(/ord-8888/)).toBeInTheDocument();
    });
  });
});
