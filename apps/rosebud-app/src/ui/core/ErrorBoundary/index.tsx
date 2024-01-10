import { Heading } from '@chakra-ui/react'
import { captureException } from '@sentry/nextjs'
import Analytics from 'lib/analytics'
import React, { Component } from 'react'
import { getStackTrace } from 'util/error'

const renderDefaultErrorMessage = () => <Heading>Something went wrong</Heading>

type Props = {
  children: React.ReactNode
  onError: (error: Error, info: React.ErrorInfo) => void
  errorRender?: (props: any) => React.ReactNode
  errorComponent?: React.ComponentType<any> | null
}

const defaultProps = {
  children: null,
  errorRender: renderDefaultErrorMessage,
  errorComponent: null,
  onError: () => {},
}

class WithErrorBoundary extends Component<
  Props,
  {
    hasError: boolean
  }
> {
  constructor(props: Props = defaultProps) {
    super(props)

    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught in ErrorBoundary', error, info)
    Analytics.trackEvent('boundary.error', {
      error: error.message,
      info: info.componentStack,
      stack: getStackTrace(),
    })
    captureException(error)
    this.props.onError(error, info)
  }

  render() {
    const { children, errorComponent, errorRender, ...otherProps } = this.props
    const { hasError } = this.state

    if (hasError) {
      return errorComponent
        ? React.createElement(errorComponent, otherProps)
        : errorRender?.(otherProps)
    }

    return children
  }
}

export default WithErrorBoundary
