export interface ReportProviderConfig {
  baseUrls: Record<string, string>;
  demoUrls: Record<string, string>;
  partnerFrom: string;
}

export interface LocaleRoutingConfig {
  defaultLocale: string;
  supportedLocales: readonly string[];
  prefixedLocales: readonly string[];
  enableLegacyDefaultLocaleRedirect?: boolean;
  enableLegacyRoPathRedirect?: boolean;
  languageSwitcherTranslationKeys?: Readonly<Record<string, string>>;
}

export interface MobileAppLinks {
  enabled: boolean;
  androidUrl: string | null;
  iosUrl: string | null;
}

export interface SiteConfig {
  country: string;
  name: string;
  domain: string;
  locale: string;
  currency: string;
  currencies: readonly string[];
  countryCode: string;
  supportEmail: string;
  siteUrl: string;
  localeRouting?: LocaleRoutingConfig;
  assetVersion?: string;
  footerPartnerLogoSurfaceDefault?: 'light' | 'transparent';
  footerPartners?: Array<{
    name: string;
    href: string;
    logoSrc: string;
    logoWidth?: number;
    logoHeight?: number;
    logoSurface?: 'light' | 'transparent';
    logoBackgroundColor?: string;
    descriptionKey?: string;
  }>;
  reportProvider?: ReportProviderConfig;
  mobileApp?: MobileAppLinks;
}
