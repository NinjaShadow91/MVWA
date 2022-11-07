import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const UserNotificationRouter = createProtectedRouter()
  .query("getNotificationProfile", {
    input: z.object({}),
    resolve: async ({ ctx, input }) => {
      try {
        const userNotificationProfile =
          await ctx.prisma.userNotificationProfile.findUnique({
            where: {
              userId: ctx.session.user.id,
            },
            include: {
              Preferences: {
                include: {
                  NotificationType: true,
                  PreferenceLevel: true,
                },
              },
            },
          });

        if (!userNotificationProfile || userNotificationProfile.deletedAt) {
          throw throwTRPCError({
            message: "User Notification Profile not found",
            code: "NOT_FOUND",
          });
        }
        return userNotificationProfile;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  })
  .mutation("updateNotificationProfile", {
    input: z.object({}),
    resolve: async ({ ctx, input }) => {
      try {
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  });
