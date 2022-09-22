/**
 * CURRENTLY IN USE
 * CHECK THE AS usage in case of req and res
 */

// Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs

import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../server/db/client";
import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth].api";

// Next API route example - /pages/api/restricted.ts
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const adapter = PrismaAdapter(prisma);
  const req = ctx.req as NextApiRequest;
  const res = ctx.res as NextApiResponse;
  return await unstable_getServerSession(
    req,
    res,
    nextAuthOptions({ adapter, req, res })
  );
};
