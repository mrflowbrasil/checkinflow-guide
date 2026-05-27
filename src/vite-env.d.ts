/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
  fbq: (...args: any[]) => void;
  _fbq: any;
}
