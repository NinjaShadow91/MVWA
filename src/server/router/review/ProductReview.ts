import {
  Prisma,
  PrismaPromise,
  ProductFeaturesRatingCombinedResult,
} from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter, createRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

const ProtectedProductReviewRouter = createProtectedRouter()
  .query("getProductReviewsForUser", {
    input: z.object({}).nullish(),
    resolve: async ({ ctx, input }) => {
      try {
        const reviews = await ctx.prisma.productReview.findMany({
          where: {
            userId: ctx.session.user.id,
          },
        });
        return reviews.map((review) => {
          return review.deletedAt ? false : true;
        });
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching product reviews",
        });
      }
    },
  })
  .mutation("createProductReview", {
    input: z.object({
      productId: z.string().uuid(),
      overallRating: z.number().min(1).max(5),
      content: z.string().min(1).max(500),
      features: z
        .object({
          featureId: z.string().uuid(),
          rating: z.number().min(1).max(5),
        })
        .array(),
      tags: z.string().array(),
      media: z.string().uuid().array(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: {
            productId: input.productId,
          },
          select: {
            deletedAt: true,
          },
        });
        if (prod === null || prod.deletedAt) {
          throw throwTRPCError({
            message: "Product not found",
            code: "NOT_FOUND",
          });
        }

        const features = await ctx.prisma.productReviewFeature.findMany({
          where: {
            productId: input.productId,
          },
          select: {
            productReviewFeatureId: true,
          },
        });

        if (!features) {
          throw throwTRPCError({
            message: "Product not found",
            code: "NOT_FOUND",
          });
        }

        const arr = input.features.filter((feature) => {
          return features.some((f) => {
            return f.productReviewFeatureId === feature.featureId;
          });
        });

        if (arr.length !== 0) {
          throw throwTRPCError({
            message: "Feature not found",
            code: "NOT_FOUND",
          });
        }

        const order = await ctx.prisma.orders.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            OrderItems: {
              select: {
                productId: true,
              },
            },
          },
        });

        const review = await ctx.prisma.productReview.create({
          data: {
            productId: input.productId,
            userId: ctx.session.user.id,
            overallRating: input.overallRating,
            content: input.content,
            verifiedPurchase: order?.OrderItems.some(
              (item) => item.productId === input.productId
            )
              ? true
              : false ?? false,
            Features: {
              create: input.features.map((feature) => ({
                featureId: feature.featureId,
                rating: feature.rating,
              })),
            },
            Tags: {
              connectOrCreate: input.tags.map((tag) => ({
                where: {
                  tag: tag,
                },
                create: {
                  tag: tag,
                },
              })),
            },
            Media: {
              create: input.media.map((media) => ({
                mediaId: media,
              })),
            },
          },
        });

        const overallReview =
          await ctx.prisma.productReviewsCombinedResult.findUnique({
            where: {
              productId: input.productId,
            },
            select: {
              rating: true,
              reviewsCount: true,
              Features: {
                select: {
                  productFeatureRatingCombinedResultsId: true,
                  featureId: true,
                  rating: true,
                  reviewsCount: true,
                },
              },
            },
          });

        if (!overallReview) {
          throw throwTRPCError({
            // Not correct message
            message: "Review not found",
            code: "NOT_FOUND",
          });
        }
        const newRating =
          (overallReview.rating * overallReview.reviewsCount +
            input.overallRating) /
            overallReview.reviewsCount +
          1;

        const updateArr = overallReview.Features.map((feature) => {
          if (
            input.features.some((f) => {
              f.featureId === feature.featureId;
            })
          ) {
            const x = input.features.find((f) => {
              f.featureId === feature.featureId;
            });
            if (x) {
              return ctx.prisma.productFeaturesRatingCombinedResult.update({
                where: {
                  productFeatureRatingCombinedResultsId:
                    feature.productFeatureRatingCombinedResultsId,
                },
                data: {
                  rating:
                    (feature.rating * feature.reviewsCount + x.rating) /
                      feature.reviewsCount +
                    1,
                  reviewsCount: feature.reviewsCount + 1,
                },
              });
            }
          }
          return null;
        }).filter((x) => {
          return x !== null;
        });

        // check why null in updtateArr
        await ctx.prisma.$transaction(
          updateArr as unknown as PrismaPromise<
            Prisma.Prisma__ProductFeaturesRatingCombinedResultClient<ProductFeaturesRatingCombinedResult>
          >[]
        );

        await ctx.prisma.productReviewsCombinedResult.update({
          where: {
            productId: input.productId,
          },
          data: {
            rating: newRating,
            reviewsCount: overallReview.reviewsCount + 1,
          },
        });
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            productReviews: {
              push: review.productReviewId,
            },
          },
        });

        return review;
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while creating product review",
        });
      }
    },
  })
  .mutation("updateProductReview", {
    input: z.object({
      productReviewId: z.string().uuid(),
      overallRating: z.number().min(1).max(5),
      content: z.string().min(1).max(500),
      features: z
        .object({
          featureId: z.string().uuid(),
          rating: z.number().min(1).max(5),
        })
        .array(),
      tags: z.string().array(),
      media: z.string().uuid().array(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const prod = await ctx.prisma.productReview.findUnique({
          where: {
            productReviewId: input.productReviewId,
          },
          select: {
            productId: true,
            userId: true,
            deletedAt: true,
          },
        });
        if (prod === null || prod.deletedAt) {
          throw throwTRPCError({
            message: "Product review not found",
            code: "NOT_FOUND",
          });
        }

        if (prod.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            message: "You are not authorized to update this review",
            code: "UNAUTHORIZED",
          });
        }

        const features = await ctx.prisma.productReviewFeature.findMany({
          where: {
            productId: prod.productId,
          },
          select: {
            productReviewFeatureId: true,
          },
        });

        if (!features) {
          throw throwTRPCError({
            message: "Product not found",
            code: "NOT_FOUND",
          });
        }

        const arr = input.features.filter((feature) => {
          return features.some((f) => {
            return f.productReviewFeatureId === feature.featureId;
          });
        });

        if (arr.length !== 0) {
          throw throwTRPCError({
            message: "Feature not found",
            code: "NOT_FOUND",
          });
        }

        const review = await ctx.prisma.productReview.update({
          where: {
            productReviewId: input.productReviewId,
          },
          data: {
            overallRating: input.overallRating,
            content: input.content,
            Features: {
              deleteMany: {},
              create: input.features.map((feature) => ({
                featureId: feature.featureId,
                rating: feature.rating,
              })),
            },
            Tags: {
              deleteMany: {},
              connectOrCreate: input.tags.map((tag) => ({
                where: {
                  tag: tag,
                },
                create: {
                  tag: tag,
                },
              })),
            },
            Media: {
              deleteMany: {},
              create: input.media.map((media) => ({
                mediaId: media,
              })),
            },
          },
        });
        const overallReview =
          await ctx.prisma.productReviewsCombinedResult.findUnique({
            where: {
              productId: prod.productId,
            },
            select: {
              rating: true,
              reviewsCount: true,
              Features: {
                select: {
                  productFeatureRatingCombinedResultsId: true,
                  featureId: true,
                  rating: true,
                  reviewsCount: true,
                },
              },
            },
          });

        if (!overallReview) {
          throw throwTRPCError({
            // Not correct message
            message: "Review not found",
            code: "NOT_FOUND",
          });
        }
        const newRating =
          (overallReview.rating * overallReview.reviewsCount +
            input.overallRating) /
            overallReview.reviewsCount +
          1;

        const updateArr = overallReview.Features.map((feature) => {
          if (
            input.features.some((f) => {
              f.featureId === feature.featureId;
            })
          ) {
            const x = input.features.find((f) => {
              f.featureId === feature.featureId;
            });
            if (x) {
              return ctx.prisma.productFeaturesRatingCombinedResult.update({
                where: {
                  productFeatureRatingCombinedResultsId:
                    feature.productFeatureRatingCombinedResultsId,
                },
                data: {
                  rating:
                    (feature.rating * feature.reviewsCount + x.rating) /
                      feature.reviewsCount +
                    1,
                  reviewsCount: feature.reviewsCount + 1,
                },
              });
            }
          }
          return null;
        }).filter((x) => {
          return x !== null;
        });

        // check why null in updtateArr
        await ctx.prisma.$transaction(
          updateArr as unknown as PrismaPromise<
            Prisma.Prisma__ProductFeaturesRatingCombinedResultClient<ProductFeaturesRatingCombinedResult>
          >[]
        );

        await ctx.prisma.productReviewsCombinedResult.update({
          where: {
            productId: prod.productId,
          },
          data: {
            rating: newRating,
            reviewsCount: overallReview.reviewsCount + 1,
          },
        });
        return review;
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while updating product review",
        });
      }
    },
  })
  .mutation("deleteProductReview", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const prod = await ctx.prisma.productReview.findUnique({
          where: {
            productReviewId: input,
          },
          select: {
            userId: true,
            deletedAt: true,
          },
        });
        if (prod === null || prod.deletedAt) {
          throw throwTRPCError({
            message: "Product review not found",
            code: "NOT_FOUND",
          });
        }

        if (prod.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            message: "You are not authorized to delete this review",
            code: "UNAUTHORIZED",
          });
        }

        await ctx.prisma.productReview.delete({
          where: {
            productReviewId: input,
          },
        });
        return true;
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while deleting product review",
        });
      }
    },
  });

export const productReviewRouter = createRouter()
  .query("getProductReviewsForProduct", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const reviews = await ctx.prisma.productReview.findMany({
          where: {
            productId: input,
          },
        });
        return reviews.map((review) => {
          return review.deletedAt ? false : true;
        });
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching product reviews",
        });
      }
    },
  })
  .query("getProductReview", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const review = await ctx.prisma.productReview.findUnique({
          where: {
            productReviewId: input,
          },
        });
        if (!review || review.deletedAt) {
          throw throwTRPCError({
            message: "Review not found",
            code: "NOT_FOUND",
          });
        }
        return review;
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching product review",
        });
      }
    },
  })
  .merge("protected.", ProtectedProductReviewRouter);
