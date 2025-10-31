import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        url: "https://www.linkedin.com/oauth/v2/authorization",
        scope: "openid profile email w_member_social"
      },
      token: {
        url: "https://www.linkedin.com/oauth/v2/accessToken",
      },
      userinfo: {
        url: "https://api.linkedin.com/v2/userinfo",
      },
      issuer: "https://www.linkedin.com/oauth",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      const exists = await User.findOne({ email: user.email });
      if (!exists) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          linkedinId: account.providerAccountId,
        });
      }
      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token; 
        token.linkedinId = account.providerAccountId; 
      }
      return token;
    },


    async session({ session, token }) {
      session.accessToken = token.accessToken; 
      session.linkedinId = token.linkedinId;   
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };