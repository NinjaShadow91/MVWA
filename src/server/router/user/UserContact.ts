import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const userContactRouter = createProtectedRouter()
  .query("getUserContacts", {
    input: z.object({}).nullish(),
    resolve: async ({ ctx, input }) => {
      try {
        const contacts = await ctx.prisma.userContact.findMany({
          where: {
            userId: ctx.session.user.id,
          },
        });
        return contacts.map((contact) => {
          return contact.deletedAt ? false : true;
        });
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching user contacts",
        });
      }
    },
  })
  .query("getUserContact", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const contact = await ctx.prisma.userContact.findUnique({
          where: {
            userContactId: input,
          },
        });
        if (!contact || contact.deletedAt) {
          throw throwTRPCError({
            message: "Contact not found",
            code: "NOT_FOUND",
          });
        }
        return contact;
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching user contact",
        });
      }
    },
  })
  .mutation("addContact", {
    input: z.object({
      contact: z.string(),
      contactType: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const contact = await ctx.prisma.userContact.create({
          data: {
            contact: input.contact,
            userId: ctx.session.user.id,
            ContactType: {
              connect: {
                name: input.contactType,
              },
            },
          },
        });

        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            contacts: {
              push: contact.userContactId,
            },
          },
        });
        return contact;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error adding contact",
        });
      }
    },
  })
  .mutation("updateContact", {
    input: z.object({
      contactId: z.string().uuid(),
      contact: z.string(),
      contactType: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const contact = await ctx.prisma.userContact.update({
          where: {
            userContactId: input.contactId,
          },
          data: {
            contact: input.contact,
            ContactType: {
              connect: {
                name: input.contactType,
              },
            },
          },
        });
        return contact;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error updating contact",
        });
      }
    },
  })
  .mutation("deleteContact", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const contact = await ctx.prisma.userContact.findUnique({
          where: {
            userContactId: input,
          },
          select: {
            userId: true,
            contact: true,
          },
        });
        if (!contact || contact.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Contact not found",
          });
        }
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          select: {
            contacts: true,
          },
        });
        if (!user) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "User not found",
          });
        }
        await ctx.prisma.userContact.update({
          where: {
            userContactId: input,
          },
          data: {
            deletedAt: new Date(),
          },
        });

        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            contacts: user.contacts.filter(
              (contactVal) => contactVal !== contact.contact
            ),
          },
        });
        return true;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error deleting contact",
        });
      }
    },
  });
