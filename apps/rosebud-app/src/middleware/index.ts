import tokenVerification from './tokenVerification'
import allowedHttpMethods from './methods'
import { use } from 'next-api-middleware'

type MiddlewareOptionsType = {
  authenticated?: boolean
  methods?: Array<'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'>
}

const withMiddleware = ({
  authenticated = true,
  methods = ['GET'],
}: MiddlewareOptionsType = {}) => {
  return use(
    allowedHttpMethods(methods),
    authenticated ? tokenVerification : []
  )
}

export default withMiddleware
