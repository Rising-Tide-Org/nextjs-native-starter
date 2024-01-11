import { CapacitorConfig } from '@capacitor/cli'
import { APP_BUNDLE_URL } from 'lib/utils/config'

const config: CapacitorConfig = {
  appId: APP_BUNDLE_URL,
  appName: 'rosebud',
  webDir: 'out',
  // For live reload: comment out server.
  // server: {
  //   url: 'http://YOUR_IP:3001',
  // },
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: true, // Set this to false to maintain splash screen on screen and fetch data for example on startup
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
}

export default config
