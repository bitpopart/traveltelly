import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.traveltelly.app',
  appName: 'TravelTelly',
  webDir: 'dist',
  server: {
    hostname: 'traveltelly.com',
    androidScheme: 'https',
    iosScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#f4f4f5'
  }
};

export default config;
