import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const user = await prisma.users.findUnique({
          where: { email: credentials.username }, 
          select: {
            user_id: true,
            email: true,
            password: true
          }
        });
      
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return {
            user_id: user.user_id,
            email: user.email,
          };
        } else {
          return null;
        }
      }
    }),
  ],
  

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 24 * 60 * 60, // 24 hours in seconds
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user_id = user.user_id;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = { user_id: token.user_id, email: token.email };
      return session;
    },
  },
  pages: {
    signIn: '/login'
  },
  database: process.env.DATABASE_URL,
});
