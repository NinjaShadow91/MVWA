// src/pages/api/trpc/[trpc].ts
import {
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from "@prisma/client/runtime/index.js";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { ZodError } from "zod";
import { env } from "../../../env/server.mjs";
import { appRouter } from "../../../server/router";
import { createContext } from "../../../server/router/context";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError: ({ error, path }) => {
    if (env.NODE_ENV === "development") {
      console.error(`❌ tRPC failed on ${path}: ${error}`);
    }
    console.log(error.cause);

    // if (error.cause instanceof PrismaClientInitializationError) {
    //   error = {
    //     code: "INTERNAL_SERVER_ERROR",
    //     name: "ERROR",
    //     message: "Something went wrong while creating your hui hui",
    //   };
    // }
    // if (
    //   error.code === "INTERNAL_SERVER_ERROR" ||
    //   (error.code === "BAD_REQUEST" && error.cause instanceof ZodError)
    // ) {
    //   // console.error(error);
    //   // error.message = "Something went wrong";
    //   // return { message: "Something went wrong" };
    // } else return error;
  },
});
