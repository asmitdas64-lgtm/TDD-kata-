import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import { VehicleCard } from '../components/vehicles/VehicleCard.jsx';
import { Search, Filter, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [search, setSearch] = useState('');
  const [make, setMake] = useState('');
  const [status, setStatus] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: 9
      };

      if (search.trim()) params.q = search.trim();
      if (make.trim()) params.make = make.trim();
      if (status) params.status = status;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);

      // Use /vehicles/search endpoint when filters/search are provided, otherwise /vehicles
      const endpoint = search.trim() ? '/vehicles/search' : '/vehicles';
      const res = await api.get(endpoint, { params });

      if (res.data?.success) {
        setVehicles(res.data.data || []);
        if (res.data.meta) {
          setPagination(res.data.meta);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Unable to load vehicles from inventory.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, make, status, minPrice, maxPrice]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleResetFilters = () => {
    setSearch('');
    setMake('');
    setStatus('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header */}
      <div className="border-b border-zinc-800 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-semibold block mb-1">
            Current Inventory
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white m-0">
            Showroom <span className="text-zinc-500">Collection</span>
          </h1>
        </div>
        <div className="text-xs font-mono text-zinc-400">
          Total Fleet Available: <span className="text-red-500 font-bold">{pagination.total}</span> units
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121215] border border-zinc-800 p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search make or model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18181b] border border-zinc-800 focus:border-red-600 text-xs font-mono text-zinc-100 pl-8 pr-3 py-2 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Make Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by Make (e.g. Porsche)..."
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18181b] border border-zinc-800 focus:border-red-600 text-xs font-mono text-zinc-100 px-3 py-2 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18181b] border border-zinc-800 focus:border-red-600 text-xs font-mono text-zinc-300 px-3 py-2 outline-none"
            >
              <option value="">Status: All Inventory</option>
              <option value="AVAILABLE">AVAILABLE (In Stock)</option>
              <option value="SOLD">SOLD</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-1/2 bg-[#18181b] border border-zinc-800 focus:border-red-600 text-xs font-mono text-zinc-100 px-2.5 py-2 outline-none"
            />
            <span className="text-zinc-600 text-xs">-</span>
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-1/2 bg-[#18181b] border border-zinc-800 focus:border-red-600 text-xs font-mono text-zinc-100 px-2.5 py-2 outline-none"
            />
          </div>

          {/* Reset Action */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetFilters}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono uppercase tracking-wider py-2 px-3 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={fetchVehicles}
              className="p-2 bg-red-600 hover:bg-red-700 text-white transition-colors"
              title="Refresh Showroom"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-800 text-red-400 text-xs font-mono mb-8">
          {error}
        </div>
      )}

      {/* Grid of Vehicles */}
      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-6 h-6 text-red-600 animate-spin mx-auto mb-3" />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Querying Atelier Fleet...
          </span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="py-20 border border-dashed border-zinc-800 text-center bg-[#121215]/50">
          <p className="text-zinc-400 text-sm font-mono mb-3 uppercase tracking-wider">
            No matching vehicles found matching criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="text-xs font-mono uppercase text-red-500 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 pt-6 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:border-zinc-600 text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:border-zinc-600 text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleListPage;
