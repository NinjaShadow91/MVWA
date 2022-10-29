import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const FeaturedPostsRouter = createRouter().query("get", {
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
      throwPrismaTRPCError({
        message: "Error getting favourite products",
        cause: err,
      });
    }
  },
});
