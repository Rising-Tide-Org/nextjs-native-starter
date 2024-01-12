import NextCors from 'nextjs-cors'
import { ALLOWED_CORS_URLS } from 'lib/utils/config'
import { Middleware } from 'next-api-middleware'

const enableCors = (): Middleware => {
  return async function cors(req, res, next) {
    await NextCors(req, res, {
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      origin: ALLOWED_CORS_URLS,
      credentials: true,
      allowedHeaders: ['content-type'],
    })

    return next()
  }
}

export default enableCors
