import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { providersOfNextAuth } from "./providerDetails";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { decode, encode } from "next-auth/jwt";
import { randomUUID } from "crypto";
import { Adapter } from "next-auth/adapters";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";

export function authOptions({
  adapter,
  req,
  res,
}: {
  adapter: Adapter;
  req: NextApiRequest;
  res: NextApiResponse;
}): NextAuthOptions {
  return {
    adapter: adapter,
    callbacks: {
      async session({ session, user, token }) {
        if (session.user && user) {
          session.user.id = user.id;
        }
        if (session.user && token && token.id) session.user.id = token.id;
        return session;
      },
      jwt: async ({ token, user }) => {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async signIn({ user, account, profile, email, credentials }) {
        // Check if this sign in callback is being called in the credentials authentication flow. If so, use the next-auth adapter to create a session entry in the database (SignIn is called after authorize so we can safely assume the user is valid and already authenticated).
        if (
          req.query.nextauth!.includes("callback") &&
          req.query.nextauth!.includes("credentials") &&
          req.method === "POST"
        ) {
          if (user) {
            const sessionToken = randomUUID();
            const sessionExpiry = new Date(Date.now() + 15 * 1000);

            await adapter.createSession({
              sessionToken: sessionToken,
              userId: user.id,
              expires: sessionExpiry,
            });

            res.setHeader(
              "Set-Cookie",
              serialize("next-auth.session-token", sessionToken, {
                path: "/",
                expires: sessionExpiry,
              })
            );
          }
        }

        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      // error: "/auth/error", // Error code passed in query string as ?error=
      // verifyRequest: "/auth/verify-request", // used for check email message
      //newUser: "/auth/new-user", // New users will be directed here on first sign in
    },
    jwt: {
      encode: async ({ token, secret, maxAge }) => {
        if (
          req.query.nextauth!.includes("callback") &&
          req.query.nextauth!.includes("credentials") &&
          req.method === "POST"
        ) {
          const cookie = req.cookies["next-auth.session-token"];

          if (cookie) return cookie;
          else return "";
        }
        // Revert to default behaviour when not in the credentials provider callback flow
        return encode({ token, secret, maxAge });
      },
      decode: async ({ token, secret }) => {
        if (
          req.query.nextauth!.includes("callback") &&
          req.query.nextauth!.includes("credentials") &&
          req.method === "POST"
        ) {
          return null;
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return decode({ token, secret });
      },
    },
    providers: providersOfNextAuth,
  };
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Include user.id on session
  const adapter = PrismaAdapter(prisma);
  const session = await getServerAuthSession({ req, res });
  if (session && req.query.nextauth!.includes("signin")) {
    return res.redirect("/"); // redirect to home page
  }
  return await NextAuth(req, res, authOptions({ adapter, req, res }));
}
