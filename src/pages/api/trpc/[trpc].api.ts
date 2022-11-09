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
import NextCors from "nextjs-cors";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const cors = Cors();

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export function withCors(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await runMiddleware(req, res, cors);

    return await handler(req, res);
  };
}

// export default withCors(
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError: ({ error, path }) => {
    if (env.NODE_ENV === "development") {
      console.error(`❌ tRPC failed on ${path}: ${error}`);
    }
    console.log(error.cause);
  },
});
// );
