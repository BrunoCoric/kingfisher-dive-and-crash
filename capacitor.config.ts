import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.kingfisher.diveandcrash',
  appName: 'Kingfisher',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config