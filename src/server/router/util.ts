import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import * as trpc from "@trpc/server";

interface ServerErrorConstructorProps {
  name: string;
  message: string;
  serverMessage: string;
  code: string;
  securityLevel: string;
  cause?: Error;
  extra?: unknown;
}

export class ServerError extends Error {
  // name: string;
  // message: string;
  // stack?: string;
  // cause?: Error;
  #code: string;
  #securityLevel: string;
  #serverMessage: string;
  #extra?: unknown;

  constructor(data: ServerErrorConstructorProps) {
    super(data.message);
    this.name = data.name ?? "ServerError";
    this.#serverMessage = data.serverMessage;
    this.cause = data.cause;
    this.#code = data.code;
    this.#securityLevel = data.securityLevel;
    this.#extra = data.extra;
    Error.captureStackTrace(this);
    return this;
  }
  get code() {
    return this.#code;
  }
  get serverMessage() {
    return this.#serverMessage;
  }
  get securityLevel() {
    return this.#securityLevel;
  }

  get extra() {
    return this.#extra;
  }

  toString(): string {
    return `[${this.code}]: ${this.name}|${this.message}`;
  }

  getDetailedDescription(): string {
    return `Name: ${this.name}\nMessage: ${this.message}\nServer Message: ${
      this.serverMessage
    }\nCode: ${this.code}\nSecurity Level: ${
      this.securityLevel
    }\nExtra: ${JSON.stringify(this.extra)}\nStack: ${
      this.stack
    }\nCause: ${JSON.stringify(this.cause)}`;
  }

  jsonStringify(): string {
    return JSON.stringify({
      name: this.name,
      message: this.message,
      serverMessage: this.serverMessage,
      code: this.code,
      securityLevel: this.securityLevel,
      extra: this.extra,
      stack: this.stack,
      cause: this.cause,
    });
  }

  getRootError(): Error {
    return ServerError.getRootError(this);
  }

  getRootErrorName(): string {
    return this.getRootError().name;
  }

  getRootErrorMessage(): string {
    return this.getRootError().message;
  }

  static getRootError<T extends Error>(error: T): Error {
    let serverError = error.cause;
    if (serverError)
      while (serverError.cause) {
        serverError = serverError.cause;
      }
    return serverError ?? error;
  }
}

export default class ServerErrorHandler<
  LoggerCtxType,
  HandleCallbacksCtxType,
  GeneratorCallbacksCtxType
