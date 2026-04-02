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
  footerPartners: [
    {
      name: 'INFOCAR.md',
      href: 'https://infocar.md/?from=kupito',
      logoSrc: '/partners/infocar.webp',
      logoWidth: 189,
      logoHeight: 48,
      descriptionKey: 'footer.partnerInfocarDescription',
    },
    {
      name: 'Factum Auto',
      href: 'https://factum-auto.com/',
      logoSrc: '/partners/factum.webp',
      logoWidth: 800,
      logoHeight: 203,
      logoSurface: 'transparent',
      descriptionKey: 'footer.partnerFactumDescription',
    },
  ],
};

export default config;
