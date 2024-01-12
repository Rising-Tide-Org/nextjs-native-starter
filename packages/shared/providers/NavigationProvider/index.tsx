import { Box, useColorMode, useTheme } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import useIsMobile from 'shared/hooks/useIsMobile'
import { kTabBarTopPadding } from 'shared/ui/constants'
import MotionBox from 'shared/ui/core/MotionBox'

type ViewState = {
  view: ReactNode
  route?: string // The route that this view is associated with
  key: number // Unique key for rendering performance, e.g. Date.now()
  animated?: boolean
}

type PushViewOptions = {
  route?: string
  query?: ParsedUrlQuery
  animated?: boolean
}

type NavigationProviderContextType = {
  popToRootView: () => void // Pops all the way back
  pushView: (view: React.ReactNode, options?: PushViewOptions) => void
  popView: () => void
  views: ViewState[]
  baseRoute: string
}

const defaultEntryContext = {
  views: [],
} as unknown as NavigationProviderContextType

export const NavigationProviderContext =
  createContext<NavigationProviderContextType>(defaultEntryContext)

/**
 * React hook that reads from `NavigationProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useNavigationProvider = () => {
  const context = useContext(NavigationProviderContext)
  if (context === undefined) {
    throw new Error(
      'useNavigationProvider must be used within a NavigationProvider'
    )
  }
  return context
}

type Props = {
  rootView: ReactNode // The root view to render
  baseRoute: string // The base route for the navigation stack
  allowDesktop?: boolean // Whether or not to allow the navigation stack to be used on desktop
}

export function NavigationProvider({
  rootView,
  baseRoute,
  allowDesktop = false,
}: Props) {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useIsMobile()
  const { colorMode } = useColorMode()

  const [views, setViews] = React.useState<ViewState[]>([
    { view: rootView, key: Date.now(), route: baseRoute, animated: true },
  ])

  const poppedViews = useRef<ViewState[]>([])

  /**
   * Pops all the way back to the root view
   */
  const popToRootView = useCallback(() => {
    router.push(baseRoute, undefined, { shallow: true })
    setViews([views[0]])
  }, [baseRoute, router, views])

  /**
   * Pushes a new view onto the stack
   */
  const pushView = useCallback(
    (view: React.ReactNode, options: PushViewOptions = {}) => {
      const { route, query, animated = true } = options

      // Don't push the same view twice, if it has a route
      const isInViewStack = Boolean(views.find((v) => v.route === route))
      if (isInViewStack && route) {
        return
      }
      if (route) {
        poppedViews.current = []
        router.push({ pathname: route, query }, undefined, { shallow: true })
      }
      setViews((prev) => [
        ...prev,
        {
          view,
          key: Date.now(),
          route,
          query,
          animated,
        },
      ])
    },
    [router, views]
  )

  /**
   * Pops the current view off the stack
   * We track popped views in a separate stack so that we can puash them back on
   * when the user clicks the browser forward button
   */
  const popView = useCallback(() => {
    let newViews = [...views]
    if (newViews.length > 1) {
      newViews = newViews.slice(0, newViews.length - 1)
    }
    const newView = newViews[newViews.length - 1]
    if (newView.route) {
      poppedViews.current.push(views[views.length - 1])
      router.push(newView.route, undefined, { shallow: true })
    }
    setViews(newViews)
  }, [router, views])

  /**
   * Respond to route changes
   *
   * If the current route is in the view stack, pop to top view (back button)
   * Otherwise, if the current route is in the popped views stack, push it back onto the view stack (forward button)
   */
  useEffect(() => {
    const handleRouteChange = () => {
      const isInViewStack = Boolean(
        views.find((view) => view.route === router.asPath)
      )
      if (
        isInViewStack &&
        router.asPath !== views[views.length - 1].route &&
        views.length > 1
      ) {
        popView()
      } else if (!isInViewStack) {
        const isPoppedView = Boolean(
          poppedViews.current.find((view) => view.route === router.asPath)
        )
        if (isPoppedView) {
          const poppedView = poppedViews.current.pop()
          if (poppedView) {
            setViews((prev) => [...prev, poppedView])
          }
        }
      }
    }
    if (isMobile) {
      router.events.on('routeChangeComplete', handleRouteChange)
    }
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [isMobile, popView, router, views])

  /**
   * In the event of a user resizing the window, we want to ensure that
   * the mobile navigation stack gets reset
   */
  useEffect(() => {
    if (!isMobile && !allowDesktop && views.length > 1) {
      setViews([views[0]])
    }
  }, [allowDesktop, isMobile, views])

  const context = useMemo(
    () => ({
      views,
      popToRootView,
      pushView,
      popView,
      baseRoute,
    }),
    [views, popToRootView, pushView, popView, baseRoute]
  )

  return (
    <NavigationProviderContext.Provider value={context}>
      <Box flex={1} overflowY='auto'>
        <AnimatePresence>
          {views.map((view, index) => {
            const isTopView = index === views.length - 1
            const isRootView = index === 0

            return (
              <MotionBox
                key={view.key}
                initial={
                  view.animated && isTopView && !isRootView
                    ? { x: window.innerWidth }
                    : {}
                }
                exit={{ x: window.innerWidth }}
                animate={
                  view.animated
                    ? {
                        x: isTopView ? 0 : -window.innerWidth / 4,
                      }
                    : {}
                }
                transition={{
                  duration: 0.3,
                  ease: [0.43, 0.13, 0.23, 1],
                }}
                zIndex={isRootView ? index : theme.zIndices.pushed + index} // Ensuring that higher indexed pages appear above
                position='absolute'
                left={0}
                right={0}
                bottom={0}
                top={0}
                overflowY='auto'
                boxShadow={
                  !isRootView ? '0px 0px 20px rgba(0, 0, 0, 0.1)' : 'none'
                }
              >
                <Box
                  h='full'
                  pb={{ base: kTabBarTopPadding, md: 0 }}
                  overflowY='auto'
                  bg={
                    !isRootView
                      ? colorMode === 'dark'
                        ? 'brandGray.900'
                        : 'white'
                      : 'initial'
                  }
                >
                  {view.view}
                </Box>
              </MotionBox>
            )
          })}
        </AnimatePresence>
      </Box>
    </NavigationProviderContext.Provider>
  )
}
