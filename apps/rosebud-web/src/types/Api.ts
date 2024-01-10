import { User } from './User'

export type ApiError = {
  code: string
  message: string
  data?: {
    stack?: string
  }
}

export type ApiResponse<T> = {
  error?: ApiError
  response?: T
}

export namespace Device {
  export namespace Create {
    export type Request = {
      user: User
    }

    export type Response = {
      user: User
    }
  }
}
