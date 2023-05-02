import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

// create update sku, update not create new detail media ,etc in updates
// update Update product

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
  .query("getAllStoresBySeller", {
    input: z.object({}).nullish(),
    resolve: async ({ input, ctx }) => {
      try {
        const stores = await ctx.prisma.store.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            storeId: true,
            name: true,
            description: true,
            Media: true,
            Contacts: {
              include: {
                ContactType: true,
              },
            },
            Tags: true,
            deletedAt: true,
          },
        });
        return stores.filter((store) => !store.deletedAt);
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error getting all stores",
        });
      }
    },
  })
  .mutation("addProduct", {
    input: z.object({
      storeId: z.string().uuid(),
      existingProduct: z
        .object({
          productSKUId: z.string().uuid(),
          price: z.number().nonnegative(),
          stock: z.number().positive(),
          paymentMethods: z.string().uuid().array(),
        })
        .nullish(),
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
        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input.storeId,
          },
          select: {
            storeId: true,
            userId: true,
            Products: true,
          },
        });
        if (store) {
          if (store.userId === ctx.session.user.id) {
            if (input.existingProduct) {
              const product = await ctx.prisma.productSKU.findUnique({
                where: {
                  productSKUId: input.existingProduct.productSKUId,
                },
              });
              if (product) {
                const productInventory =
                  await ctx.prisma.productInventory.create({
                    data: {
                      storeId: store.storeId,
                      productId: product.productSKUId,
                      stock: input.existingProduct.stock,
                      price: input.existingProduct.price,
                      comingSoon: 0,
                      sold: 0,
                      PaymentMethods: {
                        connect: input.existingProduct.paymentMethods.map(
                          (method) => ({
                            paymentMethodId: method,
                          })
                        ),
                      },
                    },
                  });

                await ctx.prisma.productSKU.update({
                  where: {
                    productSKUId: productInventory.productId,
                  },
                  data: {
                    productInventoryIds: {
                      push: productInventory.productInventoryId,
                    },
                  },
                });
              } else {
                throw throwTRPCError({
                  code: "BAD_REQUEST",
                  message: "Product not found",
                });
              }
            } else if (input.product) {
              const mediaAllowed = await ctx.prisma.media.findMany({
                where: {
                  mediaId: { in: input.product.images ?? [] },
                  ownerId: ctx.session.user.id,
                },
                select: {
                  mediaId: true,
                },
              });

              // transaction
              // Dont create new technical details if they already exist
              console.log(input.product.images);
              const product = await ctx.prisma.product.create({
                data: {
                  name: input.product.name,
                  description: input.product.description,
                  // Media: {
                  //   connect: input.product.images?.map((image) => ({
                  //     productMediaId: image,
                  //   })),
                  // },
                  Media: {
                    create: mediaAllowed.map((image) => ({
                      mediaId: image.mediaId,
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
                  originalStoreId: input.storeId,
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

              const prodSKU = await ctx.prisma.productSKU.create({
                data: {
                  productInventoryIds: [],
                  skuName: product.name,
                  price: input.product.price,
                  originalStoreId: input.storeId,
                  stock: input.product.stock,
                  Product: {
                    connect: {
                      productId: product.productId,
                    },
                  },
                },
              });

              const productInventory = await ctx.prisma.productInventory.create(
                {
                  data: {
                    stock: input.product.stock,
                    storeId: input.storeId,
                    price: input.product.price,
                    productId: prodSKU.productSKUId,
                    PaymentMethods: {
                      connect: input.product.paymentMethods.map((method) => ({
                        paymentMethodId: method,
                      })),
                    },
                    sold: 0,
                    comingSoon: 0,
                  },
                }
              );

              await ctx.prisma.productSKU.update({
                where: {
                  productSKUId: prodSKU.productSKUId,
                },
                data: {
                  productInventoryIds: [productInventory.productInventoryId],
                },
              });

              await ctx.prisma.store.update({
                where: {
                  storeId: input.storeId,
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
                message: "Provide atleast one data",
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
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while adding the products",
        });
      }
    },
  })
  .mutation("removeProduct", {
    input: z.object({
      productSKUId: z.string(),
      storeId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const product = await ctx.prisma.productSKU.findUnique({
          where: {
            productSKUId: input.productSKUId,
          },
          select: {
            productSKUId: true,
            productInventoryIds: true,
          },
        });

        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input.storeId,
          },
          select: {
            storeId: true,
            userId: true,
            Products: true,
          },
        });

        if (!store) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No store found",
          });
        }

        if (store.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "You are not the manager of this store",
          });
        }

        if (!product) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No product found",
          });
        }

        // if (!store.Products.find((p) => p === product.productSKUId)) {
        //   throw throwTRPCError({
        //     code: "BAD_REQUEST",
        //     message: "This product is not in your store",
        //   });
        // }

        const productInventory = await ctx.prisma.productInventory.findFirst({
          where: {
            productId: product.productSKUId,
            storeId: input.storeId,
          },
        });

        if (!productInventory) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "This product is not in your store",
          });
        }

        await ctx.prisma.productInventory.update({
          where: {
            productInventoryId: productInventory.productInventoryId,
          },
          data: {
            deletedAt: new Date(),
          },
        });

        const productUpSKU = await ctx.prisma.productSKU.update({
          where: {
            productSKUId: product.productSKUId,
          },
          data: {
            productInventoryIds: product.productInventoryIds.filter(
              (id) => id !== productInventory.productInventoryId
            ),
          },
        });

        if (productUpSKU.productInventoryIds.length === 0) {
          await ctx.prisma.productSKU.update({
            where: {
              productSKUId: productUpSKU.productSKUId,
            },
            data: {
              deletedAt: new Date(),
            },
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
            originalStoreId: true,
          },
        });
        if (prod) {
          const store = await ctx.prisma.store.findUnique({
            where: {
              storeId: prod.originalStoreId,
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

        let LatitudeLongitude = await ctx.prisma.latitudeLongitude.findFirst({
          where: {
            lat: 0,
            long: 0,
          },
          select: {
            latitudeLongitudeId: true,
          },
        });

        if (!LatitudeLongitude) {
          LatitudeLongitude = await ctx.prisma.latitudeLongitude.create({
            data: {
              lat: 0,
              long: 0,
            },
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
                    connect: {
                      latitudeLongitudeId:
                        LatitudeLongitude.latitudeLongitudeId,
                    },
                  },
                  AddressType: {
                    connect: {
                      name: "REGULAR",
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
                      name: "REGULAR",
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
                          name: "REGULAR",
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
                          name: "REGULAR",
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
