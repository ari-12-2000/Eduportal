import 'next-auth'
import { DefaultSession } from 'next-auth'
import type { User as AppUser } from './user'

declare module 'next-auth' {
    interface User extends AppUser { }

    interface Session {
        user: User & DefaultSession['user']
    }
}

declare module 'next-auth/jwt'{
    interface JWT extends AppUser { }
}