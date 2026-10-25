import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { VehicleListPage } from '../pages/VehicleListPage.jsx';
import api from '../api/client.js';

vi.mock('../api/client.js', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('VehicleListPage Tests', () => {
  const mockVehicles = [
    {
      id: 'v-1',
      vin: '1HGCR2F83HA000001',
      make: 'Porsche',
      model: '911 GT3',
      year: 2023,
      price: 215000,
      mileage: 1200,
      color: 'Shark Blue',
      quantity: 1,
      status: 'AVAILABLE'
    },
    {
      id: 'v-2',
      vin: '1HGCR2F83HA000002',
      make: 'Ferrari',
      model: 'F8 Tributo',
      year: 2022,
      price: 320000,
      mileage: 3400,
      color: 'Rosso Corsa',
      quantity: 0,
      status: 'SOLD'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render vehicles loaded from the catalog API', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockVehicles,
        meta: { page: 1, limit: 9, total: 2, totalPages: 1 }
      }
    });

    render(
      <BrowserRouter>
        <VehicleListPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/911 GT3/i)).toBeInTheDocument();
      expect(screen.getByText(/F8 Tributo/i)).toBeInTheDocument();
      expect(screen.getByText(/Shark Blue/i)).toBeInTheDocument();
      expect(screen.getByText(/Rosso Corsa/i)).toBeInTheDocument();
    });
  });

  it('should trigger search query when inputting keyword', async () => {
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: [mockVehicles[0]],
        meta: { page: 1, limit: 9, total: 1, totalPages: 1 }
      }
    });

    render(
      <BrowserRouter>
        <VehicleListPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search make, model, or VIN/i);
    fireEvent.change(searchInput, { target: { value: 'Porsche' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/vehicles/search', expect.objectContaining({
        params: expect.objectContaining({ q: 'Porsche' })
      }));
    });
  });
});
