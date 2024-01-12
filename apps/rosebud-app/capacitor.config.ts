import { CapacitorConfig } from '@capacitor/cli'
import { APP_BUNDLE_URL } from 'lib/utils/config'

const config: CapacitorConfig = {
  appId: APP_BUNDLE_URL,
  appName: 'rosebud',
  webDir: 'out',
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
    CapacitorHttp: {
      enabled: true
    }
  },
}

if (process.env.NODE_ENV === 'development') {
  // enable live reload when dev'in on connected device
  config.server = {
    url: 'http://192.168.0.146:3000',
  }
}

export default config
