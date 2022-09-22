import { createRouter } from "./context";
import { z } from "zod";
import { pbkdf2, randomBytes } from "node:crypto";
import * as trpc from "@trpc/server";

const ITERATIONS = 10;

export const authRouter = createRouter().mutation("signup", {
  input: z.object({
    email: z.string().email(),
    dob: z.string(),
    name: z.string(),
    password: z.string(),
  }),
  output: z.object({
    message: z.string(),
  }),
  async resolve({ ctx, input }) {
    let _dob: Date;
    try {
      _dob = new Date(input.dob);
    } catch (e) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "DOB npt valid.",
      });
    }
    const alreadyPresent =
      (await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      })) !== null
        ? true
        : false;
    if (alreadyPresent === false) {
      randomBytes(128, async (saltErr, salt) => {
        if (saltErr)
          throw new trpc.TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Something went wrong while generating salt for your password",
            // cause: saltErr,
          });
        pbkdf2(
          input.password,
          salt.toString("hex"),
          ITERATIONS,
          64,
          "sha512",
          async (err, derivedKey) => {
            if (err)
              throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong while hashing your password",
                // cause: err,
              });
            try {
              console.log("creating user");
              await ctx.prisma.user.create({
                data: {
                  dob: _dob,
                  name: input.name,
                  email: input.email,
                  salt: salt.toString("hex"),
                  iteration: ITERATIONS,
                  password: derivedKey.toString("hex"),
                  emailVerified: null,
                  image: null,
                  primaryPhoneNumber: null,
                  secondaryPhoneNumber: null,
                },
              });
            } catch (err) {
              throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong while creating your account",
              });
            }
          }
        );
      });
    } else {
      throw new trpc.TRPCError({
        code: "CONFLICT",
        message: "User already present with following email. Please sign in.",
      });
    }
    return { message: "User created successfully." };
  },
});
