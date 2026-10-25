import React from 'react';
import { Search, RotateCcw, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { BRAND_OPTIONS } from '../../utils/vehicleImages.js';

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Recently Added' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'year:desc', label: 'Year: Newest First' },
  { value: 'mileage:asc', label: 'Mileage: Lowest First' }
];

export const DEFAULT_FILTERS = {
  search: '',
  make: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  sort: 'createdAt:desc'
};

const fieldBase =
  'w-full h-10 bg-zinc-950 border border-zinc-800 hover:border-red-600/80 focus:border-red-500 focus:bg-black text-xs font-mono text-red-400 placeholder:text-red-700/70 outline-none transition-colors';

const Select = ({ id, label, value, onChange, children }) => (
  <div className="relative">
    <label htmlFor={id} className="sr-only">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldBase} appearance-none pl-3 pr-8 cursor-pointer text-red-400`}
    >
      {children}
    </select>
    <ChevronDown className="w-3.5 h-3.5 text-red-500 absolute right-2.5 top-3 pointer-events-none" />
  </div>
);

const STATUS_SEGMENTS = [
  { value: '', label: 'All' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'SOLD', label: 'Sold Out' }
];

export const FilterBar = ({ filters, onChange, onReset, resultCount, loading }) => {
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  const activeCount = ['search', 'make', 'status', 'minPrice', 'maxPrice'].filter((k) => filters[k] !== '').length +
    (filters.sort !== DEFAULT_FILTERS.sort ? 1 : 0);

  return (
    <section
      aria-label="Inventory filters"
      className="sticky top-16 z-40 border-b border-zinc-900 bg-black text-red-500 shadow-xl"
    >
      {/* Loading progress hairline */}
      <div className={`h-0.5 bg-red-600 transition-opacity duration-300 ${loading ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        {/* Row 1: search + status segments */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="filter-search" className="sr-only">Search inventory</label>
            <Search className="w-4 h-4 text-red-500 absolute left-3 top-3 pointer-events-none" />
            <input
              id="filter-search"
              type="text"
              value={filters.search}
              onChange={(e) => set('search')(e.target.value)}
              placeholder="Search make, model, or VIN (e.g., Porsche 911 GT3)..."
              className={`${fieldBase} pl-10 pr-3`}
            />
          </div>

          <div role="radiogroup" aria-label="Availability" className="flex h-10 border border-zinc-800 bg-zinc-950 shrink-0">
            {STATUS_SEGMENTS.map((seg) => {
              const active = filters.status === seg.value;
              return (
                <button
                  key={seg.label}
                  id={`filter-status-${seg.label.toLowerCase().replace(/\s/g, '-')}`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set('status')(seg.value)}
                  className={`px-4 text-[11px] font-mono uppercase tracking-wider transition-colors border-r last:border-r-0 border-zinc-800 cursor-pointer ${
                    active 
                      ? 'bg-red-600 text-white font-bold' 
                      : 'text-red-400 hover:text-red-300 hover:bg-zinc-900'
                  }`}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: make, price range, sort, reset */}
        <div className="grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1.3fr_auto] gap-3 items-center">
          <Select id="filter-make" label="Make" value={filters.make} onChange={set('make')}>
            <option value="" className="bg-zinc-950 text-red-400">All Makes</option>
            {BRAND_OPTIONS.map((b) => (
              <option key={b} value={b} className="bg-zinc-950 text-red-400">{b}</option>
            ))}
          </Select>

          <div className="relative">
            <label htmlFor="filter-min-price" className="sr-only">Minimum price</label>
            <input
              id="filter-min-price"
              type="number"
              min="0"
              step="1000"
              value={filters.minPrice}
              onChange={(e) => set('minPrice')(e.target.value)}
              placeholder="Min: $25,000"
              className={`${fieldBase} px-3`}
            />
          </div>

          <div className="relative">
            <label htmlFor="filter-max-price" className="sr-only">Maximum price</label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              step="1000"
              value={filters.maxPrice}
              onChange={(e) => set('maxPrice')(e.target.value)}
              placeholder="Max: $250,000"
              className={`${fieldBase} px-3`}
            />
          </div>

          <Select id="filter-sort" label="Sort order" value={filters.sort} onChange={set('sort')}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-zinc-950 text-red-400">{o.label}</option>
            ))}
          </Select>

          <button
            id="filter-reset"
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="col-span-2 md:col-span-1 h-10 inline-flex items-center justify-center gap-2 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-zinc-950 disabled:border disabled:border-zinc-800 disabled:text-zinc-600 disabled:hover:bg-zinc-950 text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
            {activeCount > 0 && (
              <span className="bg-black text-white px-1.5 text-[10px] leading-4 border border-white/30">{activeCount}</span>
            )}
          </button>
        </div>

        {/* Telemetry Row */}
        <div className="flex items-center justify-between text-[11px] font-mono text-red-400 pt-0.5">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-red-500" />
            {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active` : 'No filters applied'}
          </span>
          <span>
            <span className="text-red-500 font-bold">{resultCount}</span> vehicles match
          </span>
        </div>
      </div>
    </section>
  );
};

export default FilterBar;
