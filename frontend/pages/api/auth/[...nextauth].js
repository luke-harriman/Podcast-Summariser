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
          where: {
            email: credentials.username // assuming username is the email
          }
        });

        if (user && await bcrypt.compare(credentials.password, users.password)) {
          return user;
        } else {
          return null;
        }
      }
    }),
  ],
  
  // Add this line to your NextAuth configuration
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    jwt: async ({ token, user }) => {
      // Add user info to the token once signed in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Pass the user ID to the session object
      session.user.id = token.id;
      return session;
    },
  },

  // Ensure your database connection URL is properly configured
  database: process.env.DATABASE_URL,
});
