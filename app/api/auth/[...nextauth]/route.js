// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        url: "https://www.linkedin.com/oauth/v2/authorization",
        params: {
          scope: "openid profile email w_member_social", // MOVED HERE
        },
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
          linkedinSub: profile.sub,
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
      try {
        await connectDB();
        const exists = await User.findOne({ email: user.email });
        if (!exists) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            linkedinId: account.providerAccountId,
            linkedinSub: user.linkedinSub,
          });
        }
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.linkedinId = account.providerAccountId;
        console.log("Access token obtained:", token.accessToken?.substring(0, 20) + "...");
        console.log("Account scope:", account.scope); // Check what scopes were granted
      }
      if (user?.linkedinSub) {
        token.linkedinSub = user.linkedinSub;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.linkedinId = token.linkedinId;
      session.linkedinSub = token.linkedinSub;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };