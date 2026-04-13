'use strict';

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const startsWithAny = (value, prefixes) => prefixes.some((prefix) => value.startsWith(prefix));

const containsAny = (value, terms) => terms.some((term) => value.includes(term));

const SHIPPING_ZONES = {
  espana_peninsula: {
    label: 'Espana (Peninsula)',
    method: 'Correos Paq Standard',
    amount: 6.45,
  },
  espana_baleares: {
    label: 'Espana (Baleares)',
    method: 'Correos Paq Standard',
    amount: 9.2,
  },
  espana_canarias: {
    label: 'Espana (Canarias)',
    method: 'Correos (Sujeto a DUA)',
    amount: 14.5,
  },
  europa_cercana: {
    label: 'Europa Cercana',
    method: 'InPost (Punto Pack)',
    amount: 11.5,
  },
  europa_central: {
    label: 'Europa Central',
    method: 'InPost / Packlink',
    amount: 14.9,
  },
  europa_norte_este: {
    label: 'Europa Norte/Este',
    method: 'Correos Int. Economico',
    amount: 24.5,
  },
  norteamerica: {
    label: 'Norteamerica',
    method: 'Correos Int. Economico',
    amount: 31.2,
  },
  latinoamerica: {
    label: 'Latinoamerica',
    method: 'Correos Int. Economico',
    amount: 34.9,
  },
  asia_tier_1: {
    label: 'Asia (Tier 1)',
    method: 'Correos / Zeleris',
    amount: 38.5,
  },
  asia_tier_2: {
    label: 'Asia (Tier 2)',
    method: 'Correos Int. Economico',
    amount: 42,
  },
  resto_mundo: {
    label: 'Resto del mundo',
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

const resolveSpainZone = ({ province, city, postalCode }) => {
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

const resolveZoneByCountry = (country) => {
  if (GROUPS.europa_cercana.has(country)) return 'europa_cercana';
  if (GROUPS.europa_central.has(country)) return 'europa_central';
  if (GROUPS.europa_norte_este.has(country)) return 'europa_norte_este';
  if (GROUPS.norteamerica.has(country)) return 'norteamerica';
  if (GROUPS.latinoamerica.has(country)) return 'latinoamerica';
  if (GROUPS.asia_tier_1.has(country)) return 'asia_tier_1';
  if (GROUPS.asia_tier_2.has(country)) return 'asia_tier_2';
  return 'resto_mundo';
};

const resolveShippingZone = ({ country, province, city, postalCode }) => {
  const normalizedCountry = normalizeText(country);

  if (SPAIN_ALIASES.has(normalizedCountry)) {
    return resolveSpainZone({ province, city, postalCode });
  }

  return resolveZoneByCountry(normalizedCountry);
};

const normalizeRatesByZone = (ratesByZone) => {
  if (!ratesByZone || typeof ratesByZone !== 'object') {
    return {};
  }

  return Object.entries(ratesByZone).reduce((acc, [zoneKey, rate]) => {
    if (!rate || typeof rate !== 'object') {
      return acc;
    }

    const rawAmount = Number(rate.amount);
    const amount = Number.isFinite(rawAmount) && rawAmount >= 0
      ? Number(rawAmount.toFixed(2))
      : null;

    if (amount === null) {
      return acc;
    }

    acc[zoneKey] = {
      label: String(rate.label || SHIPPING_ZONES[zoneKey]?.label || zoneKey).trim(),
      method: String(rate.method || SHIPPING_ZONES[zoneKey]?.method || '').trim(),
      amount,
      currency: String(rate.currency || 'EUR').trim() || 'EUR',
    };

    return acc;
  }, {});
};

const getShippingQuote = ({ country, province, city, postalCode }, options = {}) => {
  const ratesByZone = normalizeRatesByZone(options.ratesByZone);
  const zoneKey = resolveShippingZone({ country, province, city, postalCode });
  const configuredZone = ratesByZone[zoneKey];
  const zone = configuredZone || SHIPPING_ZONES[zoneKey] || SHIPPING_ZONES.resto_mundo;

  return {
    zoneKey,
    zoneLabel: zone.label,
    method: zone.method,
    amount: zone.amount,
    currency: zone.currency || 'EUR',
  };
};

const loadShippingRatesFromStrapi = async (strapi) => {
  if (!strapi || !strapi.entityService) {
    return {};
  }

  try {
    const rows = await strapi.entityService.findMany('api::shipping-rate.shipping-rate', {
      fields: ['zoneKey', 'zoneLabel', 'method', 'amount', 'currency', 'active'],
      filters: { active: true },
      sort: ['zoneKey:asc'],
    });

    const list = Array.isArray(rows) ? rows : [];

    return list.reduce((acc, row) => {
      const zoneKey = String(row?.zoneKey || '').trim();
      const rawAmount = Number(row?.amount);

      if (!zoneKey || !Number.isFinite(rawAmount) || rawAmount < 0) {
        return acc;
      }

      acc[zoneKey] = {
        label: String(row?.zoneLabel || SHIPPING_ZONES[zoneKey]?.label || zoneKey).trim(),
        method: String(row?.method || SHIPPING_ZONES[zoneKey]?.method || '').trim(),
        amount: Number(rawAmount.toFixed(2)),
        currency: String(row?.currency || 'EUR').trim() || 'EUR',
      };

      return acc;
    }, {});
  } catch (error) {
    return {};
  }
};

module.exports = {
  getShippingQuote,
  loadShippingRatesFromStrapi,
  resolveShippingZone,
  SHIPPING_ZONES,
};
