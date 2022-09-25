// src/server/router/index.ts
import { createRouter } from "./context";
import { productRouter } from "./ProductDetails";
import { UserDataRouter } from "./UserDataRouter";
import superjson from "superjson";
import { authRouter } from "./Auth";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("product.", productRouter)
  .merge("user.", UserDataRouter)
  .merge("auth.", authRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
