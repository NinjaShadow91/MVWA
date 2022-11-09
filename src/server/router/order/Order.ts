import { createProtectedRouter } from "../context";
import { z } from "zod";
import { throwTRPCError } from "../util";

export const orderRouter = createProtectedRouter()
  .mutation("placeOrder", {
    input: z.object({
      productId: z.string().uuid(),
      quantity: z.number().min(1),
      deliveryAddress: z.string().uuid().nullish(),
      newDeliveryAddress: z
        .object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          country: z.string(),
          zipcode: z.string(),
          addressType: z.string(),
        })
        .nullish(),
      receiver: z.object({
        name: z.string(),
        contact: z.string(),
      }),
      // .nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      const { productId, quantity } = input;
      try {
        if (input.deliveryAddress && input.newDeliveryAddress) {
          throw throwTRPCError({
            message:
              "Cannot provide both deliveryAddress and newDeliveryAddress",
            code: "BAD_REQUEST",
          });
        }

        // if (input.receiver && input.newReceiver) {
        //   throw throwTRPCError({
        //     message: "Cannot provide both receiver and newReceiver",
        //     code: "BAD_REQUEST",
        //   });
        // }

        if (!input.deliveryAddress && !input.newDeliveryAddress) {
          throw throwTRPCError({
            message:
              "Must provide either deliveryAddress or newDeliveryAddress",
            code: "BAD_REQUEST",
          });
        }

        // if (!input.receiver && !input.newReceiver) {
        //   throw throwTRPCError({
        //     message: "Must provide either receiver or newReceiver",
        //     code: "BAD_REQUEST",
        //   });
        // }

        const productInventory = await ctx.prisma.productInventory.findUnique({
          where: { productInventoryId: productId },
          select: {
            productInventoryId: true,
            price: true,
            stock: true,
            productId: true,
            deletedAt: true,
          },
        });
        if (productInventory === null || productInventory.deletedAt) {
          console.log("Product not found", productId);
          throw throwTRPCError({
            message: "Product Inventory not found",
            code: "NOT_FOUND",
          });
        }
        if (productInventory.stock < quantity) {
          throw throwTRPCError({
            message: "Not enough stock",
            code: "BAD_REQUEST",
          });
        }

        // Add logic to process payment
        const payment = { id: "123", status: "PAID" };
        // const payment = await ctx.prisma.payment.create({
        //   data: {
        //     // paymentId: payment.id,
        //     // status: payment.status,
        //     // amount:payment.amount,
        //   }
        // });

        if (payment.status === "PAID") {
          try {
            const { orderStatusId } = (await ctx.prisma.orderStatus.findUnique({
              where: { name: "PAID" },
              select: {
                orderStatusId: true,
              },
            })) ?? { orderStatusId: "" };

            // Add logic for tracking
            let { ordersId } = (await ctx.prisma.orders.findUnique({
              where: { userId: ctx.session.user.id },
              select: {
                ordersId: true,
              },
            })) ?? { ordersId: "" };

            if (ordersId === "") {
              ordersId =
                (
                  await ctx.prisma.orders.create({
                    data: {
                      userId: ctx.session.user.id,
                      // OrderItems:[]
                    },
                    select: {
                      ordersId: true,
                    },
                  })
                ).ordersId ?? "";
            }
            let userAddress: any = null;
            if (input.deliveryAddress) {
              userAddress = await ctx.prisma.userAddress.findUnique({
                where: { userAddressId: input.deliveryAddress },
                select: {
                  userAddressId: true,
                  line1: true,
                  line2: true,
                  LatitudeLongitude: { select: { lat: true, long: true } },
                  userId: true,
                  deletedAt: true,
                  City: {
                    select: {
                      name: true,
                      State: {
                        select: {
                          identifier: true,
                          Country: {
                            select: {
                              code: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  zipcode: true,
                },
              });
            } else if (input.newDeliveryAddress) {
              // add logic to get lat long from address
              let LatitudeLongitude =
                await ctx.prisma.latitudeLongitude.findFirst({
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
                  select: {
                    latitudeLongitudeId: true,
                  },
                });
              }
              const city = await ctx.prisma.city.findFirst({
                where: {
                  name: input.newDeliveryAddress.city,
                  State: {
                    identifier: input.newDeliveryAddress.state,
                    Country: {
                      code: input.newDeliveryAddress.country,
                    },
                  },
                },
                select: {
                  cityId: true,
                  deletedAt: true,
                },
              });

              if (!city || city.deletedAt) {
                throw throwTRPCError({
                  message: "City not found",
                  code: "NOT_FOUND",
                });
              }

              userAddress = await ctx.prisma.userAddress.create({
                data: {
                  line1: input.newDeliveryAddress.line1,
                  line2: input.newDeliveryAddress.line2,
                  zipcode: input.newDeliveryAddress.zipcode,
                  AddressType: {
                    connect: { name: input.newDeliveryAddress.addressType },
                  },
                  userId: ctx.session.user.id,
                  City: {
                    connect: { cityId: city.cityId },
                  },
                  LatitudeLongitude: {
                    connect: {
                      latitudeLongitudeId:
                        LatitudeLongitude.latitudeLongitudeId,
                    },
                  },
                },
                select: {
                  userAddressId: true,
                  line1: true,
                  line2: true,
                  LatitudeLongitude: { select: { lat: true, long: true } },
                  userId: true,
                  deletedAt: true,
                  City: {
                    select: {
                      name: true,
                      State: {
                        select: {
                          identifier: true,
                          Country: {
                            select: {
                              code: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  zipcode: true,
                },
              });
            }

            if (userAddress === null || userAddress.deletedAt) {
              throw throwTRPCError({
                message: "Address not found",
                code: "NOT_FOUND",
              });
            }

            // order service city table
            const city = await ctx.prisma.city.findFirst({
              where: {
                name: userAddress.City.name,
                State: {
                  identifier: userAddress.City.State.identifier,
                  Country: {
                    code: userAddress.City.State.Country.code,
                  },
                },
              },
              select: {
                cityId: true,
              },
            });

            if (city === null) {
              throw throwTRPCError({
                message: "City not found",
                code: "NOT_FOUND",
              });
            }

            let { latitudeLongitudeId } =
              (await ctx.prisma.latitudeLongitude.findFirst({
                where: {
                  lat: userAddress.LatitudeLongitude.lat,
                  long: userAddress.LatitudeLongitude.long,
                },
                select: {
                  latitudeLongitudeId: true,
                },
              })) ?? { latitudeLongitudeId: null };

            if (latitudeLongitudeId === null) {
              ({ latitudeLongitudeId } =
                await ctx.prisma.latitudeLongitude.create({
                  data: {
                    lat: userAddress.LatitudeLongitude.lat,
                    long: userAddress.LatitudeLongitude.long,
                  },
                  select: {
                    latitudeLongitudeId: true,
                  },
                }));
            }

            let { orderAddressId } = (await ctx.prisma.orderAddress.findFirst({
              where: {
                line1: userAddress.line1,
                line2: userAddress.line2,
                zipcode: userAddress.zipcode,
                cityId: city.cityId,
                latitudeLongitudeId: latitudeLongitudeId,
              },
              select: {
                orderAddressId: true,
              },
            })) ?? { orderAddressId: null };

            if (orderAddressId === null) {
              ({ orderAddressId } = await ctx.prisma.orderAddress.create({
                data: {
                  line1: userAddress.line1,
                  line2: userAddress.line2,
                  LatitudeLongitude: {
                    connect: {
                      latitudeLongitudeId: latitudeLongitudeId,
                    },
                  },
                  City: {
                    connect: {
                      cityId: city.cityId,
                    },
                  },
                  AddressType: {
                    connect: {
                      name: "NORMAL",
                    },
                  },
                  zipcode: userAddress.zipcode,
                },
                select: {
                  orderAddressId: true,
                },
              }));
            }

            const user = await ctx.prisma.user.findUnique({
              where: { id: ctx.session.user.id },
              select: {
                id: true,
                name: true,
                contacts: true,
                email: true,
                deletedAt: true,
              },
            });

            if (user === null || user.deletedAt) {
              throw throwTRPCError({
                message: "User not found",
                code: "NOT_FOUND",
              });
            }

            // if (user.contacts === null || user.contacts.length === 0) {
            //   throw throwTRPCError({
            //     message: "User contact not found",
            //     code: "NOT_FOUND",
            //   });
            // }

            // const contacts = await Promise.all(
            //   user.contacts.map(async (contact) => {
            //     return await ctx.prisma.userContact.findUnique({
            //       where: {
            //         userContactId: contact,
            //       },
            //       select: {
            //         userContactId: true,
            //         contact: true,
            //         deletedAt: true,
            //         ContactType: {
            //           select: {
            //             name: true,
            //           },
            //         },
            //       },
            //     });
            //   })
            // );

            // if (contacts === null || contacts.length === 0) {
            //   throw throwTRPCError({
            //     message: "User contact not found",
            //     code: "NOT_FOUND",
            //   });
            // }

            // const billingContacts = contacts.filter(
            //   (contact) =>
            //     contact &&
            //     !contact.deletedAt &&
            //     contact.ContactType.name === "BILLING_CONTACT"
            // );

            // if (billingContacts === null || billingContacts.length === 0) {
            //   throw throwTRPCError({
            //     message: "Billing contact not found",
            //     code: "NOT_FOUND",
            //   });
            // }

            // const billingContact = billingContacts.find((contact) => {
            //   return contact && !contact.deletedAt;
            // });

            // const billingContact = contacts.find((contact) => {
            //   return contact && !contact.deletedAt;
            // });

            // if (!billingContact) {
            //   throw throwTRPCError({
            //     message: "Billing contact not found",
            //     code: "NOT_FOUND",
            //   });
            // }

            const orderUser = await ctx.prisma.orderUser.create({
              data: {
                name: user.name,
                email: user.email,
                // Contact: billingContact.contact,
                Contact: input.receiver.contact,
              },
            });

            const orderReciever = await ctx.prisma.orderReciever.create({
              data: {
                name: input.receiver.name,
                Contact: input.receiver.contact,
              },
            });

            if (ordersId !== "") {
              await ctx.prisma.$transaction([
                ctx.prisma.orderItem.create({
                  data: {
                    productId: productInventory.productId,
                    quantity: quantity,
                    User: {
                      connect: {
                        orderUserId: orderUser.orderUserId,
                      },
                    },
                    Reciever: {
                      connect: {
                        orderRecieverId: orderReciever.orderRecieverId,
                      },
                    },
                    DeliveryAddress: {
                      connect: {
                        orderAddressId: orderAddressId,
                      },
                    },
                    amount: productInventory.price * quantity,
                    Order: { connect: { ordersId: ordersId } },
                    // Add logic to change order status dynamically
                    OrderStatus: {
                      connect: {
                        orderStatusId: orderStatusId,
                      },
                    },
                    // Add logic to add delivery tracker
                    // Add payment info
                  },
                }),
                ctx.prisma.productInventory.update({
                  where: {
                    productInventoryId: productInventory.productInventoryId,
                  },
                  data: {
                    stock: {
                      decrement: quantity,
                    },
                  },
                }),
              ]);
              return true;
            } else {
              throw throwTRPCError({
                message: "Something went wrong while creating order",
                code: "INTERNAL_SERVER_ERROR",
              });
            }
          } catch (err) {
            // Add logic to revert payment
            throw throwTRPCError({
              cause: err,
              message: "Something went bad while placing the order",
            });
          }
        } else {
          throw throwTRPCError({
            message: "Payment failed",
            code: "BAD_REQUEST",
          });
        }
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while placing the order",
        });
      }
    },
  })
  .mutation("cancelOrder", {
    input: z.object({
      orderId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { orderId } = input;
      try {
        const orderItem = await ctx.prisma.orderItem.findUnique({
          where: { orderItemId: orderId },
          select: {
            orderItemId: true,
            productId: true,
            quantity: true,
            Order: true,
            OrderStatus: true,
            DeliveryTracker: true,
            Payment: true,
          },
        });
        if (orderItem === null) {
          throw throwTRPCError({
            message: "Order not found",
            code: "NOT_FOUND",
          });
        }
        if (orderItem.OrderStatus.name !== "PAID") {
          throw throwTRPCError({
            message: "Order cannot be cancelled",
            code: "BAD_REQUEST",
          });
        }
        if (orderItem.Order.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            message: "You are not authorized to cancel this order",
            code: "UNAUTHORIZED",
          });
        }
        const { orderStatusId } = (await ctx.prisma.orderStatus.findUnique({
          where: { name: "CANCELLED" },
          select: {
            orderStatusId: true,
          },
        })) ?? { orderStatusId: "" };
        if (orderStatusId === "") {
          throw throwTRPCError({
            message: "Order status not found",
            code: "NOT_FOUND",
          });
        }
        await ctx.prisma.$transaction([
          ctx.prisma.orderItem.update({
            where: { orderItemId: orderId },
            data: {
              OrderStatus: {
                connect: {
                  orderStatusId: orderStatusId,
                },
              },
            },
          }),
          // revert payment logic
          // cancel the delivery process
          ctx.prisma.productInventory.update({
            where: {
              productInventoryId: orderItem.productId,
            },
            data: {
              stock: {
                increment: orderItem.quantity,
              },
            },
          }),
        ]);
        return true;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while cancelling the order",
        });
      }
    },
  })
  .query("getOrder", {
    input: z.object({
      orderId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { orderId } = input;
      try {
        const orderItem = await ctx.prisma.orderItem.findUnique({
          where: { orderItemId: orderId },
          select: {
            orderItemId: true,
            productId: true,
            quantity: true,
            amount: true,
            Order: true,
            OrderStatus: true,
            DeliveryTracker: true,
            Payment: true,
          },
        });
        if (orderItem === null) {
          throw throwTRPCError({
            message: "Order not found",
            code: "NOT_FOUND",
          });
        }
        if (orderItem.Order.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            message: "You are not authorized to view this order",
            code: "UNAUTHORIZED",
          });
        }
        return orderItem;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while getting the order",
        });
      }
    },
  })
  .query("getOrders", {
    input: z.object({}),
    resolve: async ({ ctx }) => {
      try {
        const orders = await ctx.prisma.orders.findUnique({
          where: { userId: ctx.session.user.id },
          select: {
            ordersId: true,
            OrderItems: {
              select: {
                amount: true,
                orderItemId: true,
                OrderStatus: {
                  select: {
                    name: true,
                  },
                },
                productId: true,
                quantity: true,
              },
            },
          },
        });
        if (orders === null) {
          throw throwTRPCError({
            message: "Orders not found",
            code: "NOT_FOUND",
          });
        }
        return orders;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while getting the orders",
        });
      }
    },
  });
