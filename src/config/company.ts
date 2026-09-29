/**
 * Centralized configuration for the hackathon demo company.
 *
 * GOAT is a fictional consumer-electronics company inspired by Indian consumer-audio brands.
 * Note: GOAT is our fictional demo company. Real competitors (boAt, Noise, Boult, JBL, Sony)
 * are researched from the live web for competitive intelligence.
 */

export interface AppConfig {
  name: string;
  fullName: string;
  tagline: string;
  description: string;
}

export const APP_CONFIG: AppConfig = {
  name: 'BizMind',
  fullName: 'BizMind Decision Intelligence',
  tagline: 'Hindsight-Powered Decision Intelligence',
  description:
    'An institutional memory decision intelligence platform that remembers what your company tried, why it tried it, what happened afterward, and uses those experiences when analyzing future decisions.',
};

export interface ProductConfig {
  id: string;
  name: string;
  category: string;
  baselinePrice: number;
  description: string;
}

export interface DemoCompanyConfig {
  name: string;
  fullName: string;
  industry: string;
  primaryCategory: string;
  market: string;
  currency: string;
  currencySymbol: string;
  businessAreas: string[];
  products: ProductConfig[];
}

export const DEMO_COMPANY: DemoCompanyConfig = {
  name: 'GOAT',
  fullName: 'GOAT Consumer Electronics India',
  industry: 'Consumer Electronics',
  primaryCategory: 'Headphones & Audio',
  market: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  businessAreas: [
    'Wireless headphones',
    'Wireless earbuds',
    'Bluetooth speakers',
    'Audio accessories',
  ],
  products: [
    {
      id: 'goat-rockerz-550',
      name: 'GOAT Rockerz 550',
      category: 'Wireless Headphones',
      baselinePrice: 1499,
      description: 'Over-ear wireless headphones with dynamic bass and 20h playtime.',
    },
    {
      id: 'goat-airdopes-141',
      name: 'GOAT Airdopes 141',
      category: 'True Wireless Earbuds',
      baselinePrice: 1299,
      description: 'True wireless earbuds with low latency BEAST mode and 42h battery.',
    },
    {
      id: 'goat-nirvana-751',
      name: 'GOAT Nirvana 751',
      category: 'Premium Wireless Headphones',
      baselinePrice: 3499,
      description: 'Active noise-cancelling premium over-ear headphones.',
    },
    {
      id: 'goat-stone-350',
      name: 'GOAT Stone 350',
      category: 'Bluetooth Speaker',
      baselinePrice: 1499,
      description: 'Portable 10W wireless Bluetooth speaker with IPX7 water resistance.',
    },
  ],
};

export const GOAT_COMPANY = DEMO_COMPANY;

export interface GoatProductItem {
  id: string;
  name: string;
  category: string;
  baselinePrice: number;
  typicalPrice: number;
  description: string;
}

export const GOAT_PRODUCTS: GoatProductItem[] = DEMO_COMPANY.products.map((p) => ({
  ...p,
  typicalPrice: p.baselinePrice,
}));

export const GOAT_PRODUCT_NAMES: string[] = DEMO_COMPANY.products.map((p) => p.name);
