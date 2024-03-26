import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: {  label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          const user = { id: 1, name: 'User', email: 'user@example.com' }
  
          if (user) {
            return Promise.resolve(user);
          } else {
            return Promise.resolve(null);
          }
        }
      }),
    ],
    database: process.env.DATABASE_URL,
  });
  