/* eslint-disable @typescript-eslint/no-unused-vars */
import { createProtectedRouter, createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

const EditorBannerRouter = createProtectedRouter().mutation("create", {
  input: z.object({
    title: z.string(),
    query: z.string(),
    productIds: z.string().uuid().array(),
    description: z.string(),
    mediaIds: z.string().uuid().array(),
    tags: z.string().array(),
  }),
  resolve: async ({ ctx, input }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          UserType: true,
        },
      });
      if (!user || !user.UserType || user.UserType.name !== "editor") {
        throw throwTRPCError({
          message: "User is not an editor",
          code: "UNAUTHORIZED",
        });
      }
      const res = await ctx.prisma.banner.create({
        data: {
          title: input.title,
          query: input.query,
          description: input.description,
          productIds: input.productIds,
          Media: {
            create: input.mediaIds.map((mediaId) => ({
              mediaId,
            })),
          },
          tags: {
            connectOrCreate: input.tags.map((tag) => ({
              where: {
                name: tag,
              },
              create: {
                name: tag,
              },
            })),
          },
        },
      });
      return res;
    } catch (err) {
      throw throwPrismaTRPCError({
        message: "Error creating banner",
        cause: err,
      });
    }
  },
});

export const BannerRouter = createRouter()
  .query("get", {
    input: z.number().positive(),
    resolve: async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.banner.findMany({
          where: {
            deletedAt: null,
          },
          select: {
            bannerId: true,
            title: true,
            query: true,
            // productIds: true,
            description: true,
            Media: { select: { mediaId: true } },
          },
          take: input,
        });
        if (res === null || res.length === 0) {
          throw throwTRPCError({
            message: "Banner not found",
            code: "NOT_FOUND",
          });
        }
        return res;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting banner",
          cause: err,
        });
      }
    },
  })
  .merge("editor", EditorBannerRouter);

// .mutation("create", {
//   input: z.object({
//     title: z.string(),
//     query: z.string(),
//     productIds: z.string().uuid().array(),
//     description: z.string(),
//     mediaIds: z.string().uuid().array(),
//     tags: z.string().array(),
//   }),
//   resolve: async ({ ctx, input }) => {
//     try {
//       const res = await ctx.prisma.banner.create({
//         data: {
//           title: input.title,
//           query: input.query,
//           description: input.description,
//           productIds: input.productIds,
//           Media: {
//             create: input.mediaIds.map((mediaId) => ({
//               mediaId,
//             })),
//           },
//           tags: {
//             connectOrCreate: input.tags.map((tag) => ({
//               where: {
//                 name: tag,
//               },
//               create: {
//                 name: tag,
//               },
//             })),
//           },
//         },
//       });
//       return res;
//     } catch (err) {
//       throw throwPrismaTRPCError({
//         message: "Error creating banner",
//         cause: err,
//       });
//     }
//   },
// });
