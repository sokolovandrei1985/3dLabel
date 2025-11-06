interface User {
  email: string
  firstName?: string
  lastName?: string
}

export type IAuthUser = User | null