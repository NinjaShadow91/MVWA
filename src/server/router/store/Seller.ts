import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

// create store , update store, delete store

export const sellerRouter = createProtectedRouter()
  .query("getStoreDetails", {
    input: z.string().uuid(),
    resolve: async ({ input, ctx }) => {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input,
          },
          include: {
            Media: true,
            Contacts: {
              include: {
                ContactType: true,
              },
            },
            Tags: true,
          },
        });
        if (!store || store.deletedAt) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Store not found",
          });
        } else return store;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error getting store details",
        });
      }
    },
  })
  .mutation("addProduct", {
    input: z.object({
      storeID: z.string().uuid(),
      product: z.object({
        name: z.string(),
        price: z.number().nonnegative(),
        stock: z.number().positive(),
        description: z.string(),
        images: z.string().array().nullish(),
        giftOptionAvailable: z.boolean(),
        paymentMethods: z.string().uuid().array(),
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
            key: z.string(),
            value: z.string(),
          })
          .array(),
        details: z
          .object({
            description: z.string(),
            descriptionImages: z.string(),
          })
          .array(),
      }),
    }),
    async resolve({ input, ctx }) {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input.storeID,
          },
          select: {
            userId: true,
          },
        });
        if (store) {
          if (store.userId === ctx.session.user.id) {
            const brand = await ctx.prisma.brand.findUnique({
              where: {
                brandId: input.product.brand,
              },
            });

            if (brand) {
              // tr
              // Dont create new technical details if they already exist
              const product = await ctx.prisma.product.create({
                data: {
                  name: input.product.name,
                  price: input.product.price,
                  description: input.product.description,
                  Media: {
                    create: input.product.images?.map((image) => ({
                      mediaId: image,
                    })),
                  },
                  giftOptionAvailable: input.product.giftOptionAvailable,
                  Details: {
                    create: input.product.details.map((detail) => ({
                      description: detail.description,
                      descriptionImages: detail.descriptionImages,
                    })),
                  },
                  TechnicalDetails: {
                    create: input.product.technicalDetails.map((detail) => ({
                      key: detail.key,
                      value: detail.value,
                    })),
                  },
                  Tags: {
                    connectOrCreate: input.product.tags?.map((tag) => ({
                      where: {
                        name: tag.key,
                      },
                      create: {
                        name: tag.key,
                        value: tag.value,
                      },
                    })),
                  },
                  replaceFrame: input.product.replaceFrame,
                  returnFrame: input.product.returnFrame,
                  brandId: input.product.brand,
                  storeId: input.storeID,
                },
              });

              const productInventory = await ctx.prisma.productInventory.create(
                {
                  data: {
                    stock: input.product.stock,
                    price: input.product.price,
                    productId: product.productId,
                    sold: 0,
                    comingSoon: 0,
                  },
                }
              );

              const overallWrongInfo =
                await ctx.prisma.productWrongInformationReportsCombinedResult.create(
                  {
                    data: {
                      productId: product.productId,
                      count: 0,
                    },
                    select: {
                      productWrongInformationReportsOverallId: true,
                    },
                  }
                );

              const productOverallRating =
                await ctx.prisma.productReviewsCombinedResult.create({
                  data: {
                    productId: product.productId,
                    reviewsCount: 0,
                    rating: 0,
                  },
                  select: {
                    productReviewsCombinedResultId: true,
                  },
                });
              const productF = await ctx.prisma.product.update({
                where: {
                  productId: product.productId,
                },
                data: {
                  productInventoryId: productInventory.productInventoryId,
                  ProductReviewsCombinedResult:
                    productOverallRating.productReviewsCombinedResultId,
                  OverallWrongInformationResult:
                    overallWrongInfo.productWrongInformationReportsOverallId,
                },
              });
              return productF;
            }
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
    resolve: async ({ input, ctx }) => {
      try {
        const product = await ctx.prisma.product.findUnique({
          where: {
            productId: input,
          },
          select: {
            productId: true,
            storeId: true,
          },
        });

        if (product) {
          const store = await ctx.prisma.store.findUnique({
            where: {
              storeId: product.storeId,
            },
            select: {
              userId: true,
            },
          });

          if (store) {
            if (store.userId === ctx.session.user.id) {
              await ctx.prisma.product.update({
                where: {
                  productId: input,
                },
                data: {
                  deletedAt: new Date(),
                },
              });
              const productInventory =
                await ctx.prisma.productInventory.findUnique({
                  where: {
                    productId: input,
                  },
                  select: {
                    productInventoryId: true,
                  },
                });

              if (productInventory) {
                await ctx.prisma.productInventory.update({
                  where: {
                    productInventoryId: productInventory.productInventoryId,
                  },
                  data: {
                    deletedAt: new Date(),
                  },
                });
                return true;
              } else {
                throw throwTRPCError({
                  code: "BAD_REQUEST",
                  message: "No product found",
                });
              }
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
      product: z.object({
        name: z.string(),
        description: z.string(),
        images: z.string().array().nullish(),
        giftOptionAvailable: z.boolean(),
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
            key: z.string(),
            value: z.string(),
          })
          .array(),
        details: z
          .object({
            description: z.string(),
            descriptionImages: z.string(),
          })
          .array(),
      }),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: {
            productId: input.id,
          },
          select: {
            storeId: true,
          },
        });
        if (prod) {
          const store = await ctx.prisma.store.findUnique({
            where: {
              storeId: prod.storeId,
            },
            select: {
              userId: true,
            },
          });
          if (store) {
            if (store.userId === ctx.session.user.id) {
              const product = await ctx.prisma.product.update({
                where: {
                  productId: input.id,
                },
                data: {
                  name: input.product.name,
                  description: input.product.description,
                  Media: {
                    create: input.product.images?.map((image) => ({
                      mediaId: image,
                    })),
                  },
                  giftOptionAvailable: input.product.giftOptionAvailable,
                  Details: {
                    create: input.product.details.map((detail) => ({
                      description: detail.description,
                      descriptionImages: detail.descriptionImages,
                    })),
                  },
                  TechnicalDetails: {
                    create: input.product.technicalDetails.map((detail) => ({
                      key: detail.key,
                      value: detail.value,
                    })),
                  },

                  Tags: {
                    connectOrCreate: input.product.tags?.map((tag) => ({
                      where: {
                        name: tag.key,
                      },
                      create: {
                        name: tag.key,
                        value: tag.value,
                      },
                    })),
                  },
                  replaceFrame: input.product.replaceFrame,
                  returnFrame: input.product.returnFrame,
                },
                select: {
                  productId: true,
                },
              });
              return product;
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
      media: z.string().array(),
      // Add address here
      tags: z
        .object({
          key: z.string(),
          value: z.string(),
        })
        .array(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const store = await ctx.prisma.store.create({
          data: {
            name: input.name,
            description: input.description,
            Media: {
              create: input.media.map((media) => ({
                mediaId: media,
              })),
            },
            Tags: {
              connectOrCreate: input.tags.map((tag) => ({
                where: {
                  name: tag.key,
                },
                create: {
                  name: tag.key,
                  value: tag.value,
                },
              })),
            },
            userId: ctx.session.user.id,
          },
          select: {
            storeId: true,
          },
        });
        return store;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while creating the store",
        });
      }
    },
  })
  .mutation("deleteStore", {
    input: z.string().uuid(),
    resolve: async ({ input, ctx }) => {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input,
          },
          select: {
            userId: true,
          },
        });
        if (store) {
          if (store.userId === ctx.session.user.id) {
            await ctx.prisma.store.update({
              where: {
                storeId: input,
              },
              data: {
                deletedAt: new Date(),
              },
            });
            return true;
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
          message: "Something went wrong while deleting the store",
        });
      }
    },
  })
  .mutation("updateStore", {
    input: z.object({
      id: z.string().uuid(),
      store: z.object({
        name: z.string(),
        description: z.string(),
        media: z.string().array(),
        // Add address here
        tags: z
          .object({
            key: z.string(),
            value: z.string(),
          })
          .array(),
      }),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input.id,
          },
          select: {
            userId: true,
          },
        });
        if (store) {
          if (store.userId === ctx.session.user.id) {
            const updatedStore = await ctx.prisma.store.update({
              where: {
                storeId: input.id,
              },
              data: {
                name: input.store.name,
                description: input.store.description,
                Media: {
                  create: input.store.media.map((media) => ({
                    mediaId: media,
                  })),
                },
                Tags: {
                  connectOrCreate: input.store.tags.map((tag) => ({
                    where: {
                      name: tag.key,
                    },
                    create: {
                      name: tag.key,
                      value: tag.value,
                    },
                  })),
                },
              },
              select: {
                storeId: true,
              },
            });
            return updatedStore;
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
          message: "Something went wrong while updating the store",
        });
      }
    },
  });
