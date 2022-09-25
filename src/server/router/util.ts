import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import * as trpc from "@trpc/server";

interface throwTRPCErrorProps {
  cause?: unknown;
  message?: string;
  code?:
    | "INTERNAL_SERVER_ERROR"
    | "BAD_REQUEST"
    | "PARSE_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "METHOD_NOT_SUPPORTED"
    | "TIMEOUT"
    | "CONFLICT"
    | "PRECONDITION_FAILED"
    | "PAYLOAD_TOO_LARGE"
    | "CLIENT_CLOSED_REQUEST";
  propogate?: boolean;
}

export const throwTRPCError = ({
  cause,
  code,
  message,
  propogate,
}: throwTRPCErrorProps) => {
  if ((propogate === undefined || propogate === true) && cause) {
    throw cause;
  } else if (code && message) {
    throw new trpc.TRPCError({
      cause: cause,
      code: code,
      message: message,
    });
  } else {
    throw new trpc.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      cause: cause,
    });
  }
};

interface throwPrismaTRPCErrorProps {
  cause: unknown;
  message: string;
}

export const throwPrismaTRPCError = ({
  cause,
  message,
}: throwPrismaTRPCErrorProps) => {
  if (
    cause instanceof PrismaClientInitializationError ||
    cause instanceof PrismaClientKnownRequestError ||
    cause instanceof PrismaClientRustPanicError ||
    cause instanceof PrismaClientUnknownRequestError ||
    cause instanceof PrismaClientValidationError
  ) {
    const code = "INTERNAL_SERVER_ERROR";
    throw throwTRPCError({
      propogate: false,
      code: code,
      cause: cause,
      message: message,
    });
  } else {
    throw throwTRPCError({ cause });
  }
};
