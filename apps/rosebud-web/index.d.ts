type StaticImageData = {
  src: string
  height: number
  width: number
  placeholder?: string
}

declare module 'firestore-parser'

declare module '*.png' {
  const content: StaticImageData
  export default content
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>
  export default content
}

declare module '*.jpg' {
  const content: StaticImageData
  export default content
}

declare module '*.jpeg' {
  const content: StaticImageData
  export default content
}

declare module '*.gif' {
  const content: StaticImageData
  export default content
}

declare module '*.webp' {
  const content: StaticImageData
  export default content
}

declare module '*.ico' {
  const content: StaticImageData
  export default content
}

declare module '*.bmp' {
  const content: StaticImageData
  export default content
}

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * Only supported on Chrome and Android Webview.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent#browser_compatibility
 */
type BeforeInstallPromptEvent = {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>
} & Event

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}