> {
  #logger: ({
    error,
    ctx,
  }: {
    error: ServerError;
    ctx?: LoggerCtxType;
  }) => Promise<void>;

  #handleCallbacks: Map<
    string,
    ({
      ctx,
      error,
      callbackId,
    }: {
      ctx?: HandleCallbacksCtxType;
      error: ServerError;
      callbackId: string;
    }) => Promise<ServerError>
  >;

  #synchronousHandleCallbacks: Map<
    string,
    ({
      ctx,
      error,
      callbackId,
    }: {
      ctx?: HandleCallbacksCtxType;
      error: ServerError;
      callbackId: string;
    }) => ServerError
  >;

  #generatorCallbacks: Map<
    string,
    ({
      ctx,
      error,
      callbackId,
    }: {
      ctx?: GeneratorCallbacksCtxType;
      error: unknown;
      callbackId: string;
    }) => Promise<unknown>
  >;

  #synchronousGeneratorCallbacks: Map<
    string,
    ({
      ctx,
      error,
      callbackId,
    }: {
      ctx?: GeneratorCallbacksCtxType;
      error: unknown;
      callbackId: string;
    }) => unknown
  >;

  #synchronousLogger: ({
    error,
    ctx,
  }: {
    error: ServerError;
    ctx?: LoggerCtxType;
  }) => void;

  get logger() {
    return this.#logger;
  }

  get synchronousLogger() {
    return this.#synchronousLogger;
  }

  get handleCallbacks() {
    return this.#handleCallbacks;
  }

  get synchronousHandleCallbacks() {
    return this.#synchronousHandleCallbacks;
  }

  get generatorCallbacks() {
    return this.#generatorCallbacks;
  }

  get synchronousGeneratorCallbacks() {
    return this.#synchronousGeneratorCallbacks;
  }

  constructor({
    logger,
    synchronousLogger,
    handleCallbacks,
    synchronousHandleCallbacks,
    generatorCallbacks,
    synchronousGeneratorCallbacks,
  }: {
    logger?: ({
      error,
      ctx,
    }: {
      error: ServerError;
      ctx?: LoggerCtxType;
    }) => Promise<void>;
    synchronousLogger?: ({
      error,
      ctx,
    }: {
      error: ServerError;
      ctx?: LoggerCtxType;
    }) => void;
    handleCallbacks?: Map<
      string,
      ({
        ctx,
        error,
        callbackId,
      }: {
        ctx?: HandleCallbacksCtxType;
        error: ServerError;
        callbackId: string;
      }) => Promise<ServerError>
    >;
    synchronousHandleCallbacks?: Map<
      string,
      ({
        ctx,
        error,
        callbackId,
      }: {
        ctx?: HandleCallbacksCtxType;
        error: ServerError;
        callbackId: string;
      }) => ServerError
    >;
    generatorCallbacks?: Map<
      string,
      ({
        ctx,
        error,
        callbackId,
      }: {
        ctx?: GeneratorCallbacksCtxType;
        error: unknown;
        callbackId: string;
      }) => Promise<unknown>
    >;
    synchronousGeneratorCallbacks?: Map<
      string,
      ({
        ctx,
        error,
        callbackId,
      }: {
        ctx?: GeneratorCallbacksCtxType;
        error: unknown;
        callbackId: string;
      }) => unknown
    >;
  }) {
    this.#logger = logger ?? this.#defaultLogger;
    this.#synchronousLogger =
      synchronousLogger ?? this.#defaultSynchronousLogger;
    this.#handleCallbacks = handleCallbacks ?? new Map();
    this.#synchronousHandleCallbacks = synchronousHandleCallbacks ?? new Map();
    this.#generatorCallbacks = generatorCallbacks ?? new Map();
    this.#synchronousGeneratorCallbacks =
      synchronousGeneratorCallbacks ?? new Map();
    process.on("uncaughtException", async (error) => {
      let serverError = error as ServerError;
      serverError = await this.#handle({ error: serverError });
      await this.#defaultLogger({ error: serverError });
    });
    process.on("uncaughtRejection", async (error) => {
      let serverError = error as ServerError;
      serverError = await this.#handle({ error: serverError });
      await this.#defaultLogger({ error: serverError });
    });
  }

  registerHandleCallback({
    id,
    callback,
  }:
    | {
        id: string;
        callback: ({
          ctx,
          error,
          callbackId,
        }: {
          ctx?: HandleCallbacksCtxType;
          error: ServerError;
          callbackId: string;
        }) => Promise<ServerError>;
      }
    | {
        id: undefined;
        callback: {
          id: string;
          callback: ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: HandleCallbacksCtxType;
            error: ServerError;
            callbackId: string;
          }) => Promise<ServerError>;
        }[];
      }
    | {
        id: undefined;
        callback: Map<
          string,
          ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: HandleCallbacksCtxType;
            error: ServerError;
            callbackId: string;
          }) => Promise<ServerError>
        >;
      }) {
    if (id === undefined) {
      Array.isArray(callback)
        ? callback.forEach((cb) =>
            this.#handleCallbacks.set(cb.id, cb.callback)
          )
        : callback.forEach((cb, id) => this.#handleCallbacks.set(id, cb));
      return true;
    } else if (typeof id === "string") {
      this.#handleCallbacks.set(id, callback);
      return true;
    }
    return false;
  }

  unregisterHandleCallback(id: string) {
    return this.#handleCallbacks.delete(id);
  }

  registerSynchronousHandleCallback({
    id,
    callback,
  }:
    | {
        id: string;
        callback: ({
          ctx,
          error,
          callbackId,
        }: {
          ctx?: HandleCallbacksCtxType;
          error: ServerError;
          callbackId: string;
        }) => ServerError;
      }
    | {
        id: undefined;
        callback: {
          id: string;
          callback: ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: HandleCallbacksCtxType;
            error: ServerError;
            callbackId: string;
          }) => ServerError;
        }[];
      }
    | {
        id: undefined;
        callback: Map<
          string,
          ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: HandleCallbacksCtxType;
            error: ServerError;
            callbackId: string;
          }) => ServerError
        >;
      }) {
    if (id === undefined) {
      Array.isArray(callback)
        ? callback.forEach((cb) =>
            this.#synchronousHandleCallbacks.set(cb.id, cb.callback)
          )
        : callback.forEach((cb, id) =>
            this.#synchronousHandleCallbacks.set(id, cb)
          );
      return true;
    } else if (typeof id === "string") {
      this.#synchronousHandleCallbacks.set(id, callback);
      return true;
    } else return false;
  }

  unregisterSynchronousHandleCallback(id: string) {
    return this.#synchronousHandleCallbacks.delete(id);
  }

  registerGeneratorCallback({
    id,
    callback,
  }:
    | {
        id: string;
        callback: ({
          ctx,
          error,
          callbackId,
        }: {
          ctx?: GeneratorCallbacksCtxType;
          error: unknown;
          callbackId: string;
        }) => Promise<unknown>;
      }
    | {
        id: undefined;
        callback: {
          id: string;
          callback: ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: GeneratorCallbacksCtxType;
            error: unknown;
            callbackId: string;
          }) => Promise<unknown>;
        }[];
      }
    | {
        id: undefined;
        callback: Map<
          string,
          ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: GeneratorCallbacksCtxType;
            error: unknown;
            callbackId: string;
          }) => Promise<unknown>
        >;
      }) {
    if (id === undefined) {
      Array.isArray(callback)
        ? callback.forEach((cb) =>
            this.#generatorCallbacks.set(cb.id, cb.callback)
          )
        : callback.forEach((cb, id) => this.#generatorCallbacks.set(id, cb));
      return true;
    } else if (typeof id === "string") {
      this.#generatorCallbacks.set(id, callback);
      return true;
    } else return false;
  }

  unregisterGeneratorCallback(id: string) {
    return this.#generatorCallbacks.delete(id);
  }

  registerSynchronousGeneratorCallback({
    id,
    callback,
  }:
    | {
        id: string;
        callback: ({
          ctx,
          error,
          callbackId,
        }: {
          ctx?: GeneratorCallbacksCtxType;
          error: unknown;
          callbackId: string;
        }) => unknown;
      }
    | {
        id: undefined;
        callback: {
          id: string;
          callback: ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: GeneratorCallbacksCtxType;
            error: unknown;
            callbackId: string;
          }) => unknown;
        }[];
      }
    | {
        id: undefined;
        callback: Map<
          string,
          ({
            ctx,
            error,
            callbackId,
          }: {
            ctx?: GeneratorCallbacksCtxType;
            error: unknown;
            callbackId: string;
          }) => unknown
        >;
      }) {
    if (id === undefined) {
      Array.isArray(callback)
        ? callback.forEach((cb) =>
            this.#synchronousGeneratorCallbacks.set(cb.id, cb.callback)
          )
        : callback.forEach((cb, id) =>
            this.#synchronousGeneratorCallbacks.set(id, cb)
          );
      return true;
    } else if (typeof id === "string") {
      this.#synchronousGeneratorCallbacks.set(id, callback);
      return true;
    } else return false;
  }

  unregisterSynchronousGeneratorCallback(id: string) {
    this.#synchronousGeneratorCallbacks.delete(id);
  }

  setLogger(
    logger: ({
      error,
      ctx,
    }: {
      error: ServerError;
      ctx?: LoggerCtxType;
    }) => Promise<void>
  ) {
    this.#logger = logger;
  }

  setSynchronousLogger(
    synchronousLogger: ({
      error,
      ctx,
    }: {
      error: ServerError;
      ctx?: LoggerCtxType;
    }) => void
  ) {
    this.#synchronousLogger = synchronousLogger;
  }

  async #handle({
    error,
    callbackCtx,
  }: {
    error: ServerError;
    loggerCtx?: LoggerCtxType;
    callbackCtx?: HandleCallbacksCtxType;
  }): Promise<ServerError> {
    let serverError: ServerError = error;
    this.#handleCallbacks.forEach(
      async (callback, callbackId) =>
        (serverError = await callback({ error, ctx: callbackCtx, callbackId }))
    );
    return serverError;
  }

  #synchronousHandle({
    error,
    callbackCtx,
  }: {
    error: ServerError;
    loggerCtx?: LoggerCtxType;
    callbackCtx?: HandleCallbacksCtxType;
  }): ServerError {
    let serverError: ServerError = error;
    this.#synchronousHandleCallbacks.forEach(
      (callback, callbackId) =>
        (serverError = callback({ error, ctx: callbackCtx, callbackId }))
    );
    return serverError;
  }

  async throwServerError({
    errorConstructorObject,
    loggerCtx,
    callbackCtx,
    generatorCtx,
  }: {
    errorConstructorObject: unknown;
    loggerCtx?: LoggerCtxType;
    callbackCtx?: HandleCallbacksCtxType;
    generatorCtx?: GeneratorCallbacksCtxType;
  }) {
    let serverError: unknown;
    this.#generatorCallbacks.forEach(async (callback, callbackId) => {
      serverError = await callback({
        error: errorConstructorObject,
        ctx: generatorCtx,
        callbackId,
      });
    });

    if (serverError instanceof ServerError) {
      await this.#logger({ error: serverError, ctx: loggerCtx });
      const handledServerError = await this.#handle({
        error: serverError,
        callbackCtx,
      });
      throw handledServerError;
    } else {
      const serverError = new ServerError({
        name: "ServerError",
        message: "An error occurred while processsing the request",
        extra: errorConstructorObject,
        code: "000",
        securityLevel: "HIGH",
        serverMessage:
          "Server error generator must return a ServerError instance",
      });
      await this.#logger({ error: serverError, ctx: loggerCtx });
      const handledServerError = await this.#handle({
        error: serverError,
        callbackCtx,
      });
      throw handledServerError;
    }
  }

  throwSynchronousServerError({
    errorConstructorObject,
    loggerCtx,
    callbackCtx,
    generatorCtx,
  }: {
    errorConstructorObject: unknown;
    loggerCtx?: LoggerCtxType;
    callbackCtx?: HandleCallbacksCtxType;
    generatorCtx?: GeneratorCallbacksCtxType;
  }) {
    let serverError: unknown;
    this.#synchronousGeneratorCallbacks.forEach((callback, callbackId) => {
      serverError = callback({
        error: errorConstructorObject,
        ctx: generatorCtx,
        callbackId,
      });
    });
    console.log("asd", serverError);
    if (serverError instanceof ServerError) {
      console.log("going to loggeer", serverError);
      this.#synchronousLogger({ error: serverError, ctx: loggerCtx });
      this.#synchronousHandle({ error: serverError, callbackCtx });
      throw serverError;
    } else {
      const serverError = new ServerError({
        name: "ServerError",
        message: "An error occurred while processsing the request",
        extra: errorConstructorObject,
        code: "000",
        securityLevel: "HIGH",
        serverMessage:
          "Server error generator must return a ServerError instance",
      });
      this.#synchronousLogger({ error: serverError, ctx: loggerCtx });
      this.#synchronousHandle({ error: serverError, callbackCtx });
      throw serverError;
    }
  }
  async #defaultLogger({
    error,
    ctx,
  }: {
    error: ServerError;
    ctx?: LoggerCtxType;
  }) {
    console.log("Default logger", error, ctx);
    return;
  }

  #defaultSynchronousLogger({
    error,
    ctx,
  }: {
    error: ServerError;
    ctx?: LoggerCtxType;
  }) {
    console.log("Default logger", error, ctx);
    return;
  }
}
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

