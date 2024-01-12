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
  // enables live reload when dev'ing on connected device  
  // comment this out if you want to test the built bundle
  // via `pnpm build` in rosebud-app
  config.server = {
    url: 'http://192.168.0.146:3000',
  }
}

export default config
