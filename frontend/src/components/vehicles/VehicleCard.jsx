import React from 'react';
import { Link } from 'react-router-dom';
import { resolveVehicleMedia } from '../../utils/vehicleImages.js';
import { formatCurrency, formatMileage } from '../../utils/vehicle.utils.js';
import { ArrowUpRight, Gauge, Calendar, Cog, Palette } from 'lucide-react';

const SpecChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 min-w-0 py-0.5">
    <Icon className="w-3.5 h-3.5 text-red-500 shrink-0" />
    <div className="min-w-0 leading-tight">
      <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-mono">{label}</span>
      <span className="block text-[11px] font-mono font-medium text-zinc-200 truncate">{value}</span>
    </div>
  </div>
);

export const VehicleCard = ({ vehicle }) => {
  const media = resolveVehicleMedia(vehicle);
  const isAvailable = vehicle.status === 'AVAILABLE' && vehicle.quantity > 0;

  return (
    <article
      id={`vehicle-card-${vehicle.id}`}
      className="group flex flex-col bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 hover:border-red-600/60 transition-all duration-300 overflow-hidden relative shadow-lg"
    >
      {/* Subtle top shift-light hairline indicator */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent group-hover:via-red-500 transition-all duration-500 z-10" />

      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
        <img
          src={media.src}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110 ${
            isAvailable ? 'brightness-90' : 'brightness-50 grayscale-[40%]'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 bg-zinc-950/90 text-emerald-400 border border-emerald-500/50 text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-emerald-400" />
              Available &middot; {vehicle.quantity}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest backdrop-blur-md">
              Sold
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/90 border border-zinc-800/90 px-1.5 py-0.5 shadow-sm backdrop-blur-md">
          <img src="/tdd-logo.png" alt="TDD" className="w-3.5 h-3.5 object-cover" />
          <span className="text-[9px] font-mono text-lime-400 font-bold">TDD&reg;</span>
        </div>

        {media.isFallback && (
          <span className="absolute bottom-3 right-3 text-[9px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-950/80 px-2 py-0.5 border border-zinc-800">
            Studio photo pending
          </span>
        )}

        <div className="absolute bottom-3 left-3 font-mono text-[10px] text-zinc-400 tracking-wider">
          VIN &middot; {vehicle.vin}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-red-500 font-semibold">{vehicle.make}</span>
          <h3 className="mt-0.5 text-lg font-extrabold text-zinc-50 uppercase tracking-tight leading-snug">
            {vehicle.model}
          </h3>
        </div>

        {/* Clean Car Properties - directly on background without grey boxes */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-mono py-1">
          <SpecChip icon={Calendar} label="Year" value={vehicle.year} />
          <SpecChip icon={Gauge} label="Mileage" value={formatMileage(vehicle.mileage)} />
          <SpecChip icon={Cog} label="Transmission" value={media.transmission || '—'} />
          <SpecChip icon={Palette} label="Exterior" value={vehicle.color} />
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800/80 flex items-end justify-between">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">Price</span>
            <span className="text-2xl font-bold font-mono text-zinc-50">{formatCurrency(vehicle.price)}</span>
          </div>
          <Link
            id={`vehicle-view-${vehicle.id}`}
            to={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center gap-2 h-10 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-zinc-900 border border-zinc-800/80 hover:bg-black hover:border-lime-400/80 group/btn transition-all shadow-sm cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover/btn:bg-lime-400 transition-colors animate-pulse" />
            <span>View Vehicle</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default VehicleCard;
