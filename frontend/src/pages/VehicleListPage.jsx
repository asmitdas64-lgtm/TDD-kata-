import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client.js';
import { VehicleCard } from '../components/vehicles/VehicleCard.jsx';
import { FilterBar, DEFAULT_FILTERS } from '../components/vehicles/FilterBar.jsx';
import { ChevronLeft, ChevronRight, SearchX, AlertTriangle } from 'lucide-react';

const PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 300;

const SkeletonCard = () => (
  <div className="bg-zinc-950/70 border border-zinc-800/80 animate-pulse">
    <div className="aspect-[16/9] bg-zinc-900" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-20 bg-zinc-800" />
      <div className="h-5 w-3/4 bg-zinc-800" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 bg-zinc-900" />)}
      </div>
      <div className="h-8 w-1/2 bg-zinc-800" />
    </div>
  </div>
);

export const VehicleListPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  // Debounce free-text search to avoid a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [filters.search]);

  const fetchVehicles = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');

    const [sortBy, sortOrder] = filters.sort.split(':');
    const params = { page, limit: PAGE_SIZE, sortBy, sortOrder };
    if (debouncedSearch) params.q = debouncedSearch;
    if (filters.make) params.make = filters.make;
    if (filters.status) params.status = filters.status;
    if (filters.minPrice !== '') params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice !== '') params.maxPrice = Number(filters.maxPrice);

    try {
      const res = await api.get('/vehicles/search', { params });
      if (id !== requestId.current) return; // stale response
      if (res.data?.success) {
        setVehicles(res.data.data || []);
        if (res.data.meta) setPagination(res.data.meta);
      }
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err.response?.data?.error?.message || err.message || 'Unable to load vehicles from inventory.');
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  }, [page, debouncedSearch, filters.make, filters.status, filters.minPrice, filters.maxPrice, filters.sort]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFilterChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch('');
    setPage(1);
  };

  return (
    <>
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        resultCount={pagination.total}
        loading={loading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-red-500 font-semibold">
              Live Inventory
            </span>
            <h1 className="mt-1 text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
              The Garage <span className="text-zinc-500">Collection</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Performance coupes, super-sedans and track-bred SUVs — every unit tracked to the stock count.
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-400 bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md px-4 py-3">
            Page <span className="text-zinc-100">{pagination.page}</span> / {pagination.totalPages}
            <span className="mx-2 text-zinc-700">|</span>
            <span className="text-red-500 font-bold">{pagination.total}</span> units
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-8 p-4 bg-red-950/50 border-l-2 border-red-600 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Grid — previous results stay visible while refetching to avoid layout shift */}
        {!hasLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-20 border border-dashed border-zinc-800 text-center bg-zinc-950/70 backdrop-blur-md">
            <SearchX className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">
              No vehicles match these filters
            </p>
            <button onClick={handleReset} className="text-xs font-mono uppercase text-red-500 hover:text-red-400 underline underline-offset-4">
              Reset filters
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
              loading ? 'opacity-60' : 'opacity-100'
            }`}
            aria-busy={loading}
          >
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 pt-6 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-500">
              Showing page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                id="pagination-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-10 w-10 flex items-center justify-center bg-zinc-950/80 border border-zinc-800 disabled:opacity-40 hover:border-red-600 text-zinc-300"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="pagination-next"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="h-10 w-10 flex items-center justify-center bg-zinc-950/80 border border-zinc-800 disabled:opacity-40 hover:border-red-600 text-zinc-300"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VehicleListPage;
