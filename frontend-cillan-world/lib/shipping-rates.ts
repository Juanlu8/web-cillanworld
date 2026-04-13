type ShippingInput = {
  country?: string;
  province?: string;
  city?: string;
  postalCode?: string;
};

export type ShippingQuote = {
  zoneKey: string;
  zoneLabel: string;
  method: string;
  amount: number;
  currency: 'EUR';
};

export type ShippingCountryOption = {
  value: string;
  label: string;
};

export const SHIPPING_COUNTRY_OPTIONS: ShippingCountryOption[] = [
  { value: 'Spain', label: 'Spain' },
  { value: 'France', label: 'France' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Finland', label: 'Finland' },
  { value: 'Czech Republic', label: 'Czech Republic' },
  { value: 'Slovakia', label: 'Slovakia' },
  { value: 'Hungary', label: 'Hungary' },
  { value: 'Romania', label: 'Romania' },
  { value: 'Bulgaria', label: 'Bulgaria' },
  { value: 'Croatia', label: 'Croatia' },
  { value: 'Estonia', label: 'Estonia' },
  { value: 'Latvia', label: 'Latvia' },
  { value: 'Lithuania', label: 'Lithuania' },
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Panama', label: 'Panama' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Chile', label: 'Chile' },
  { value: 'Peru', label: 'Peru' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Uruguay', label: 'Uruguay' },
  { value: 'Paraguay', label: 'Paraguay' },
  { value: 'Bolivia', label: 'Bolivia' },
  { value: 'Dominican Republic', label: 'Dominican Republic' },
  { value: 'Costa Rica', label: 'Costa Rica' },
  { value: 'Guatemala', label: 'Guatemala' },
  { value: 'El Salvador', label: 'El Salvador' },
  { value: 'Honduras', label: 'Honduras' },
  { value: 'Nicaragua', label: 'Nicaragua' },
  { value: 'Venezuela', label: 'Venezuela' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'China', label: 'China' },
  { value: 'Japan', label: 'Japan' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Hong Kong', label: 'Hong Kong' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Taiwan', label: 'Taiwan' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'Vietnam', label: 'Vietnam' },
  { value: 'India', label: 'India' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Philippines', label: 'Philippines' },
];

const normalizeText = (value: string | undefined) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const startsWithAny = (value: string, prefixes: string[]) => prefixes.some((prefix) => value.startsWith(prefix));

const containsAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

const SHIPPING_ZONES: Record<string, Omit<ShippingQuote, 'zoneKey' | 'currency'>> = {
  espana_peninsula: {
    zoneLabel: 'Espana (Peninsula)',
    method: 'Correos Paq Standard',
    amount: 6.45,
  },
  espana_baleares: {
    zoneLabel: 'Espana (Baleares)',
    method: 'Correos Paq Standard',
    amount: 9.2,
  },
  espana_canarias: {
    zoneLabel: 'Espana (Canarias)',
    method: 'Correos (Sujeto a DUA)',
    amount: 14.5,
  },
  europa_cercana: {
    zoneLabel: 'Europa Cercana',
    method: 'InPost (Punto Pack)',
    amount: 11.5,
  },
  europa_central: {
    zoneLabel: 'Europa Central',
    method: 'InPost / Packlink',
    amount: 14.9,
  },
  europa_norte_este: {
    zoneLabel: 'Europa Norte/Este',
    method: 'Correos Int. Economico',
    amount: 24.5,
  },
  norteamerica: {
    zoneLabel: 'Norteamerica',
    method: 'Correos Int. Economico',
    amount: 31.2,
  },
  latinoamerica: {
    zoneLabel: 'Latinoamerica',
    method: 'Correos Int. Economico',
    amount: 34.9,
  },
  asia_tier_1: {
    zoneLabel: 'Asia (Tier 1)',
    method: 'Correos / Zeleris',
    amount: 38.5,
  },
  asia_tier_2: {
    zoneLabel: 'Asia (Tier 2)',
    method: 'Correos Int. Economico',
    amount: 42,
  },
  resto_mundo: {
    zoneLabel: 'Resto del mundo',
    method: 'Correos Int. Economico',
    amount: 42,
  },
};

const GROUPS = {
  europa_cercana: new Set(['france', 'francia', 'belgium', 'belgica', 'portugal', 'pt', 'fr', 'be']),
  europa_central: new Set([
    'germany',
    'alemania',
    'italy',
    'italia',
    'netherlands',
    'holland',
    'holanda',
    'de',
    'it',
    'nl',
  ]),
  europa_norte_este: new Set([
    'poland',
    'polonia',
    'sweden',
    'suecia',
    'austria',
    'pl',
    'se',
    'at',
    'norway',
    'noruega',
    'denmark',
    'dinamarca',
    'finland',
    'finlandia',
    'czech republic',
    'republica checa',
    'czechia',
    'slovakia',
    'eslovaquia',
    'hungary',
    'hungria',
    'romania',
    'bulgaria',
    'croatia',
    'croacia',
    'estonia',
    'latvia',
    'letonia',
    'lithuania',
    'lituania',
    'ee',
    'lv',
    'lt',
    'ro',
    'bg',
    'hr',
    'no',
    'dk',
    'fi',
    'cz',
    'sk',
    'hu',
  ]),
  norteamerica: new Set([
    'united states',
    'estados unidos',
    'usa',
    'us',
    'canada',
    'ca',
    'puerto rico',
    'pr',
    'mexico',
    'mx',
  ]),
  latinoamerica: new Set([
    'panama',
    'pa',
    'colombia',
    'co',
    'argentina',
    'ar',
    'chile',
    'cl',
    'peru',
    'pe',
    'ecuador',
    'ec',
    'uruguay',
    'uy',
    'paraguay',
    'py',
    'bolivia',
    'bo',
    'dominican republic',
    'republica dominicana',
    'do',
    'costa rica',
    'cr',
    'guatemala',
    'gt',
    'el salvador',
    'sv',
    'honduras',
    'hn',
    'nicaragua',
    'ni',
    'venezuela',
    've',
    'brazil',
    'brasil',
    'br',
  ]),
  asia_tier_1: new Set([
    'china',
    'cn',
    'japan',
    'japon',
    'jp',
    'south korea',
    'korea del sur',
    'korea',
    'kr',
    'hong kong',
    'hk',
    'singapore',
    'sg',
    'taiwan',
    'tw',
  ]),
  asia_tier_2: new Set([
    'thailand',
    'tailandia',
    'th',
    'vietnam',
    'vn',
    'india',
    'in',
    'indonesia',
    'id',
    'malaysia',
    'my',
    'philippines',
    'filipinas',
    'ph',
  ]),
};

const SPAIN_ALIASES = new Set(['es', 'espana', 'espana peninsula', 'spain', 'reino de espana']);

const BALEARES_TERMS = [
  'baleares',
  'illes balears',
  'mallorca',
  'menorca',
  'ibiza',
  'formentera',
  'palma',
];

const CANARIAS_TERMS = [
  'canarias',
  'las palmas',
  'santa cruz de tenerife',
  'tenerife',
  'gran canaria',
  'fuerteventura',
  'lanzarote',
  'la palma',
  'la gomera',
  'el hierro',
];

const resolveSpainZone = ({ province, city, postalCode }: ShippingInput) => {
  const provinceNormalized = normalizeText(province);
  const cityNormalized = normalizeText(city);
  const postal = String(postalCode || '').trim();

  if (
    containsAny(provinceNormalized, BALEARES_TERMS) ||
    containsAny(cityNormalized, BALEARES_TERMS) ||
    startsWithAny(postal, ['07'])
  ) {
    return 'espana_baleares';
  }

  if (
    containsAny(provinceNormalized, CANARIAS_TERMS) ||
    containsAny(cityNormalized, CANARIAS_TERMS) ||
    startsWithAny(postal, ['35', '38'])
  ) {
    return 'espana_canarias';
  }

  return 'espana_peninsula';
};

const resolveZoneByCountry = (country: string) => {
  if (GROUPS.europa_cercana.has(country)) return 'europa_cercana';
  if (GROUPS.europa_central.has(country)) return 'europa_central';
  if (GROUPS.europa_norte_este.has(country)) return 'europa_norte_este';
  if (GROUPS.norteamerica.has(country)) return 'norteamerica';
  if (GROUPS.latinoamerica.has(country)) return 'latinoamerica';
  if (GROUPS.asia_tier_1.has(country)) return 'asia_tier_1';
  if (GROUPS.asia_tier_2.has(country)) return 'asia_tier_2';
  return 'resto_mundo';
};

export const resolveShippingZone = (input: ShippingInput) => {
  const normalizedCountry = normalizeText(input.country);

  if (SPAIN_ALIASES.has(normalizedCountry)) {
    return resolveSpainZone(input);
  }

  return resolveZoneByCountry(normalizedCountry);
};

export const getShippingQuote = (input: ShippingInput): ShippingQuote => {
  const zoneKey = resolveShippingZone(input);
  const zone = SHIPPING_ZONES[zoneKey] || SHIPPING_ZONES.resto_mundo;

  return {
    zoneKey,
    zoneLabel: zone.zoneLabel,
    method: zone.method,
    amount: zone.amount,
    currency: 'EUR',
  };
};
