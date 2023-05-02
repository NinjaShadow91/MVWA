import { createProtectedRouter, createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

const EditorPostRouter = createProtectedRouter().mutation("create", {
  input: z.object({
    title: z.string(),
    description: z.string(),
    mediaIds: z.string().uuid().array(),
    tags: z.string().array(),
    featured: z.boolean(),
    url: z.string().url(),
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

      const res = await ctx.prisma.post.create({
        data: {
          title: input.title,
          description: input.description,
          featured: input.featured,
          url: input.url,
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
        message: "Error creating post",
        cause: err,
      });
    }
  },
});

export const FeaturedPostsRouter = createRouter()
  .query("get", {
    input: z.string().array().nullish(),
    resolve: async ({ ctx, input }) => {
      try {
        let posts: {
          postId: string;
          title: string;
          description: string;
          Media: {
            mediaId: string;
          }[];
        }[] = [];
        if (input) {
          posts = await ctx.prisma.post.findMany({
            where: {
              deletedAt: null,
              featured: true,
              tags: { some: { name: { in: input } } },
            },
            select: {
              postId: true,
              title: true,
              description: true,
              Media: { select: { mediaId: true } },
            },
            take: 10,
          });
        } else {
          posts = await ctx.prisma.post.findMany({
            where: {
              deletedAt: null,
              featured: true,
            },
            select: {
              postId: true,
              title: true,
              description: true,
              Media: { select: { mediaId: true } },
            },
            take: 10,
          });
        }

        if (posts === null || posts.length === 0) {
          throw throwTRPCError({
            message: "Posts not found",
            code: "NOT_FOUND",
          });
        }
        return posts[0];
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting favourite products",
          cause: err,
        });
      }
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
      description: z.string(),
      mediaIds: z.string().uuid().array(),
      tags: z.string().array(),
      featured: z.boolean(),
      url: z.string().url(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.post.create({
          data: {
            title: input.title,
            description: input.description,
            featured: input.featured,
            url: input.url,
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
          message: "Error creating post",
          cause: err,
        });
      }
    },
  })
  .mutation("featuredStatusUpdate", {
    input: z.object({
      postId: z.string().uuid(),
      featured: z.boolean(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.post.update({
          where: {
            postId: input.postId,
          },
          data: {
            featured: input.featured,
          },
        });
        return res;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error updating post",
          cause: err,
        });
      }
    },
  });
// .merge("editor", EditorPostRouter);
