import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { GlobalVariables } from "@/globalVariables";
import { Admin } from "@/lib/generated/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any): Promise<any> {
        try {
          let learner = await prisma.learner.findUnique({
            where: { email: credentials.email }
          })

          let userType = GlobalVariables.non_admin.role1;
          let admin

          if (!learner) {
            admin = await prisma.admin.findUnique({ where: { email: credentials.email } })
            if (!admin) {
              return null;
            }
            userType = GlobalVariables.admin
          }

          const user = admin || learner
          const isPasswordValid = await bcrypt.compare(credentials.password, user!.password!)
          if (!isPasswordValid) {
           return null;
          }

          if (userType === GlobalVariables.admin) {
            await prisma.admin.update({
              where: { email: credentials.email },
              data: { lastLogin: new Date() },
            })
          }

          const userData = {
            id: user!.id,
            email: user!.email,
            role: userType,
            adminType: userType === GlobalVariables.admin ? (user as Admin).adminType : undefined,
          }
          return userData

        } catch (err) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id)
        token.role = user.role
        token.adminType = user.adminType
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = String(token.id)
        session.user.role = token.role
        session.user.adminType = token.adminType
        session.user.email = token.email
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
}