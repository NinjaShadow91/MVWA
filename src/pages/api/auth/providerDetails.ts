import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { Provider } from "next-auth/providers";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { pbkdf2Sync } from "node:crypto";

export const providersOfNextAuth: Provider[] = [
  GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  }),
  GithubProvider({
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  }),
  DiscordProvider({
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
  }),
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "Enter your email",
      },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials, req) => {
      if (credentials !== null && credentials !== undefined) {
        try {
          const auth = await prisma.userAuthentication.findUnique({
            where: { email: credentials.email },
            select: {
              CurrentPassword: true,
              deletedAt: true,
              email: true,
              name: true,
              Image: { select: { url: true } },
            },
          });
          if (
            auth &&
            auth.CurrentPassword.numIterations &&
            auth.CurrentPassword.salt &&
            !auth.deletedAt
          ) {
            const derivedKey = pbkdf2Sync(
              credentials.password,
              auth.CurrentPassword.salt,
              auth.CurrentPassword.numIterations,
              64,
              "sha512"
            );
            // console.log(user, credentials.password, derivedKey.toString("hex"));
            if (auth.CurrentPassword.password === derivedKey.toString("hex")) {
              return {
                email: auth.email,
                name: auth.name,
                image: auth.Image?.url ?? "",
              };
            }
          }
        } catch (err) {
          // Do error handling, log ,etc.
          return null;
        }
      }
      return null;
    },
  }),
];

export type currentOAuthProvidersType = "google" | "github";
