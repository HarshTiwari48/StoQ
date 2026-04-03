import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User      from "@/models/User";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;

      try {
        await connectDB();

        // Upsert: create user on first login, skip on subsequent logins
        await User.findOneAndUpdate(
          { googleId: profile.sub },
          {
            googleId: profile.sub,
            email:    profile.email,
            name:     profile.name ?? "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            picture:  (profile as any).picture ?? "",
          },
          { upsert: true, new: true }
        );

        return true;
      } catch (err) {
        console.error("SignIn error:", err);
        return false;
      }
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        await connectDB();

        // Attach MongoDB _id to the session so APIs can use it
        const dbUser = await User.findOne({ googleId: token.sub }).lean();
        if (dbUser) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          session.user.id = (dbUser._id as any).toString();
        }
      }
      return session;
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.sub = profile.sub;
      }
      return token;
    },
  },

  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };