// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { getServerAuthSession } from "../common/get-server-auth-session";
import { prisma } from "../db/client";
import { exec } from "child_process";
import http from "node:http";
import jsdom from "jsdom";
import fs from "fs/promises";
import { env } from "process";

type CreateContextOptions = {
  session: Session | null;
  req: NextApiRequest;
  res: NextApiResponse<any>;
};

/** Use this helper for:
 * - testing, where we dont have to Mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    req: opts.req,
    res: opts.res,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/

function logReferer(referer: string) {
  const time = new Date().toISOString();
  if (referer && referer.startsWith("http://allowed.com") && referer !== "") {
    http
      .get(referer, (res) => {
        const OUR_SITE = "http://localhost:3000/";
        const data: any[] = [];
        const headerDate =
          res.headers && res.headers.date
            ? res.headers.date
            : "no response date";

        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          const htmlString = Buffer.concat(data).toString();
          const htmlDoc = new jsdom.JSDOM(htmlString);
          const title =
            htmlDoc.window.document.querySelector("title")?.textContent;
          const anchorTags = Array.from(
            htmlDoc.window.document.querySelectorAll(`a[href="${OUR_SITE}"]`)
          );
          const anchorTagText = anchorTags
            .map((tag) => {
              return (tag as any).textContent;
            })
            .join(", ");
          console.log(
            `echo "${time} -- ${referer} -- ${title} -- ${anchorTagText}" >> ${env.LOG_DIR}/trpc.log`
          );
          exec(
            `echo "${time} -- ${referer} -- ${title} -- ${anchorTagText}" >> ${env.LOG_DIR}/trpc.log`
          );
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
      });
  } else {
    exec(`echo "${time} -- ${referer}" >> ${env.LOG_DIR}/trpc2.log`);
  }
}

function logRefererSecure(referer: string) {
  const time = new Date().toISOString();
  if (referer && referer.startsWith("http://allowed.com/") && referer !== "") {
    http
      .get(referer, (res) => {
        const OUR_SITE = "/";
        const data: any[] = [];
        const headerDate =
          res.headers && res.headers.date
            ? res.headers.date
            : "no response date";

        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          const htmlString = Buffer.concat(data).toString();
          const htmlDoc = new jsdom.JSDOM(htmlString);
          const title =
            htmlDoc.window.document.querySelector("title")?.textContent;
          const anchorTags = Array.from(
            htmlDoc.window.document.querySelectorAll(`a[href="${OUR_SITE}"]`)
          );
          const anchorTagText = anchorTags
            .map((tag) => {
              return (tag as any).textContent;
            })
            .join(", ");
          fs.appendFile(
            `${env.LOG_DIR}/trpc.log`,
            `${time} -- ${referer} -- ${title} -- ${anchorTagText}`
          );
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
      });
  } else {
    fs.appendFile(`${env.LOG_DIR}/trpc.log`, `${time} -- ${referer}`);
  }
}

export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return await createContextInner({
    session,
    req,
    res,
  });
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () =>
  trpc.router<Context>().middleware(({ ctx, next }) => {
    logReferer(ctx.req.headers.referer as string);
    return next();
  });

/**
 * Creates a tRPC router that asserts all queries and mutations are from an authorized user. Will throw an unauthorized error if a user is not signed in.
 **/
export function createProtectedRouter() {
  return createRouter().middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
    }
    logReferer(ctx.req.headers.referer as string);
    return next({
      ctx: {
        ...ctx,
        // infers that `session` is non-nullable to downstream resolvers
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
}
