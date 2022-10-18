import { z } from "zod";
import { createProtectedRouter, createRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

const userProfile = createProtectedRouter().mutation("updateProfile", {
  input: z.object({
    name: z.string(),
    bio: z.string().nullish(),
    dob: z.string().nullish(),
    gender: z.string().nullish(),
    profilePicture: z.string().nullish(),
  }),
  resolve: async ({ ctx, input }) => {
    try {
      const user = await ctx.prisma.userProfile.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          userProfileId: true,
          deletedAt: true,
        },
      });
      if (user === null || user.deletedAt) {
        throw throwTRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }
      const updatedUser = await ctx.prisma.userProfile.update({
        where: {
          userProfileId: user.userProfileId,
        },
        data: {
          name: input.name,
          bio: input.bio,
          dob: input.dob,
          ProfilePicture: input.profilePicture
            ? {
                connectOrCreate: {
                  where: {
                    mediaId: input.profilePicture,
                  },
                  create: {
                    mediaId: input.profilePicture,
                  },
                },
              }
            : undefined,
          Gender: {
            connect: {
              name: input.gender ?? undefined,
            },
          },
        },
      });
      return updatedUser;
    } catch (err) {
      throw throwPrismaTRPCError({
        cause: err,
        message: "Something went bad while fetching the product data",
      });
    }
  },
});

export const userProfileRouter = createRouter()
  .query("getUserProfile", {
    input: z.object({
      userId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      const { userId } = input;
      try {
        const userProfile = await ctx.prisma.userProfile.findUnique({
          where: {
            userId: userId,
          },
          select: {
            userProfileId: true,
            name: true,
            bio: true,
            ProfilePicture: true,
            deletedAt: true,
            Gender: true,
          },
        });

        if (userProfile === null || userProfile.deletedAt) {
          throw throwTRPCError({
            message: "User not found",
            code: "BAD_REQUEST",
          });
        }
        return userProfile;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  })
  .merge("self.", userProfile);
