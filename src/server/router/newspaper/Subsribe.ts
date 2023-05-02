import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError } from "../util";

export const NewsletterRouter = createRouter().mutation("subscribe", {
  input: z.string().email(),
  resolve: async ({ ctx, input }) => {
    try {
      const resAl = await ctx.prisma.newsletterSubscribedUser.findUnique({
        where: {
          email: input,
        },
      });

      if (resAl) {
        return {
          message: "Already subscribed",
        };
      }

      const res = await ctx.prisma.newsletterSubscribedUser.create({
        data: {
          email: input,
        },
      });

      return res;
    } catch (err) {
      console.log(err);
      throw throwPrismaTRPCError({
        message: "Error subscribing",
        cause: err,
      });
    }
  },
});
