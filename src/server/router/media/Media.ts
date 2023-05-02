import { createProtectedRouter, createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";
import { randomBytes, pbkdf2 } from "node:crypto";
const ITERATIONS = 10;

export const UserMediaRouter = createProtectedRouter().mutation("add", {
  input: z.number().positive(),
  resolve: async ({ ctx, input }) => {
    try {
      const tokens: string[] = [];
      for (let i = 0; i < input; ++i) {
        const token = randomBytes(128).toString("hex");
        await new Promise<string>((resolve, reject) => {
          pbkdf2(
            token,
            "",
            ITERATIONS,
            64,
            "sha512",
            async (err, derivedToken) => {
              if (err) reject(err);
              else resolve(derivedToken.toString("hex"));
            }
          );
        }).then(async (derivedToken) => {
          try {
            const media = await ctx.prisma.media.create({
              data: {
                ownerId: ctx.session.user.id,
                url: "",
                altText: "",
                Type: {
                  connect: {
                    name: "NOT_UPLOADED",
                  },
                },
              },
            });

            await ctx.prisma.verificationToken.create({
              data: {
                identifier: media.mediaId,
                token: derivedToken,
                type: "IMAGE_OPERATION",
                expires: new Date(new Date().getTime() + 10 * 60 * 1000),
              },
            });
            tokens.push(token);
            console.log(token);
          } catch (err) {
            throw throwPrismaTRPCError({
              cause: err,
              message: "Something went bad.",
            });
          }
        });
      }
      return tokens;
    } catch (err) {
      throw throwTRPCError({
        cause: err,
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went bad.",
      });
    }
  },
});

export const MediaRouter = createRouter()
  .query("get", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const media = await ctx.prisma.media.findUnique({
          where: {
            mediaId: input,
          },
        });
        if (media && media.deletedAt === null) {
          return media;
        } else {
          throw throwTRPCError({
            message: "Media not found",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting media",
          cause: err,
        });
      }
    },
  })
  .merge("protected.", UserMediaRouter);
