import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4f703af6b25643279941b725eb84d0da',
  appName: 'risk-radar-poa-social',
  webDir: 'dist',
  server: {
    url: 'https://4f703af6-b256-4327-9941-b725eb84d0da.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#3b82f6",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#3b82f6'
    }
  }
};

export default config;