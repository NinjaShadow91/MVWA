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
  DiscordProvider({
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
  }),
  GithubProvider({
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
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
              userId: true,
              name: true,
              imageId: true,
            },
          });
          if (
            auth &&
            auth.CurrentPassword.numIterations &&
            auth.CurrentPassword.salt &&
            auth.CurrentPassword.hashingAlgorithm == "sha512" &&
            !auth.deletedAt
          ) {
            const derivedKey = pbkdf2Sync(
              credentials.password,
              auth.CurrentPassword.salt,
              auth.CurrentPassword.numIterations,
              64,
              auth.CurrentPassword.hashingAlgorithm
            );

            prisma.userAuthentication.update({
              where: { email: credentials.email },
              data: {
                LoginAttempts: {
                  create: {
                    // Add logic to get ip address and user agent
                    ipAddress: "xxxxxx",
                    userAgent: "xxxxxx",
                    success:
                      derivedKey.toString("hex") ==
                      auth.CurrentPassword.passwordId,
                  },
                },
              },
            });
            if (auth.CurrentPassword.password === derivedKey.toString("hex")) {
              return {
                id: auth.userId,
                name: auth.name,
                email: auth.email,
                image: auth.imageId,
              };
            }
          }
        } catch (err) {
          // Do error handling, log ,etc.
          return null;
        }
        // try {
        //   const auth = await prisma.userAuthentication.findUnique({
        //     where: { email: credentials.email },
        //     select: {
        //       currentPasswordId: true,
        //       deletedAt: true,
        //       email: true,
        //       userId: true,
        //       name: true,
        //       imageId: true,
        //     },
        //   });

        //   if (auth === null) {
        //     return null;
        //   }

        //   const verified = (await prisma.$queryRawUnsafe(
        //     `SELECT * FROM "public"."Password" where "Password"."password"='${credentials.password}' and "Password"."passwordId"='${auth.currentPasswordId}';`
        //   )) as any;
        //   console.log("verified: ", verified);
        //   if (verified.length !== 0) {
        //     return {
        //       id: auth.userId,
        //       name: auth.name,
        //       email: auth.email,
        //       image: auth.imageId,
        //     };
        //   } else return null;
        // } catch (err) {
        //   console.log("err: ", err);
        //   return null;
        // }
      }
      return null;
    },
  }),
];

export type currentOAuthProvidersType = "google" | "github";
