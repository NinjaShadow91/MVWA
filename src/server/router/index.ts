// src/server/router/index.ts
import { createRouter } from "./context";
import { productRouter } from "./ProductDetails";
import { UserDataRouter } from "./UserData";
import superjson from "superjson";
import { authRouter } from "./Auth";
import { StoreRouter } from "./Store";
import { SellerRouter } from "./Seller";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("product.", productRouter)
  .merge("user.", UserDataRouter)
  .merge("auth.", authRouter)
  .merge("store.", StoreRouter)
  .merge("seller.", SellerRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
