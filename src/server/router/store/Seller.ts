import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

// create store , update store, delete store

export const sellerRouter = createProtectedRouter()
  .query("getStoreDetails", {
    input: z.string().uuid(),
    resolve: async ({ input, ctx }) => {
      try {
        console.log("getStoreDetails", input);
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
            Addresses: {
              include: {
                AddressType: true,
                City: {
                  include: {
                    State: {
                      include: {
                        Country: true,
                      },
                    },
                  },
                },
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
        } else if (store.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Unauthorized",
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
        brand: z.string().uuid().nullish(),
        category: z.string().uuid().nullish(),
        // variants: z.string().uuid().array().nullish(),
        technicalDetails: z
          .object({
            key: z.string(),
            value: z.string(),
          })
          .array(),
        details: z
          .object({
            heading: z.string(),
            description: z.string(),
            descriptionImages: z.string(),
          })
          .array(),
      }),
    }),
    async resolve({ input, ctx }) {
      try {
        console.log("addProduct", input);
        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input.storeID,
          },
          select: {
            userId: true,
            Products: true,
          },
        });
        if (store) {
          if (store.userId === ctx.session.user.id) {
            // transaction
            // Dont create new technical details if they already exist
            const product = await ctx.prisma.product.create({
              data: {
                name: input.product.name,
                price: input.product.price,
                stock: input.product.stock,
                description: input.product.description,
                Media: {
                  create: input.product.images?.map((image) => ({
                    mediaId: image,
                  })),
                },
                Category: input.product.category
                  ? {
                      connect: {
                        categoryId: input.product.category,
                      },
                    }
                  : undefined,
                giftOptionAvailable: input.product.giftOptionAvailable,
                Details: {
                  create: input.product.details.map((detail) => ({
                    heading: detail.heading,
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
                brandId: input.product.brand ?? undefined,
                storeId: input.storeID,
              },
            });

            const productInventory = await ctx.prisma.productInventory.create({
              data: {
                stock: input.product.stock,
                price: input.product.price,
                productId: product.productId,
                PaymentMethods: {
                  connect: input.product.paymentMethods.map((method) => ({
                    paymentMethodId: method,
                  })),
                },
                sold: 0,
                comingSoon: 0,
              },
            });

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

            await ctx.prisma.store.update({
              where: {
                storeId: input.storeID,
              },
              data: {
                Products: store.Products.concat(product.productId),
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
        technicalDetails: z
          .object({
            key: z.string(),
            value: z.string(),
          })
          .array(),
        details: z
          .object({
            heading: z.string(),
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
                      heading: detail.heading,
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
      address: z.object({
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        country: z.string(),
        zipcode: z.string(),
      }),
      contactEmail: z.string().email(),
      tags: z
        .object({
          key: z.string(),
          value: z.string(),
        })
        .array(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        // correct this, add proper logic for address validation
        const cityId = await ctx.prisma.city.findFirst({
          where: {
            name: input.address.city,
          },
          select: {
            cityId: true,
          },
        });

        if (!cityId) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No city found",
          });
        }
        const store = await ctx.prisma.store.create({
          data: {
            name: input.name,
            description: input.description,
            Media: {
              create: input.media.map((media) => ({
                mediaId: media,
              })),
            },
            Addresses: {
              create: [
                {
                  line1: input.address.addressLine1,
                  line2: input.address.addressLine2 ?? "",
                  LatitudeLongitude: {
                    create: {
                      lat: 0,
                      long: 0,
                    },
                  },
                  AddressType: {
                    connect: {
                      name: "storeReg",
                    },
                  },
                  City: {
                    connect: {
                      cityId: cityId.cityId,
                    },
                  },
                  // add logic to verify the zipcode correctness
                  zipcode: input.address.zipcode,
                },
              ],
            },

            Contacts: {
              create: [
                {
                  contact: input.contactEmail,
                  ContactType: {
                    connect: {
                      name: "storeRegEmail",
                    },
                  },
                },
              ],
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
        address: z.object({
          addressLine1: z.string(),
          addressLine2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          country: z.string(),
          zipcode: z.string(),
        }),
        contactEmail: z.string().email(),
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
            // correct this, add proper logic for address validation
            const cityId = await ctx.prisma.city.findFirst({
              where: {
                name: input.store.address.city,
              },
              select: {
                cityId: true,
              },
            });

            if (!cityId) {
              throw throwTRPCError({
                code: "BAD_REQUEST",
                message: "No city found",
              });
            }

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
                Addresses: {
                  create: [
                    {
                      line1: input.store.address.addressLine1,
                      line2: input.store.address.addressLine2 ?? "",
                      LatitudeLongitude: {
                        create: {
                          lat: 0,
                          long: 0,
                        },
                      },
                      AddressType: {
                        connect: {
                          name: "storeReg",
                        },
                      },
                      City: {
                        connect: {
                          cityId: cityId.cityId,
                        },
                      },

                      // add logic to verify the zipcode correctness
                      zipcode: input.store.address.zipcode,
                    },
                  ],
                },

                Contacts: {
                  create: [
                    {
                      contact: input.store.contactEmail,
                      ContactType: {
                        connect: {
                          name: "storeRegEmail",
                        },
                      },
                    },
                  ],
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
