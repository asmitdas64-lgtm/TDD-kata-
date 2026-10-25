// Curated high-performance automotive images
const automotiveImages = [
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80', // Porsche 911 GT3 / Dark performance
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', // Porsche 911 rear
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', // Audi R8 obsidian
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', // Corvette C8
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', // BMW M4 Competition
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', // Mercedes AMG GT
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80', // Matte black coupe
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', // Ferrari F8 Tributo
  'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80', // Supercar side profile
  'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=1200&q=80'  // Nissan GT-R Nismo
];

export const getVehicleImage = (vehicle) => {
  if (!vehicle) return automotiveImages[0];
  // Deterministic hash based on VIN or ID or Make+Model
  const seed = vehicle.vin || vehicle.id || `${vehicle.make}-${vehicle.model}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % automotiveImages.length;
  return automotiveImages[index];
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatMileage = (miles) => {
  return new Intl.NumberFormat('en-US').format(miles) + ' mi';
};
