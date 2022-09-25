import { createRouter } from "./context";
import { z } from "zod";
import { pbkdf2, randomBytes } from "node:crypto";
import { throwPrismaTRPCError, throwTRPCError } from "./util";

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
        return await new Promise<string>((resolve, reject) => {
          pbkdf2(
            token,
            "",
            ITERATIONS,
            64,
            "sha512",
            async (err, derivedToken) => {
              if (err) reject(err);
              else {
                resolve(derivedToken.toString("hex"));
              }
            }
          );
        })
          .then(async (derivedToken) => {
            try {
              const verificationToken =
                await ctx.prisma.verificationToken.findUnique({
                  where: { token: derivedToken },
                });
              if (
                verificationToken &&
                verificationToken.type === "PASSWORD_RESET" &&
                verificationToken.expires > new Date()
              ) {
                const user = await ctx.prisma.user.findUnique({
                  where: { id: verificationToken.identifier },
                });
                if (user) {
                  try {
                    const salt = randomBytes(128).toString("hex");
                    return await new Promise<[string, string]>(
                      (resolve, reject) => {
                        pbkdf2(
                          newPassword,
                          salt,
                          ITERATIONS,
                          64,
                          "sha512",
                          async (err, derivedKey) => {
                            if (err) reject(err);
                            else {
                              resolve([
                                derivedToken,
                                derivedKey.toString("hex"),
                              ]);
                            }
                          }
                        );
                      }
                    )
                      .then(async ([derivedToken, derivedKey]) => {
                        try {
                          ctx.prisma.$transaction([
                            ctx.prisma.verificationToken.update({
                              where: { token: derivedToken },
                              data: {
                                type: "PASSWORD_RESET_USED",
                              },
                            }),
                            ctx.prisma.user.update({
                              where: { id: user.id },
                              data: {
                                password: derivedKey,
                                salt: salt,
                                iteration: ITERATIONS,
                              },
                            }),
                          ]);
                          return {
                            message: "Sucessfully changed the password",
                          };
                        } catch (err) {
                          throw throwPrismaTRPCError({
                            cause: err,
                            message:
                              "Something went wrong while updating the password",
                          });
                        }
                      })
                      .catch((err) => {
                        throw throwTRPCError({
                          cause: err,
                          code: "INTERNAL_SERVER_ERROR",
                          message:
                            "Something went wrong while hashing the password",
                        });
                      });
                  } catch (err) {
                    throw throwTRPCError({
                      cause: err,
                      code: "INTERNAL_SERVER_ERROR",
                      message: "Something went wrong while generating the salt",
                    });
                  }
                } else {
                  throw throwTRPCError({
                    code: "BAD_REQUEST",
                    message: "No user found",
                  });
                }
              } else {
                throw throwTRPCError({
                  code: "BAD_REQUEST",
                  message: "Password reset not authorized.",
                });
              }
            } catch (err) {
              throw throwPrismaTRPCError({
                cause: err,
                message: "Something went wrong while resetting the password",
              });
            }
          })
          .catch((err) => {
            throw throwTRPCError({
              cause: err,
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong while resetting your password",
            });
          });
      } else if (generatePasswordResetLink) {
        try {
          const user = await ctx.prisma.user.findUnique({
            where: { email: generatePasswordResetLink.email },
          });

          if (user) {
            try {
              const token = randomBytes(128).toString("hex");
              await new Promise<string>((resolve, reject) => {
                pbkdf2(
                  token,
                  "",
                  ITERATIONS,
                  64,
                  "sha512",
                  async (err, derivedToken) => {
                    if (err) reject(err);
                    else resolve(derivedToken.toString("hex"));
                  }
                );
              }).then(async (derivedToken) => {
                try {
                  await ctx.prisma.verificationToken.create({
                    data: {
                      identifier: user.id,
                      token: derivedToken,
                      type: "PASSWORD_RESET",
                      expires: new Date(new Date().getTime() + 10 * 60 * 1000),
                    },
                  });
                  console.log(token);
                  // send mail to user.email, subject Password Reset and with link auth/forgot-password?token=  --token---
                  return token;
                } catch (err) {
                  throw throwPrismaTRPCError({
                    cause: err,
                    message:
                      "Something went bad while generating your password reset token.",
                  });
                }
              });
            } catch (err) {
              throw throwTRPCError({
                cause: err,
                code: "INTERNAL_SERVER_ERROR",
                message:
                  "Something went bad while generating your password reset token.",
              });
            }
          }
          return {
            message:
              "Password reset link sent if the given link was in our database.",
          };
        } catch (err) {
          throw throwPrismaTRPCError({
            cause: err,
            message:
              "Something went wrong while generating reset link for your password, please try again.",
          });
        }
      } else {
        throw throwTRPCError({
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
      isSuccess: z.boolean(),
      user: z
        .object({
          id: z.string().uuid(),
          email: z.string().email(),
          name: z.string(),
        })
        .nullable(),
    }),
    async resolve({ ctx, input }) {
      let _dob: Date;
      try {
        _dob = new Date(input.dob);
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          code: "BAD_REQUEST",
          message: "DOB not valid.",
        });
      }
      try {
        const alreadyPresent =
          (await ctx.prisma.user.findUnique({
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
              try {
                const user = await ctx.prisma.user.create({
                  data: {
                    dob: _dob,
                    name: input.name,
                    email: input.email,
                    salt: salt,
                    iteration: ITERATIONS,
                    password: derivedKey,
                    emailVerified: null,
                    image: null,
                    primaryPhoneNumber: null,
                    secondaryPhoneNumber: null,
                  },
                });
                return user;
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
    },
  });
