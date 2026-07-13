// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    username: string
    avatar?: string
    role: 'customer' | 'agent' | 'admin'
  }
}

export {}
