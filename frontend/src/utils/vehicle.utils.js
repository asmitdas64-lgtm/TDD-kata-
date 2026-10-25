import { getVehicleImageUrl } from './vehicleImages.js';

/** @deprecated Prefer `resolveVehicleMedia` from ./vehicleImages.js */
export const getVehicleImage = (vehicle) => getVehicleImageUrl(vehicle);

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(amount));
};

export const formatMileage = (miles) => {
  return new Intl.NumberFormat('en-US').format(miles) + ' mi';
};
