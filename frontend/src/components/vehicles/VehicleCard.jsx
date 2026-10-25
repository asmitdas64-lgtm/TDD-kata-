import React from 'react';
import { Link } from 'react-router-dom';
import { getVehicleImage, formatCurrency, formatMileage } from '../../utils/vehicle.utils.js';
import { ArrowRight, Gauge, Calendar, ShieldCheck } from 'lucide-react';

export const VehicleCard = ({ vehicle }) => {
  const imageUrl = getVehicleImage(vehicle);
  const isAvailable = vehicle.status === 'AVAILABLE' && vehicle.quantity > 0;

  return (
    <div className="group bg-[#121215] border border-zinc-800 hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
        <img
          src={imageUrl}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[11px] font-mono px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
              AVAILABLE ({vehicle.quantity})
            </span>
          ) : (
            <span className="bg-red-950/80 text-red-500 border border-red-600/40 text-[11px] font-mono px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
              SOLD
            </span>
          )}
        </div>

        {/* Color Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-zinc-900/80 text-zinc-300 border border-zinc-700/50 text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
            {vehicle.color}
          </span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              {vehicle.year}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              VIN: {vehicle.vin.slice(-6)}
            </span>
          </div>

          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-red-500 transition-colors tracking-tight uppercase">
            {vehicle.make} <span className="text-zinc-400">{vehicle.model}</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 border-t border-b border-zinc-800/80 py-2.5 my-3">
            <div className="flex items-center space-x-1.5">
              <Gauge className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
            <div className="flex items-center space-x-1.5 justify-end">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Model Year {vehicle.year}</span>
            </div>
          </div>
        </div>

        {/* Footer / Pricing & CTA */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 block leading-tight">
              Asking Price
            </span>
            <span className="text-xl font-bold font-mono text-zinc-100">
              {formatCurrency(vehicle.price)}
            </span>
          </div>

          <Link
            to={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-800 group-hover:bg-red-600 transition-colors"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
