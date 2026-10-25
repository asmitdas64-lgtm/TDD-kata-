import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatCurrency, formatMileage } from '../utils/vehicle.utils.js';
import { resolveVehicleMedia } from '../utils/vehicleImages.js';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Shield,
  Gauge,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Cog,
  X
} from 'lucide-react';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Purchase modal states
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/vehicles/${id}`);
        if (res.data?.success && res.data?.data?.vehicle) {
          setVehicle(res.data.data.vehicle);
        } else {
          setError('Vehicle not found.');
        }
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
          err.message ||
          'Failed to load vehicle details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handlePurchase = async () => {
    setPurchaseError('');
    try {
      setPurchasing(true);
      const res = await api.post(`/vehicles/${id}/purchase`, {
        quantity: Number(purchaseQuantity)
      });

      if (res.data?.success) {
        setPurchaseSuccess(res.data.data);
        // Refresh local vehicle state
        if (res.data.data.vehicle) {
          setVehicle(res.data.data.vehicle);
        }
      }
    } catch (err) {
      setPurchaseError(
        err.response?.data?.error?.message ||
        err.message ||
        'Transaction failed. Vehicle may be out of stock.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-zinc-500">
          Loading atelier specifications...
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold uppercase text-white mb-2">
          Vehicle Unavailable
        </h2>
        <p className="text-zinc-400 text-sm font-mono mb-6">{error || 'Specification not found.'}</p>
        <Link
          to="/vehicles"
          className="inline-flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs uppercase font-mono px-4 py-2.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return To Showroom</span>
        </Link>
      </div>
    );
  }

  const media = resolveVehicleMedia(vehicle);
  const isAvailable = vehicle.status === 'AVAILABLE' && vehicle.quantity > 0;
  const totalPrice = Number(vehicle.price) * purchaseQuantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/vehicles"
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Catalog</span>
        </Link>
      </div>

      {/* Main Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Media Presentation */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
            <img
              src={media.src}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
            {/* Status overlay */}
            <div className="absolute top-4 left-4">
              {isAvailable ? (
                <span className="bg-zinc-950/90 text-emerald-400 border border-emerald-500/50 text-xs font-mono px-3 py-1 uppercase tracking-widest backdrop-blur-md">
                  AVAILABLE ({vehicle.quantity} UNITS IN STOCK)
                </span>
              ) : (
                <span className="bg-red-600 text-white text-xs font-mono px-3 py-1 uppercase tracking-widest backdrop-blur-md">
                  OUT OF STOCK / SOLD
                </span>
              )}
            </div>
          </div>

          {/* Provenance Banner */}
          <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span>Full Provenance & Inspection Verified</span>
            </div>
            <span className="text-zinc-500">APEX-STD-990</span>
          </div>
        </div>

        {/* Right: Technical Specification & Acquisition Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md p-6 sm:p-8">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-semibold">
                {vehicle.year} MODEL SPEC
              </span>
              <span className="text-xs font-mono text-zinc-500">
                VIN: {vehicle.vin}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white m-0 mb-2">
              {vehicle.make}{' '}
              <span className="text-red-500">{vehicle.model}</span>
            </h1>

            <div className="my-6 p-4 bg-zinc-900/60 border-l-2 border-red-600">
              <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                Acquisition Value
              </span>
              <span className="text-3xl font-extrabold font-mono text-zinc-100">
                {formatCurrency(vehicle.price)}
              </span>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t border-b border-zinc-800 py-4 my-6">
              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase">Mileage</span>
                <span className="text-zinc-200 font-semibold">{formatMileage(vehicle.mileage)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase">Exterior Color</span>
                <span className="text-zinc-200 font-semibold">{vehicle.color}</span>
              </div>
              <div className="space-y-1 pt-2">
                <span className="text-zinc-500 block uppercase">Transmission</span>
                <span className="text-zinc-200 font-semibold">{media.transmission || 'Automatic'}</span>
              </div>
              <div className="space-y-1 pt-2">
                <span className="text-zinc-500 block uppercase">Current Inventory</span>
                <span className={vehicle.quantity > 0 ? "text-emerald-400 font-semibold" : "text-red-500 font-semibold"}>
                  {vehicle.quantity} Units
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            {isAvailable ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: `/vehicles/${id}` } } });
                  } else {
                    setIsPurchaseModalOpen(true);
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 px-4 font-semibold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isAuthenticated ? 'Initiate Vehicle Acquisition' : 'Sign In To Purchase'}
                </span>
              </button>
            ) : (
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 text-center text-xs font-mono uppercase text-zinc-500">
                Vehicle Currently Unavailable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transactional Purchase Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#141418] border border-zinc-700 p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setIsPurchaseModalOpen(false);
                setPurchaseSuccess(null);
                setPurchaseError('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {purchaseSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold uppercase text-white mb-2">
                  Acquisition Completed
                </h3>
                <p className="text-xs font-mono text-zinc-400 mb-6">
                  Transaction finalized. Order Ref:{' '}
                  <span className="text-red-500 font-bold">{purchaseSuccess.orderId}</span>
                </p>
                <button
                  onClick={() => {
                    setIsPurchaseModalOpen(false);
                    setPurchaseSuccess(null);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono uppercase tracking-wider py-2.5 px-6 transition-colors"
                >
                  Close Confirmation
                </button>
              </div>
            ) : (
              <div>
                <span className="text-xs font-mono uppercase text-red-500 font-semibold block mb-1">
                  Transactional Execution
                </span>
                <h3 className="text-xl font-bold uppercase text-white mb-4">
                  Purchase: {vehicle.make} {vehicle.model}
                </h3>

                {purchaseError && (
                  <div className="p-3 bg-red-950/40 border-l-2 border-red-600 text-red-400 text-xs font-mono mb-4">
                    {purchaseError}
                  </div>
                )}

                <div className="space-y-4 text-xs font-mono my-6">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">Unit Price:</span>
                    <span className="text-zinc-200">{formatCurrency(vehicle.price)}</span>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 uppercase">
                      Quantity Required (Max {vehicle.quantity}):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={vehicle.quantity}
                      value={purchaseQuantity}
                      onChange={(e) =>
                        setPurchaseQuantity(
                          Math.max(1, Math.min(vehicle.quantity, Number(e.target.value) || 1))
                        )
                      }
                      className="w-full bg-[#1e1e24] border border-zinc-700 text-zinc-100 px-3 py-2 text-sm font-mono outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="flex justify-between border-t border-zinc-800 pt-3 text-sm">
                    <span className="text-zinc-400 uppercase font-bold">Total Consideration:</span>
                    <span className="text-red-500 font-bold text-base">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-1/2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>{purchasing ? 'Executing...' : 'Confirm Order'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailPage;
