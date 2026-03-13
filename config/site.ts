import type { SiteConfig } from '../site-config';

const config: SiteConfig = {
  country: 'md',
  name: 'Kupito',
  domain: 'kupito.club',
  locale: 'ro-MD',
  currency: 'EUR',
  currencies: ['EUR', 'MDL'] as const,
  countryCode: 'MD',
  supportEmail: 'support@kupito.club',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://kupito.club',
  assetVersion: '20260313',
};

export default config;
