/**
 * Curated make/model -> studio imagery resolver.
 * Images live in /public/vehicles so they are always available (no CDN dependency).
 * Rules are evaluated in order; the first match wins.
 */
const IMG = '/vehicles';

export const FALLBACK_IMAGE = `${IMG}/garage-bg.jpg`;
export const GARAGE_BACKGROUND = `${IMG}/garage-bg.jpg`;

const SUV_PATTERN = /(x5|x6|x7|cayenne|macan|g ?63|g-?class|rs ?q8|q7|q8|urus|suv|tahoe|defender)/i;

const RULES = [
  { make: /porsche/i, model: /cayenne|macan/i, src: `${IMG}/performance-suv.jpg`, transmission: '8-Spd Tiptronic' },
  { make: /porsche/i, model: /.*/, src: `${IMG}/porsche-911.jpg`, transmission: '7-Spd PDK' },

  { make: /bmw/i, model: /x\d/i, src: `${IMG}/performance-suv.jpg`, transmission: '8-Spd M Steptronic' },
  { make: /bmw/i, model: /.*/, src: `${IMG}/bmw-m4.jpg`, transmission: '8-Spd M Steptronic' },

  { make: /mercedes/i, model: SUV_PATTERN, src: `${IMG}/performance-suv.jpg`, transmission: '9-Spd AMG Speedshift' },
  { make: /mercedes/i, model: /.*/, src: `${IMG}/mercedes-amg-gt.jpg`, transmission: '9-Spd AMG MCT' },

  { make: /audi/i, model: /q\d/i, src: `${IMG}/performance-suv.jpg`, transmission: '8-Spd Tiptronic' },
  { make: /audi/i, model: /.*/, src: `${IMG}/audi-rs6.jpg`, transmission: '8-Spd Tiptronic' },

  { make: /ford/i, model: /mustang/i, src: `${IMG}/ford-mustang.jpg`, transmission: '6-Spd Manual' },
  { make: /chevrolet|chevy/i, model: /corvette/i, src: `${IMG}/corvette-z06.jpg`, transmission: '8-Spd DCT' },
  { make: /tesla/i, model: /.*/, src: `${IMG}/tesla-model-s.jpg`, transmission: 'Single-Speed EV' },
  { make: /aston/i, model: /.*/, src: `${IMG}/aston-martin-vantage.jpg`, transmission: '8-Spd ZF Auto' }
];

/**
 * Resolve imagery + static spec metadata for a vehicle.
 * @returns {{ src: string, transmission: string|null, isFallback: boolean }}
 */
export const resolveVehicleMedia = (vehicle) => {
  const make = vehicle?.make || '';
  const model = vehicle?.model || '';

  const rule = RULES.find((r) => r.make.test(make) && r.model.test(model));
  if (rule) {
    return { src: rule.src, transmission: rule.transmission, isFallback: false };
  }

  if (SUV_PATTERN.test(model)) {
    return { src: `${IMG}/performance-suv.jpg`, transmission: null, isFallback: false };
  }

  return { src: FALLBACK_IMAGE, transmission: null, isFallback: true };
};

export const getVehicleImageUrl = (vehicle) => resolveVehicleMedia(vehicle).src;

/** Brands offered in the showroom filter bar. */
export const BRAND_OPTIONS = [
  'Porsche',
  'BMW',
  'Mercedes',
  'Audi',
  'Ford',
  'Chevrolet',
  'Tesla',
  'Aston Martin'
];