export const cthrowTRPCError = ({
  error,
  ctx,
  callbackId,
}: {
  error: unknown;
  ctx?: throwTRPCErrorProps;
  callbackId?: string;
}) => {
  const { cause, code, message, propogate } = ctx ?? {};
  console.log("ctx is", ctx, propogate, message);
  if ((propogate === undefined || propogate === true) && cause) {
    console.log("new cause error");
    return new ServerError({
      name: "ServerError",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: (cause as any).message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (cause as any).code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cause: cause as any,
      securityLevel: "HIGH",
      serverMessage: "Got high req",
    });
  } else if (code && message) {
    console.log("new error");
    return new ServerError({
      name: "New ServerError",
      message: message,
      code: code,
      securityLevel: "HIGH",
      serverMessage:
        "Server error generator must return a ServerError instance",
    });
  } else {
    console.log("new default error");
    return new ServerError({
      name: "New default ServerError",
      message: "An error occurred while processsing the  trpc request",
      code: "000",
      securityLevel: "HIGH",
      serverMessage:
        "Server error generator must return a ServerError instance",
    });
  }
};

const mapA = new Map<
  string,
  ({
    ctx,
    error,
    callbackId,
  }: {
    ctx?: throwTRPCErrorProps | undefined;
    error: unknown;
    callbackId: string;
  }) => unknown
>();
mapA.set("a", cthrowTRPCError);

export const SEH = new ServerErrorHandler<void, void, throwTRPCErrorProps>({
  synchronousLogger: ({ error, ctx }) => {
    const rootError = error.getRootError();
    console.log("synchronous logger", error.jsonStringify(), ctx);
    console.log("root error", rootError);
  },
  synchronousGeneratorCallbacks: mapA,
});
// const errorConstructorObject = { cause, code, message, propogate };
// SEH.throwSynchronousServerError({ errorConstructorObject });

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
