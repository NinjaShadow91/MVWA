import { createRouter } from "./context";
import { z } from "zod";
import { pbkdf2, randomBytes } from "node:crypto";
import * as trpc from "@trpc/server";
import { trpcSafePrisma } from "./util";

const ITERATIONS = 10;

export const authRouter = createRouter()
  .mutation("forgotPassword", {
    input: z.object({
      resetPassword: z
        .object({
          token: z.string(),
          newPassword: z.string(),
        })
        .nullish(),
      generatePasswordResetLink: z
        .object({
          email: z.string().email(),
        })
        .nullish(),
    }),
    output: z.object({
      message: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { resetPassword, generatePasswordResetLink } = input;
      if (resetPassword) {
        const { token, newPassword } = resetPassword;
        pbkdf2(
          token,
          "",
          ITERATIONS,
          64,
          "sha512",
          async (err, derivedToken) => {
            if (err) {
              throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error hashing token",
              });
            }
            const verificationToken =
              await ctx.prisma.verificationToken.findUnique({
                where: { token: derivedToken.toString("hex") },
              });
            if (
              verificationToken &&
              verificationToken.type === "PASSWORD_RESET" &&
              new Date(verificationToken.expires.getTime() + 60 * 10 * 1000) >
                new Date()
            ) {
              randomBytes(128, async (saltErr, salt) => {
                if (saltErr)
                  throw new trpc.TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                      "Something went wrong while generating salt for your password",
                    // cause: saltErr,
                  });
                pbkdf2(
                  newPassword,
                  salt.toString("hex"),
                  ITERATIONS,
                  64,
                  "sha512",
                  async (err, derivedNewPassword) => {
                    if (err)
                      throw new trpc.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message:
                          "Something went wrong while hashing your password",
                        // cause: saltErr,
                      });
                    trpcSafePrisma(async () => {
                      return await ctx.prisma.$transaction([
                        ctx.prisma.verificationToken.update({
                          where: { token: derivedToken.toString("hex") },
                          data: { type: "PASSWORD_RESET_USED" },
                        }),
                        ctx.prisma.user.update({
                          where: {
                            id: verificationToken.identifier,
                          },
                          data: {
                            password: derivedNewPassword.toString("hex"),
                            salt: salt.toString("hex"),
                            iteration: ITERATIONS,
                          },
                        }),
                      ]);
                    }, "Something went wrong while updating your password");
                  }
                );
              });
            } else {
              throw new trpc.TRPCError({
                code: "BAD_REQUEST",
                message: "Password reset not authorized.",
              });
            }
          }
        );
        return { message: "Sucessfully changed the password" };
      } else if (generatePasswordResetLink) {
        const user = await trpcSafePrisma(async () => {
          return await ctx.prisma.user.findUnique({
            where: { email: generatePasswordResetLink.email },
          });
        }, "Something went wrong while generating reset link for your password, please try again.");
        if (user) {
          randomBytes(128, async (saltErr, salt) => {
            if (saltErr)
              throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message:
                  "Something went wrong while generating salt for your password",
                // cause: saltErr,
              });
            pbkdf2(
              salt.toString("hex"),
              "",
              ITERATIONS,
              64,
              "sha512",
              async (err, derivedToken) => {
                if (err)
                  throw new trpc.TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                      "Something went wrong while creating your passwod reset link.",
                    // cause: saltErr,
                  });

                await trpcSafePrisma(async () => {
                  // someone can ddos a legitemate user by requesting reset password link again and again
                  // ctx.prisma.$transaction([
                  //   ctx.prisma.verificationToken.updateMany({
                  //     data: { expires: new Date() },
                  //     where: { identifier: user.id, type: "PASSWORD_RESET" },
                  //   }),
                  // ]);

                  return await ctx.prisma.verificationToken.create({
                    data: {
                      token: derivedToken.toString("hex"),
                      identifier: user.id,
                      type: "PASSWORD_RESET",
                      expires: new Date(Date.now() + 10),
                    },
                  });
                }, "Something went wrong while generating reset link for your password, please try again.");
                console.log(salt.toString("hex"));
                // Add code to send email send salt.toString("hex") to user.email, subject password reset link
              }
            );
          });
        }
        return {
          message:
            "Password reset link sent if the given link was in our database.",
        };
      } else {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Please pass one option.",
        });
      }
    },
  })
  .mutation("signup", {
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
              const user = await trpcSafePrisma(
                async () =>
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
                  }),
                "Some error occured while creating your account."
              );
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
