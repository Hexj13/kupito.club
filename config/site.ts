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
  footerPartnerLogoSurfaceDefault: 'light',
  footerPartners: [
    {
      name: 'CipAuto.md',
      href: 'https://cipauto.md/',
      logoSrc: '/partners/cipauto.webp',
      logoWidth: 139,
      logoHeight: 30,
      descriptionKey: 'footer.partnerImportSalesDescription',
    },
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
      descriptionKey: 'footer.partnerImportSalesDescription',
    },
    {
      name: 'A&G MOTORS',
      href: 'https://agmotors.md/',
      logoSrc: '/partners/ag_motors.webp',
      logoWidth: 3262,
      logoHeight: 468,
      logoSurface: 'transparent',
      descriptionKey: 'footer.partnerImportSalesDescription',
    },
  ],
  reportProvider: {
    baseUrls: {
      ro: 'https://infocar.md',
      ru: 'https://ru.infocar.md',
    },
    demoUrls: {
      ro: 'https://infocar.md/demo?from=kupito',
      ru: 'https://ru.infocar.md/demo?from=kupito',
    },
    partnerFrom: 'kupito',
  },
};

export default config;
