import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const userAddressRouter = createProtectedRouter()
  .query("getUserAddresses", {
    input: z.object({}).nullish(),
    resolve: async ({ ctx, input }) => {
      try {
        const address = await ctx.prisma.userAddress.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            userAddressId: true,
            line1: true,
            line2: true,
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
            deletedAt: true,
          },
        });
        return address.filter((address) => {
          return address.deletedAt ? false : true;
        });
      } catch (e) {
        throw throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching user address",
        });
      }
    },
  })
  .query("getUserAddress", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const address = await ctx.prisma.userAddress.findUnique({
          where: {
            userAddressId: input,
          },
        });
        if (!address || address.deletedAt) {
          throw throwTRPCError({
            message: "Address not found",
            code: "NOT_FOUND",
          });
        }
        return address;
      } catch (e) {
        throw throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching user address",
        });
      }
    },
  })
  .mutation("addAddress", {
    input: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zipcode: z.string(),
      addressType: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const addressType = await ctx.prisma.userAddressType.findUnique({
          where: {
            name: input.addressType,
          },
        });

        if (!addressType) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Address type not found",
          });
        }

        const city = await ctx.prisma.city.findFirst({
          where: {
            name: input.city,
            State: {
              identifier: input.state,
              Country: {
                code: input.country,
              },
            },
          },
        });

        if (!city) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "City not found",
          });
        }
        const latLing = await ctx.prisma.latitudeLongitude.findFirstOrThrow({
          where: {
            lat: 0,
            long: 0,
          },
        });

        const address = await ctx.prisma.userAddress.create({
          data: {
            line1: input.line1,
            line2: input.line2,
            City: {
              connect: {
                cityId: city.cityId,
              },
            },
            // Add logic to get latting and longitude from address
            LatitudeLongitude: {
              connect: {
                latitudeLongitudeId: latLing.latitudeLongitudeId,
              },
            },

            zipcode: input.zipcode,
            userId: ctx.session.user.id,
            AddressType: {
              connect: {
                name: input.addressType,
              },
            },
          },
        });

        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            addresses: {
              push: address.userAddressId,
            },
          },
        });
        return address;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error adding address",
        });
      }
    },
  })
  .mutation("updateAddress", {
    input: z.object({
      addressId: z.string().uuid(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zipcode: z.string(),
      addressType: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const addressType = await ctx.prisma.userAddressType.findUnique({
          where: {
            name: input.addressType,
          },
        });

        if (!addressType) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Address type not found",
          });
        }

        const add = await ctx.prisma.userAddress.findUnique({
          where: {
            userAddressId: input.addressId,
          },
          select: {
            userId: true,
            deletedAt: true,
          },
        });

        if (add === null || add.deletedAt) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Address not found",
          });
        }

        if (add.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Unauthorized",
          });
        }

        const city = await ctx.prisma.city.findFirst({
          where: {
            name: input.city,
            State: {
              identifier: input.state,
              Country: {
                code: input.country,
              },
            },
          },
        });

        if (!city) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "City not found",
          });
        }

        const latLing = await ctx.prisma.latitudeLongitude.findFirstOrThrow({
          where: {
            lat: 0,
            long: 0,
          },
        });

        const address = await ctx.prisma.userAddress.update({
          where: {
            userAddressId: input.addressId,
          },
          data: {
            line1: input.line1,
            line2: input.line2,
            City: {
              connect: {
                cityId: city.cityId,
              },
            },
            // Add logic to get latting and longitude from address
            LatitudeLongitude: {
              connect: {
                latitudeLongitudeId: latLing.latitudeLongitudeId,
              },
            },
            zipcode: input.zipcode,
            AddressType: {
              connect: {
                name: input.addressType,
              },
            },
          },
        });
        return address;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error updating address",
        });
      }
    },
  })
  .mutation("deleteAddress", {
    input: z.object({
      addressId: z.string().uuid(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const add = await ctx.prisma.userAddress.findUnique({
          where: {
            userAddressId: input.addressId,
          },
          select: {
            userId: true,
            deletedAt: true,
          },
        });

        if (add === null || add.deletedAt) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Address not found",
          });
        }

        if (add.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Unauthorized",
          });
        }

        const address = await ctx.prisma.userAddress.update({
          where: {
            userAddressId: input.addressId,
          },
          data: {
            deletedAt: new Date(),
          },
        });

        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          select: {
            addresses: true,
          },
        });

        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            addresses: user?.addresses.filter((id) => id !== input.addressId),
          },
        });
        return address;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error deleting address",
        });
      }
    },
  });
