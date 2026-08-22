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

export interface MobileAppConfig {
  enabled: boolean;
  androidUrl: string | null;
  iosUrl: string | null;
  androidPackageName?: string;
}

export interface SocialLinksConfig {
  tiktok?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
}

export type HeaderLogoBox = {
  width: number;
  height: number;
};

export type HeaderLogoConfig = {
  desktop: HeaderLogoBox;
  mobile: HeaderLogoBox;
};

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
  headerLogo?: HeaderLogoConfig;
  mobileApp?: MobileAppConfig;
  socialLinks?: SocialLinksConfig;
  footerPartnerLogoSurfaceDefault?: "light" | "transparent";
  footerPartners?: Array<{
    name: string;
    href: string;
    logoSrc: string;
    logoWidth?: number;
    logoHeight?: number;
    logoSurface?: "light" | "transparent";
    logoBackgroundColor?: string;
    descriptionKey?: string;
  }>;
  reportProvider?: ReportProviderConfig;
}
