import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import * as trpc from "@trpc/server";

interface throwPrismaTRPCErrorProps {
  cause:
    | PrismaClientRustPanicError
    | PrismaClientKnownRequestError
    | PrismaClientValidationError
    | PrismaClientInitializationError
    | PrismaClientUnknownRequestError;
  message: string;
}

export const throwPrismaTRPCError = ({
  cause,
  message,
}: throwPrismaTRPCErrorProps) => {
  throw new trpc.TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    cause: cause,
    message: message,
  });
};

export const trpcSafePrisma = async (
  fn: () => Promise<any>,
  errMessage: string
) => {
  try {
    return await fn();
  } catch (err) {
    if (
      err instanceof PrismaClientRustPanicError ||
      err instanceof PrismaClientKnownRequestError ||
      err instanceof PrismaClientValidationError ||
      err instanceof PrismaClientInitializationError ||
      err instanceof PrismaClientUnknownRequestError
    ) {
      console.log("throwing", err);
      throwPrismaTRPCError({
        cause: err,
        message: errMessage,
      });
    } else {
      throw err;
    }
  }
};
