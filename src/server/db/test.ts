import { pbkdf2, randomBytes } from "node:crypto";
import { throwPrismaTRPCError, throwTRPCError } from "../router/util";
import { prisma } from "./client";

export async function insertData() {
  try {
    await prisma.city.create({
      data: {
        name: "Delhi",
        State: {
          create: {
            identifier: "Delhi",
            Country: {
              connectOrCreate: {
                where: {
                  code: "IN",
                },
                create: {
                  code: "IN",
                },
              },
            },
          },
        },
      },
    });

    await prisma.city.create({
      data: {
        name: "Mumbai",
        State: {
          create: {
            identifier: "Maharashtra",
            Country: {
              connectOrCreate: {
                where: {
                  code: "IN",
                },
                create: {
                  code: "IN",
                },
              },
            },
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.orderStatus.createMany({
      data: [{ name: "PAID" }, { name: "SHIPPED" }, { name: "DELIVERED" }],
    });
  } catch (e) {
    console.log(e);
  }
  try {
    await prisma.storeAddressType.createMany({
      data: [{ name: "REGULAR" }, { name: "RETURN" }],
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.userAddressType.create({
      data: {
        name: "HOME",
      },
    });
    await prisma.userAddressType.create({
      data: {
        name: "NORMAL",
      },
    });
    await prisma.userAddressType.create({
      data: {
        name: "REGULAR",
      },
    });
    await prisma.userAddressType.create({
      data: {
        name: "OFFICE",
      },
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.storeContactType.create({
      data: {
        name: "REGULAR",
      },
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.userContactType.create({
      data: {
        name: "MOBILE",
      },
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.orderAddressType.create({
      data: {
        name: "NORMAL",
      },
    });

    await prisma.orderAddressType.create({
      data: {
        name: "RETURN",
      },
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.userType.createMany({
      data: [{ name: "DEFAULT" }, { name: "SELLER" }, { name: "EDITOR" }],
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.userNotificationPreferenceType.createMany({
      data: [{ name: "EMAIL" }, { name: "SMS" }, { name: "CALL" }],
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.userNotificationEvents.createMany({
      data: [
        { name: "PRICE_DECREASED_OF_ITEM_IN_WISHLIST" },
        { name: "PRICE_INCREASED_OF_ITEM_IN_WISHLIST" },
        { name: "LOW_STOCK_OF_ITEM_IN_CART" },
        { name: "ITEM_BOUGHT" },
      ],
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.userNotificationPreferenceLevel.create({
      data: {
        level: 1,
        Events: {
          connect: [
            {
              name: "ITEM_BOUGHT",
            },
          ],
        },
      },
    });

    await prisma.userNotificationPreferenceLevel.create({
      data: {
        level: 2,
        Events: {
          connect: [
            {
              name: "ITEM_BOUGHT",
            },
            {
              name: "LOW_STOCK_OF_ITEM_IN_CART",
            },
          ],
        },
      },
    });

    await prisma.userNotificationPreferenceLevel.create({
      data: {
        level: 3,
        Events: {
          connect: [
            {
              name: "ITEM_BOUGHT",
            },
            {
              name: "LOW_STOCK_OF_ITEM_IN_CART",
            },
            {
              name: "PRICE_DECREASED_OF_ITEM_IN_WISHLIST",
            },
          ],
        },
      },
    });
  } catch (e) {
    console.log(e);
  }

  await (async () => {
    try {
      const ITERATIONS = 10;
      const input = {
        email: "customer@check.com",
        name: "customer1",
        password: "qwertyqwerty",
      };
      // mobilePhoneNumber: z.string(),
      const _dob = new Date();
      try {
        const alreadyPresent =
          (await prisma.user.findUnique({
            where: {
              email: input.email,
            },
          })) !== null
            ? true
            : false;
        if (alreadyPresent === false) {
          const { id, name, email } = (await new Promise(
            (
              resolve: (derivedKey: string) => void,
              reject: (err: Error | null) => void
            ) => {
              randomBytes(128, async (saltErr, salt) => {
                if (saltErr) reject(saltErr);
                else resolve(salt.toString("hex"));
              });
            }
          )
            .then(async (_salt) => {
              return new Promise(
                (
                  resolve: ([derivedKey, salt]: [string, string]) => void,
                  reject: (err: Error | null) => void
                ) => {
                  pbkdf2(
                    input.password,
                    _salt,
                    ITERATIONS,
                    64,
                    "sha512",
                    (err, derivedKey) => {
                      if (err) {
                        return reject(err);
                      }
                      return resolve([derivedKey.toString("hex"), _salt]);
                    }
                  );
                }
              );
            })
            .then(async ([derivedKey, salt]) => {
              // make transaction, set user type, etc
              try {
                const user = await prisma.user.create({
                  data: {
                    name: input.name,
                    email: input.email,
                    emailVerified: null,
                    image: null,
                    profile: null,
                    storeComplaints: [],
                    stores: [],
                    productWrongInformationReports: [],
                    complaints: [],
                    productQuestions: [],
                    productAnswers: [],
                    productReviews: [],
                    userAction: [],
                    storeReviews: [],
                    addresses: [],
                    contacts: [],
                    wishlists: [],
                    othersWishlist: [],
                    UserType: {
                      connect: {
                        name: "DEFAULT",
                      },
                    },
                  },
                });
                const auth = await prisma.userAuthentication.create({
                  data: {
                    email: input.email,
                    name: input.name,
                    emailVerified: null,
                    imageId: null,
                    PasswordHistory: {
                      create: {},
                    },
                    userId: user.id,
                    CurrentPassword: {
                      create: {
                        salt: salt,
                        numIterations: ITERATIONS,
                        password: derivedKey,
                        hashingAlgorithm: "sha512",
                      },
                    },
                  },
                });
                const profile = await prisma.userProfile.create({
                  data: {
                    dob: _dob,
                    name: input.name,
                    userId: user.id,
                  },
                });

                const userAddress = await prisma.userAddress.create({
                  data: {},
                });

                const userNotificationProfile =
                  await prisma.userNotificationProfile.create({
                    data: {
                      userId: user.id,
                      Preferences: {
                        create: [
                          {
                            NotificationType: {
                              connect: {
                                name: "EMAIL",
                              },
                            },
                            PreferenceLevel: {
                              connect: {
                                level: 3,
                              },
                            },
                          },
                          {
                            NotificationType: {
                              connect: {
                                name: "SMS",
                              },
                            },
                            PreferenceLevel: {
                              connect: {
                                level: 3, // defaault level
                              },
                            },
                          },
                        ],
                      },
                    },
                  });

                const cart = await prisma.cart.create({
                  data: {
                    userId: user.id,
                  },
                });
                const savedForLaterProducts =
                  await prisma.savedForLaterProducts.create({
                    data: {
                      userId: user.id,
                    },
                  });
                const orders = await prisma.orders.create({
                  data: {
                    userId: user.id,
                  },
                });

                // cannot contact user reciever in this case
                const orderRecievers = await prisma.userOrderRecievers.create({
                  data: {
                    userId: user.id,
                    UserOrderRecievers: {
                      create: [
                        {
                          name: input.name,
                          // Contacts: {
                          //   create: [
                          //     {
                          //       ContactType: {
                          //         connect: {
                          //           name: "MobilePhone",
                          //         },
                          //       },
                          //       contact: input.mobilePhoneNumber,
                          //     },
                          //   ],
                          // },
                        },
                      ],
                    },
                  },
                });

                await prisma.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    userAuthentication: auth.userAuthenticationId,
                    profile: profile.userProfileId,
                    cart: cart.cartId,
                    savedForLaterProducts:
                      savedForLaterProducts.savedForLaterProductsId,
                    orders: orders.ordersId,
                    userNotificationProfile:
                      userNotificationProfile.userNotificationProfileId,
                    userOrderRecieversId: orderRecievers.userOrderRecieversId,
                  },
                });
                return { id: user.id, name: user.name, email: user.email };
              } catch (err) {
                throw throwPrismaTRPCError({
                  cause: err,
                  message: "Some error occured while creating your account.",
                });
              }
            })
            .catch((err) => {
              throw throwTRPCError({
                cause: err,
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong while hashing your password",
              });
            })) ?? { id: "", name: "", email: "" };
          if (id !== "") return { isSuccess: true, user: { id, name, email } };
          else return { isSuccess: false, user: null };
        } else {
          throw throwTRPCError({
            code: "CONFLICT",
            message:
              "User already present with following email. Please sign in.",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Some error occured while creating your account.",
        });
      }
    } catch (e) {
      console.log(e);
    }
  })();

  await (async () => {
    try {
      const ITERATIONS = 10;
      const inputS = {
        email: "seller@check.com",
        name: "seller1",
        password: "qwertyqwerty",
      };
      // mobilePhoneNumber: z.string(),
      const _dob = new Date();
      const { id } = (await new Promise(
        (
          resolve: (derivedKey: string) => void,
          reject: (err: Error | null) => void
        ) => {
          randomBytes(128, async (saltErr, salt) => {
            if (saltErr) reject(saltErr);
            else resolve(salt.toString("hex"));
          });
        }
      )
        .then(async (_salt) => {
          return new Promise(
            (
              resolve: ([derivedKey, salt]: [string, string]) => void,
              reject: (err: Error | null) => void
            ) => {
              pbkdf2(
                inputS.password,
                _salt,
                ITERATIONS,
                64,
                "sha512",
                (err, derivedKey) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve([derivedKey.toString("hex"), _salt]);
                }
              );
            }
          );
        })
        .then(async ([derivedKey, salt]) => {
          // make transaction, set user type, etc
          try {
            const user = await prisma.user.create({
              data: {
                name: inputS.name,
                email: inputS.email,
                emailVerified: null,
                image: null,
                profile: null,
                storeComplaints: [],
                stores: [],
                productWrongInformationReports: [],
                complaints: [],
                productQuestions: [],
                productAnswers: [],
                productReviews: [],
                userAction: [],
                storeReviews: [],
                addresses: [],
                contacts: [],
                wishlists: [],
                othersWishlist: [],
                UserType: {
                  connect: {
                    name: "DEFAULT",
                  },
                },
              },
            });
            const auth = await prisma.userAuthentication.create({
              data: {
                email: inputS.email,
                name: inputS.name,
                emailVerified: null,
                imageId: null,
                PasswordHistory: {
                  create: {},
                },
                userId: user.id,
                CurrentPassword: {
                  create: {
                    salt: salt,
                    numIterations: ITERATIONS,
                    password: derivedKey,
                    hashingAlgorithm: "sha512",
                  },
                },
              },
            });
            const profile = await prisma.userProfile.create({
              data: {
                dob: _dob,
                name: inputS.name,
                userId: user.id,
              },
            });

            const userNotificationProfile =
              await prisma.userNotificationProfile.create({
                data: {
                  userId: user.id,
                  Preferences: {
                    create: [
                      {
                        NotificationType: {
                          connect: {
                            name: "EMAIL",
                          },
                        },
                        PreferenceLevel: {
                          connect: {
                            level: 3,
                          },
                        },
                      },
                      {
                        NotificationType: {
                          connect: {
                            name: "SMS",
                          },
                        },
                        PreferenceLevel: {
                          connect: {
                            level: 3, // defaault level
                          },
                        },
                      },
                    ],
                  },
                },
              });

            const cart = await prisma.cart.create({
              data: {
                userId: user.id,
              },
            });
            const savedForLaterProducts =
              await prisma.savedForLaterProducts.create({
                data: {
                  userId: user.id,
                },
              });
            const orders = await prisma.orders.create({
              data: {
                userId: user.id,
              },
            });

            // cannot contact user reciever in this case
            const orderRecievers = await prisma.userOrderRecievers.create({
              data: {
                userId: user.id,
                UserOrderRecievers: {
                  create: [
                    {
                      name: inputS.name,
                      // Contacts: {
                      //   create: [
                      //     {
                      //       ContactType: {
                      //         connect: {
                      //           name: "MobilePhone",
                      //         },
                      //       },
                      //       contact: input.mobilePhoneNumber,
                      //     },
                      //   ],
                      // },
                    },
                  ],
                },
              },
            });

            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                userAuthentication: auth.userAuthenticationId,
                profile: profile.userProfileId,
                cart: cart.cartId,
                savedForLaterProducts:
                  savedForLaterProducts.savedForLaterProductsId,
                orders: orders.ordersId,
                userNotificationProfile:
                  userNotificationProfile.userNotificationProfileId,
                userOrderRecieversId: orderRecievers.userOrderRecieversId,
              },
            });
            return { id: user.id, name: user.name, email: user.email };
          } catch (err) {
            throw throwPrismaTRPCError({
              cause: err,
              message: "Some error occured while creating your account.",
            });
          }
        })
        .catch((err) => {
          throw throwTRPCError({
            cause: err,
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong while hashing your password",
          });
        })) ?? { id: "", name: "", email: "" };
      // if (id !== "") return { isSuccess: true, user: { id, name, email } };
      // else return { isSuccess: false, user: null };

      try {
        const input = {
          name: "store1",
          description: "this is store 1",
          media: [],
          address: {
            addressLine1: "address line 1",
            addressLine2: "address line 2",
            city: "Delhi",
            state: "Delhi",
            country: "IN",
            zipcode: "12345",
          },
          contactEmail: "seller@check.com",
          tags: [],
        };
        try {
          // correct this, add proper logic for address validation
          const cityId = await prisma.city.findFirst({
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
          const store = await prisma.store.create({
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

              // Tags: {
              //   connectOrCreate: input.tags.map((tag) => ({
              //     where: {
              //       name: tag.key,
              //     },
              //     create: {
              //       name: tag.key,
              //       value: tag.value,
              //     },
              //   })),
              // },
              userId: id,
            },
            select: {
              storeId: true,
            },
          });

          const inputP = {
            storeId: store.storeId,
            product: {
              name: "product1",
              price: 1000,
              stock: 100,
              description: "This is product description",
              images: [],
              giftOptionAvailable: true,
              paymentMethods: [],
              replaceFrame: 7,
              returnFrame: 0,
              tags: undefined,
              brand: undefined,
              category: undefined,
              // variants: z.string().uuid().array().nullish(),
              technicalDetails: [
                {
                  key: "Rated Power",
                  value: "220",
                },
                {
                  key: "Warranty time period",
                  value: "2 Years",
                },
              ],

              details: [
                {
                  heading: "Big Screen",
                  description: "48 inch screen",
                  descriptionImages: [],
                },
                {
                  heading: "Powerful Processor",
                  description: "24 cores processor",
                  descriptionImages: [],
                },
                {
                  heading: "Powerful Sound",
                  description: "Bass Boosted Sound",
                  descriptionImages: [],
                },
              ],
            },
          };
          // transaction
          // Dont create new technical details if they already exist
          const product = await prisma.product.create({
            data: {
              name: inputP.product.name,
              description: inputP.product.description,
              Media: {
                create: inputP.product.images?.map((image) => ({
                  mediaId: image,
                })),
              },
              Category: inputP.product.category
                ? {
                    connect: {
                      categoryId: inputP.product.category,
                    },
                  }
                : undefined,
              giftOptionAvailable: inputP.product.giftOptionAvailable,
              Details: {
                create: inputP.product.details.map((detail) => ({
                  heading: detail.heading,
                  description: detail.description,
                  Media: { create: detail.descriptionImages },
                })),
              },
              TechnicalDetails: {
                create: inputP.product.technicalDetails.map((detail) => ({
                  key: detail.key,
                  value: detail.value,
                })),
              },
              // Tags: {
              //   connectOrCreate: inputP.product.tags?.map((tag) => ({
              //     where: {
              //       name: tag.key,
              //     },
              //     create: {
              //       name: tag.key,
              //       value: tag.value,
              //     },
              //   })),
              // },
              replaceFrame: inputP.product.replaceFrame,
              returnFrame: inputP.product.returnFrame,
              brandId: inputP.product.brand ?? undefined,
              originalStoreId: inputP.storeId,
            },
          });

          const overallWrongInfo =
            await prisma.productWrongInformationReportsCombinedResult.create({
              data: {
                productId: product.productId,
                count: 0,
              },
              select: {
                productWrongInformationReportsOverallId: true,
              },
            });

          const productOverallRating =
            await prisma.productReviewsCombinedResult.create({
              data: {
                productId: product.productId,
                reviewsCount: 0,
                rating: 0,
              },
              select: {
                productReviewsCombinedResultId: true,
              },
            });

          const prodSKU = await prisma.productSKU.create({
            data: {
              productInventoryIds: [],
              skuName: product.name,
              price: inputP.product.price,
              originalStoreId: inputP.storeId,
              stock: inputP.product.stock,
              Product: {
                connect: {
                  productId: product.productId,
                },
              },
            },
          });

          const productInventory = await prisma.productInventory.create({
            data: {
              stock: inputP.product.stock,
              storeId: inputP.storeId,
              price: inputP.product.price,
              productId: prodSKU.productId,
              PaymentMethods: {
                connect: inputP.product.paymentMethods.map((method) => ({
                  paymentMethodId: method,
                })),
              },
              sold: 0,
              comingSoon: 0,
            },
          });

          await prisma.productSKU.update({
            where: {
              productSKUId: prodSKU.productSKUId,
            },
            data: {
              productInventoryIds: [productInventory.productInventoryId],
            },
          });

          await prisma.store.update({
            where: {
              storeId: store.storeId,
            },
            data: {
              Products: [product.productId],
            },
          });

          const productF = await prisma.product.update({
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
        } catch (err) {
          throw throwPrismaTRPCError({
            cause: err,
            message: "Some error occured while creating your account.",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Some error occured while creating your store.",
        });
      }
    } catch (e) {
      console.log(e);
    }
  })();
}
