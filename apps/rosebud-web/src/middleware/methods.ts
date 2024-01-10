import type { Middleware } from 'next-api-middleware'

type MethodsType = Array<'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'>

// Middleware to ensure only allowed HTTP methods are used for a specific API endpoint
const methodsFactory = (allowedHttpMethods: MethodsType): Middleware => {
  // This ensures the middleware has a name
  return async function methods(req, res, next) {
    if (
      (allowedHttpMethods as Array<string | undefined>).includes(req.method) ||
      req.method === 'OPTIONS'
    ) {
      return next()
    }

    res.setHeader('Allow', allowedHttpMethods)
    return res.status(405).json({
      errors: [`Only ${allowedHttpMethods.join(', ')} requests are supported.`],
    })
  }
}

export default methodsFactory
