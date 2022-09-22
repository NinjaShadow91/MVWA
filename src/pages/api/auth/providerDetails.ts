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
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user && user.iteration && user.salt) {
          const derivedKey = pbkdf2Sync(
            credentials.password,
            user.salt,
            user.iteration,
            64,
            "sha512"
          );
          console.log(user, credentials.password, derivedKey.toString("hex"));
          if (user.password === derivedKey.toString("hex")) return user;
          console.log("ch");
        }
      }
      return null;
    },
  }),
];

export type currentOAuthProvidersType = "google" | "github";
