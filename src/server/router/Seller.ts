import { Prisma, Product, TechnicalDetails } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "./context";
import { throwPrismaTRPCError, throwTRPCError } from "./util";

// create store , update store, delete store

export const SellerRouter = createProtectedRouter()
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
              includeDeleted: z.boolean().nullable(),
              includeCurrentlyAvailable: z.boolean().nullable(),
              price: z.boolean().nullish(),
              image: z.boolean().nullish(),
              sold: z.boolean().nullish(),
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
            sold: z.number().nonnegative().nullish(),
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
                }
              : input.id
              ? {
                  id: input.id,
                }
              : {
                  // Check this
                  name: input.name!,
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
                  where: {
                    deletedAt:
                      input.select.products.includeDeleted &&
                      input.select.products.includeCurrentlyAvailable
                        ? undefined
                        : input.select.products.includeCurrentlyAvailable
                        ? null
                        : { not: null },
                  },

                  select: {
                    id: true,
                    name: input.select?.products?.name ?? false,
                    description: input.select?.products?.description ?? false,
                    price: input.select?.products?.price ?? false,
                    images: input.select?.products?.image ?? false,
                    sold: input.select?.products?.sold ?? false,
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
  .mutation("addProducts", {
    input: z.object({
      storeID: z.string().uuid(),
      products: z
        .object({
          name: z.string(),
          price: z.number().nonnegative(),
          stock: z.number().positive(),
          description: z.string(),
          images: z.string().array().nullish(),
          giftOptionAvailable: z.boolean(),
          paymentMethods: z.number().nonnegative(),
          replaceFrame: z.number().nonnegative(),
          returnFrame: z.number().nonnegative(),
          tags: z
            .object({
              key: z.string(),
              value: z.string(),
            })
            .array()
            .nullish(),
          brand: z.string().uuid(),
          category: z.string().uuid().optional(),
          variants: z.string().uuid().array().optional(),
          technicalDetails: z
            .object({
              keyVal: z
                .object({
                  key: z.string(),
                  value: z.string(),
                })
                .array()
                .nullish(),
              desc: z
                .object({
                  description: z.string(),
                  descriptionImages: z.string(),
                })
                .array()
                .nullish(),
            })
            .nullish(),
        })
        .array(),
    }),
    output: z.object({
      productAddedNumber: z.number().nonnegative(),
      productsAdded: z.string().uuid().array().nullable(),
    }),
    async resolve({ input, ctx }) {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            id: input.storeID,
          },
          select: {
            manager: {
              select: {
                id: true,
              },
            },
          },
        });
        if (store) {
          if (store.manager.id === ctx.session.user.id) {
            const { products } = await ctx.prisma.store.update({
              where: {
                id: input.storeID,
              },
              data: {
                products: {
                  create: input.products.map((product) => ({
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    description: product.description,
                    images: product.images ?? [],
                    giftOptionAvailable: product.giftOptionAvailable,
                    paymentMethods: product.paymentMethods,
                    replaceFrame: product.replaceFrame,
                    returnFrame: product.returnFrame,
                    tags: {
                      connectOrCreate:
                        product.tags?.map((tag) => {
                          return {
                            where: {
                              key: tag.key,
                              value: tag.value,
                              entityIdentifier: 1,
                            },
                            create: {
                              key: tag.key,
                              value: tag.value,
                              entityIdentifier: 1,
                            },
                          };
                        }) ?? [],
                    },
                    brand: {
                      connect: { id: product.brand },
                    },
                    category: product.category
                      ? {
                          connect: { id: product.category },
                        }
                      : undefined,
                    isVariantOf: {
                      connect: product.variants?.map(
                        (variant) =>
                          ({
                            id: variant,
                          } ?? [])
                      ),
                    },
                    technicalDetails: product.technicalDetails
                      ? {
                          create: {
                            data: {
                              key:
                                product.technicalDetails.keyVal?.map(
                                  (keyVal) => keyVal.key
                                ) ?? [],

                              value:
                                product.technicalDetails.keyVal?.map(
                                  (keyVal) => keyVal.value
                                ) ?? [],
                              description:
                                product.technicalDetails.desc?.map(
                                  (desc) => desc.description
                                ) ?? [],
                              descriptionImages:
                                product.technicalDetails.desc?.map(
                                  (desc) => desc.descriptionImages
                                ) ?? [],
                            },
                          },
                        }
                      : undefined,
                  })),
                },
              },
              select: {
                products: { select: { id: true } },
              },
            });
            return {
              productAddedNumber: products.length,
              productsAdded:
                products.length > 0
                  ? products.map((product) => product.id)
                  : null,
            };
          } else {
            throw throwTRPCError({
              code: "BAD_REQUEST",
              message: "You are not the manager of this store",
            });
          }
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No store found",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while adding the products",
        });
      }
    },
  })
  .mutation("removeProduct", {
    input: z.string().uuid(),
    output: z.boolean(),
    resolve: async ({ input, ctx }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: {
            id: input,
          },
          select: {
            deletedAt: true,
            store: {
              select: {
                manager: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });
        if (prod) {
          if (
            prod.store.manager.id === ctx.session.user.id &&
            !prod.deletedAt
          ) {
            ctx.prisma.product.update({
              where: {
                id: input,
              },
              data: {
                deletedAt: new Date(),
              },
            });
            return true;
          } else {
            throw throwTRPCError({
              code: "BAD_REQUEST",
              message: "Not authorized to remove this product",
            });
          }
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No product found",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while removing the product",
        });
      }
    },
  })
  .mutation("updateProduct", {
    input: z.object({
      id: z.string().uuid(),
      data: z.object({
        name: z.string().optional(),
        price: z.number().nonnegative().optional(),
        stock: z.number().positive().optional(),
        description: z.string().optional(),
        images: z.string().array().nullish().optional(),
        giftOptionAvailable: z.boolean().optional(),
        paymentMethods: z.number().nonnegative().optional(),
        replaceFrame: z.number().nonnegative().optional(),
        returnFrame: z.number().nonnegative().optional(),
        tags: z
          .object({
            key: z.string(),
            value: z.string(),
          })
          .array()
          .nullish()
          .optional(),
        brand: z.string().uuid().nullish().optional(),
        category: z.string().uuid().nullish().optional(),
        // variants: z.string().uuid().array().optional(),
        technicalDetails: z
          .object({
            keyVal: z
              .object({
                key: z.string(),
                value: z.string(),
              })
              .array()
              .nullish(),
            desc: z
              .object({
                description: z.string(),
                descriptionImages: z.string(),
              })
              .array()
              .nullish(),
          })
          .nullish(),
      }),
    }),
    output: z.object({}),
    resolve: async ({ input, ctx }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: {
            id: input.id,
          },
          select: {
            store: {
              select: {
                manager: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });
        if (prod) {
          let trans: (
            | Prisma.Prisma__ProductClient<Product>
            | Prisma.Prisma__TechnicalDetailsClient<TechnicalDetails>
          )[] = [
            ctx.prisma.product.update({
              where: { id: input.id },
              data: {
                name: input.data.name ?? undefined,
                price: input.data.price ?? undefined,
                stock: input.data.stock ?? undefined,
                description: input.data.description ?? undefined,
                images: input.data.images ?? undefined,
                giftOptionAvailable:
                  input.data.giftOptionAvailable ?? undefined,
                paymentMethods: input.data.paymentMethods ?? undefined,
                replaceFrame: input.data.replaceFrame ?? undefined,
                returnFrame: input.data.returnFrame ?? undefined,
                tags: {
                  connectOrCreate:
                    input.data.tags?.map((tag) => {
                      return {
                        where: {
                          key: tag.key,
                          value: tag.value,
                          entityIdentifier: 1,
                        },
                        create: {
                          key: tag.key,
                          value: tag.value,
                          entityIdentifier: 1,
                        },
                      };
                    }) ?? [],
                },
                brand: input.data.brand
                  ? {
                      connect: { id: input.data.brand },
                    }
                  : undefined,
                category: input.data.category
                  ? {
                      connect: { id: input.data.category },
                    }
                  : undefined,
              },
            }),
          ];
          if (input.data.technicalDetails) {
            trans.push(
              ctx.prisma.technicalDetails.update({
                where: { pid: input.id },
                data: {
                  key: {
                    push: input.data.technicalDetails.keyVal?.map(
                      (keyVal) => keyVal.key
                    ),
                  },
                  value: {
                    push: input.data.technicalDetails.keyVal?.map(
                      (keyVal) => keyVal.value
                    ),
                  },
                  description: {
                    push: input.data.technicalDetails.desc?.map(
                      (desc) => desc.description
                    ),
                  },
                  descriptionImages: {
                    push: input.data.technicalDetails.desc?.map(
                      (desc) => desc.descriptionImages
                    ),
                  },
                },
              })
            );
          }
          if (prod.store.manager.id === ctx.session.user.id) {
            await ctx.prisma.$transaction(trans);
            return true;
          } else {
            throw throwTRPCError({
              code: "BAD_REQUEST",
              message: "Not authorized to update this product",
            });
          }
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No product found",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while updating the product",
        });
      }
    },
  })
  .mutation("createStore", {
    input: z.object({
      name: z.string(),
      description: z.string(),
      images: z.string().array().optional(),
      contactDetails: z.string().optional(),
      tags: z.string().array().optional(),
    }),
    output: z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      manager: z.object({ id: z.string().uuid() }),
      contactDetails: z.string().optional(),
      tags: z.object({ key: z.string() }).array().optional(),
    }),
    resolve: async ({ input, ctx }) => {
      // maybe add some verifiaction like pan card ,etc
      // add payment details to store and user, maybe new table
      try {
        return await ctx.prisma.store.create({
          data: {
            name: input.name,
            description: input.description,
            contactDetails: input.contactDetails ?? [],
            images: input.images ?? [],
            manager: {
              connect: { id: ctx.session.user.id },
            },
            stags: input.tags ?? [],
            tags: input.tags
              ? {
                  connectOrCreate: input.tags.map((tag) => {
                    return {
                      where: { key: tag, entityIdentifier: 2 },
                      create: { key: tag, entityIdentifier: 2 },
                    };
                  }),
                }
              : undefined,
          },
          select: {
            id: true,
            name: true,
            description: true,
            manager: {
              select: { id: true },
            },
            tags: {
              select: { key: true },
            },
          },
        });
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while creatign store.",
        });
      }
    },
  })
  .mutation("deleteStore", {
    input: z.string().uuid(),
    output: z.boolean(),
    resolve: async ({ input, ctx }) => {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: { id: input },
          select: { manager: { select: { id: true } } },
        });

        if (store && store.manager.id === ctx.session.user.id) {
          await ctx.prisma.store.update({
            where: { id: input },
            data: { deletedAt: new Date() },
          });
          return true;
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Not authorized",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while deleting store.",
        });
      }
    },
  })
  .mutation("updateStore", {
    input: z.object({
      id: z.string().uuid(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        images: z.string().array().optional(),
        contactDetails: z.string().optional(),
        tags: z.string().array().optional(),
      }),
    }),
    output: z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      manager: z.object({ id: z.string().uuid() }),
      contactDetails: z.string().optional(),
      tags: z.object({ key: z.string() }).array().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: { id: input.id },
          select: { manager: { select: { id: true } } },
        });
        if (store && store.manager.id === ctx.session.user.id) {
          return await ctx.prisma.store.update({
            where: { id: input.id },
            data: {
              name: input.data.name ?? undefined,
              description: input.data.description ?? undefined,
              images: input.data.images ?? undefined,
              contactDetails: input.data.contactDetails ?? undefined,
              tags: input.data.tags
                ? {
                    connectOrCreate: input.data.tags?.map((tag) => {
                      return {
                        where: {
                          key: tag,
                          entityIdentifier: 2,
                        },
                        create: {
                          key: tag,
                          entityIdentifier: 2,
                        },
                      };
                    }),
                  }
                : undefined,
            },
            select: {
              id: true,
              name: true,
              description: true,
              manager: {
                select: { id: true },
              },
              tags: {
                select: { key: true },
              },
            },
          });
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Not authorized",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while updating store.",
        });
      }
    },
  });
