import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import { formatCurrency } from '../utils/vehicle.utils.js';
import {
  Shield,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PackagePlus,
  X,
  Search
} from 'lucide-react';

export const AdminInventoryPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  // Restock modal state
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [restockAmount, setRestockAmount] = useState(5);
  const [restocking, setRestocking] = useState(false);
  const [restockError, setRestockError] = useState('');
  const [restockSuccess, setRestockSuccess] = useState('');

  // Add vehicle modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [addError, setAddError] = useState('');
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    make: '',
    model: '',
    year: 2024,
    price: 65000,
    mileage: 1500,
    color: 'Obsidian Black',
    quantity: 3,
    status: 'AVAILABLE'
  });

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      if (res.data?.success) {
        setVehicles(res.data.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to load dealership inventory.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockVehicle) return;

    try {
      setRestocking(true);
      setRestockError('');
      setRestockSuccess('');

      const res = await api.post(`/vehicles/${restockVehicle.id}/restock`, {
        quantity: Number(restockAmount)
      });

      if (res.data?.success) {
        setRestockSuccess(`Vehicle inventory successfully augmented by +${restockAmount} units.`);
        await fetchInventory();
        setTimeout(() => {
          setRestockVehicle(null);
          setRestockSuccess('');
        }, 1500);
      }
    } catch (err) {
      setRestockError(
        err.response?.data?.error?.message ||
        err.message ||
        'Restock execution failed.'
      );
    } finally {
      setRestocking(false);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      setAddingVehicle(true);
      setAddError('');

      const payload = {
        vin: newVehicle.vin.trim().toUpperCase(),
        make: newVehicle.make.trim(),
        model: newVehicle.model.trim(),
        year: Number(newVehicle.year),
        price: Number(newVehicle.price),
        mileage: Number(newVehicle.mileage),
        color: newVehicle.color.trim(),
        quantity: Number(newVehicle.quantity),
        status: newVehicle.status
      };

      const res = await api.post('/vehicles', payload);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        // Reset form
        setNewVehicle({
          vin: '',
          make: '',
          model: '',
          year: 2024,
          price: 65000,
          mileage: 1500,
          color: 'Obsidian Black',
          quantity: 3,
          status: 'AVAILABLE'
        });
        await fetchInventory();
      }
    } catch (err) {
      setAddError(
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to add vehicle to fleet.'
      );
    } finally {
      setAddingVehicle(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header */}
      <div className="border-b border-zinc-800 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 overflow-hidden border border-zinc-700 shadow-xl shrink-0 transform -skew-x-3">
              <img src="/tdd-logo.png" alt="TDD Official Logo" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400 rotate-45 border border-black pointer-events-none opacity-90" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-lime-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
              <span>Official TDD&reg; Admin Operations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white m-0">
              Fleet <span className="text-zinc-500">Inventory Management</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-950 hover:bg-black border border-red-500/40 hover:border-lime-400 text-white text-xs font-mono uppercase tracking-wider py-2.5 px-4 flex items-center space-x-2 transition-all font-bold shadow-md group cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:bg-lime-400 transition-colors animate-pulse" />
            <Plus className="w-4 h-4 text-zinc-300 group-hover:text-white" />
            <span>Add Vehicle Spec</span>
          </button>
          <button
            onClick={fetchInventory}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Reload Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border-l-2 border-red-600 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Filter Quick Search */}
      <div className="mb-6 max-w-md relative">
        <input
          type="text"
          placeholder="Filter table by make, model, or VIN..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full bg-[#121215] border border-zinc-800 text-xs font-mono text-zinc-100 pl-8 pr-3 py-2.5 outline-none focus:border-red-600"
        />
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3" />
      </div>

      {/* Sharp Data Table */}
      <div className="border border-zinc-800 bg-[#121215] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 bg-[#16161a] text-zinc-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold">VIN</th>
              <th className="py-3.5 px-4 font-semibold">Make & Model</th>
              <th className="py-3.5 px-4 font-semibold">Year</th>
              <th className="py-3.5 px-4 font-semibold">Color</th>
              <th className="py-3.5 px-4 font-semibold">Unit Price</th>
              <th className="py-3.5 px-4 font-semibold">Stock Level</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-zinc-500">
                  <RefreshCw className="w-5 h-5 text-red-600 animate-spin mx-auto mb-2" />
                  Refreshing inventory matrix...
                </td>
              </tr>
            ) : filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-zinc-500">
                  No vehicles recorded in dealership database.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => {
                const isOut = vehicle.quantity === 0 || vehicle.status === 'SOLD';
                return (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-zinc-400 font-bold">
                      {vehicle.vin}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-100 font-bold uppercase">
                      {vehicle.make} {vehicle.model}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{vehicle.year}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{vehicle.color}</td>
                    <td className="py-3.5 px-4 text-zinc-200 font-bold">
                      {formatCurrency(vehicle.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={
                          vehicle.quantity > 2
                            ? 'text-emerald-400 font-bold'
                            : vehicle.quantity > 0
                            ? 'text-amber-400 font-bold'
                            : 'text-red-500 font-bold'
                        }
                      >
                        {vehicle.quantity} Units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="bg-red-950/80 text-red-500 border border-red-600/40 px-2 py-0.5 text-[10px] uppercase font-bold">
                          SOLD
                        </span>
                      ) : (
                        <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[10px] uppercase font-bold">
                          AVAILABLE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setRestockVehicle(vehicle);
                          setRestockAmount(5);
                          setRestockError('');
                          setRestockSuccess('');
                        }}
                        className="inline-flex items-center space-x-1 bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {restockVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#141418] border border-zinc-700 p-6 relative">
            <button
              onClick={() => setRestockVehicle(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-mono uppercase text-red-500 font-semibold block mb-1">
                Stock Augmentation
              </span>
              <h3 className="text-lg font-bold uppercase text-white">
                Restock: {restockVehicle.make} {restockVehicle.model}
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                VIN: {restockVehicle.vin} | Current: {restockVehicle.quantity} units
              </p>
            </div>

            {restockError && (
              <div className="p-3 bg-red-950/40 border-l-2 border-red-600 text-red-400 text-xs font-mono mb-4">
                {restockError}
              </div>
            )}

            {restockSuccess && (
              <div className="p-3 bg-emerald-950/40 border-l-2 border-emerald-500 text-emerald-400 text-xs font-mono mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{restockSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2">
                  Units To Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-sm font-mono outline-none focus:border-red-600"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockVehicle(null)}
                  className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restocking}
                  className="w-1/2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{restocking ? 'Updating...' : 'Commit Stock'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#141418] border border-zinc-700 p-6 sm:p-8 relative my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-mono uppercase text-red-500 font-semibold block mb-1">
                Atelier Catalog Entry
              </span>
              <h3 className="text-xl font-bold uppercase text-white">
                Add Vehicle To Showroom
              </h3>
            </div>

            {addError && (
              <div className="p-3 bg-red-950/40 border-l-2 border-red-600 text-red-400 text-xs font-mono mb-4">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">
                  17-Character VIN
                </label>
                <input
                  type="text"
                  maxLength={17}
                  placeholder="WP0AB2A99NS290001"
                  value={newVehicle.vin}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })}
                  className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">Make</label>
                  <input
                    type="text"
                    placeholder="Porsche"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="911 GT3 RS"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">Year</label>
                  <input
                    type="number"
                    min="1900"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                    className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={newVehicle.price}
                    onChange={(e) => setNewVehicle({ ...newVehicle, price: e.target.value })}
                    className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">Mileage</label>
                  <input
                    type="number"
                    min="0"
                    value={newVehicle.mileage}
                    onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
                    className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">Exterior Color</label>
                  <input
                    type="text"
                    placeholder="Guards Red"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newVehicle.quantity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, quantity: e.target.value })}
                    className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingVehicle}
                  className="w-1/2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{addingVehicle ? 'Creating...' : 'Register Vehicle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
