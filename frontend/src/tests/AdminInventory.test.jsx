import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AdminInventoryPage } from '../pages/AdminInventoryPage.jsx';
import api from '../api/client.js';

vi.mock('../api/client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('AdminInventoryPage Tests', () => {
  const mockVehicles = [
    {
      id: 'v-10',
      vin: '1HGCR2F83HA777777',
      make: 'Lamborghini',
      model: 'Huracan STO',
      year: 2023,
      price: 340000,
      mileage: 600,
      color: 'Verde Scandal',
      quantity: 0,
      status: 'SOLD'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render table rows with inventory data and restock controls', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: mockVehicles }
    });

    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/1HGCR2F83HA777777/i)).toBeInTheDocument();
      expect(screen.getByText(/Lamborghini Huracan STO/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /restock/i })).toBeInTheDocument();
    });
  });

  it('should trigger restock modal and send restock API call', async () => {
    api.get.mockResolvedValue({
      data: { success: true, data: mockVehicles }
    });
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { vehicle: { ...mockVehicles[0], quantity: 5, status: 'AVAILABLE' } }
      }
    });

    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restock/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /restock/i }));

    expect(screen.getByText(/stock augmentation/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /commit stock/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/vehicles/v-10/restock', { quantity: 5 });
    });
  });
});
