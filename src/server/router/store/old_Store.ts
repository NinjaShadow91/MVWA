import { z } from "zod";
import { createRouter } from "./context";
import { throwPrismaTRPCError, throwTRPCError } from "./util";

export const StoreRouter = createRouter()
  .query("getStoreDetails", {
    input: z.object({
      id: z.string().nullish(),
      name: z.string().nullish(),
      select: z
        .object({
          name: z.boolean().nullish(),
          description: z.boolean().nullish(),
          images: z.boolean().nullish(),
          contactDetails: z.boolean().nullish(),
          tags: z.boolean().nullish(),
          stags: z.number().nonnegative().nullish(),
          manager: z.boolean().nullish(),
          products: z
            .object({
              name: z.boolean().nullish(),
              description: z.boolean().nullish(),
              price: z.boolean().nullish(),
              image: z.boolean().nullish(),
            })
            .nullish(),
          reviews: z
            .object({
              number: z.number().nonnegative().nullish(),
              overallRating: z.boolean().nullish(),
              content: z.boolean().nullish(),
              user: z.boolean().nullish(),
              featureRatings: z.boolean().nullish(),
            })
            .nullish(),
        })
        .nullish(),
    }),
    output: z
      .object({
        id: z.string().uuid(),
        name: z.string().nullish(),
        description: z.string().nullish(),
        images: z.string().array().nullish(),
        contactDetails: z.string().array().nullish(),
        tags: z
          .object({
            key: z.string(),
            value: z.string().nullable(),
          })
          .array()
          .nullish(),
        stags: z.string().array().nullish(),
        manager: z
          .object({
            id: z.string().uuid(),
            name: z.string(),
          })
          .nullish(),
        products: z
          .object({
            id: z.string().uuid(),
            name: z.string().nullish(),
            description: z.string().nullish(),
            price: z.number().nonnegative().nullish(),
            images: z.string().array().nullish(),
          })
          .array()
          .nullish(),
        reviews: z
          .object({
            id: z.string().uuid(),
            overallRating: z.number(),
            content: z.string(),
            user: z
              .object({
                id: z.string().uuid(),
                name: z.string(),
              })
              .nullish(),
            featureRatings: z
              .object({
                rating: z.number(),
                feature: z.string(),
              })
              .array()
              .nullish(),
          })
          .array()
          .nullish(),
      })
      .array(),
    resolve: async ({ input, ctx }) => {
      try {
        if (!input.id && !input.name) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Please provide either id or name",
          });
        }

        const stores = await ctx.prisma.store.findMany({
          where:
            input.id && input.name
              ? {
                  id: input.id,
                  name: input.name,
                  deletedAt: null,
                }
              : input.id
              ? {
                  id: input.id,
                  deletedAt: null,
                }
              : {
                  // Check this
                  name: input.name!,
                  deletedAt: null,
                },
          select: {
            id: true,
            name: input.select?.name ?? false,
            description: input.select?.description ?? false,
            images: input.select?.images ?? false,
            contactDetails: input.select?.contactDetails ?? false,
            stags: input.select?.tags ?? false,
            tags: input.select?.stags
              ? {
                  select: { key: true, value: true },
                  take: input.select.stags,
                }
              : false,
            manager: input.select?.manager
              ? {
                  select: {
                    id: true,
                    name: true,
                  },
                }
              : false,
            products: input.select?.products
              ? {
                  where: { deletedAt: null },
                  select: {
                    id: true,
                    name: input.select?.products?.name ?? false,
                    description: input.select?.products?.description ?? false,
                    price: input.select?.products?.price ?? false,
                    images: input.select?.products?.image ?? false,
                  },
                }
              : false,
            reviews: input.select?.reviews
              ? {
                  select: {
                    id: true,
                    overallRating:
                      input.select?.reviews?.overallRating ?? false,
                    content: input.select?.reviews?.content ?? false,
                    user: input.select?.reviews?.user
                      ? {
                          select: {
                            id: true,
                            name: true,
                          },
                        }
                      : false,
                    featuresRating: input.select?.reviews?.featureRatings
                      ? { select: { key: true, value: true } }
                      : false,
                  },
                  take: input.select?.reviews?.number ?? 10,
                }
              : false,
          },
        });
        if (!(stores.length > 0)) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Store not found",
          });
        } else return stores;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error getting store details",
        });
      }
    },
  })
  .query("getProductIDs", {
    input: z.string().uuid(),
    output: z.string().uuid().array().nullable(),
    async resolve({ input, ctx }) {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            id: input,
          },
          select: {
            manager: {
              select: {
                id: true,
              },
            },
            deletedAt: true,
            products: { where: { deletedAt: null }, select: { id: true } },
          },
        });
        if (store && !store.deletedAt) {
          return store.products.map((product) => product.id);
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No store found",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the store data",
        });
      }
    },
  })
  .query("getReviewIDs", {
    input: z.string().uuid(),
    output: z.string().uuid().array().nullable(),
    async resolve({ input, ctx }) {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            id: input,
          },
          select: {
            manager: {
              select: {
                id: true,
              },
            },
            deletedAt: true,
            reviews: { select: { id: true } },
          },
        });
        if (store && !store.deletedAt) {
          return store.reviews.map((review) => review.id);
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No store found",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the store data",
        });
      }
    },
  });
