// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { authRouter } from "./auth/Auth";
import { userProfileRouter } from "./user/UserProfile";
import { userAddressRouter } from "./user/UserAddress";
import { userContactRouter } from "./user/UserContact";
import { sellerRouter } from "./store/Seller";
import { storeRouter } from "./store/Store";
import { productReviewRouter } from "./review/ProductReview";
import { storeReviewRouter } from "./review/StoreReview";
import { productRouter } from "./product/ProductDetails";
import { productSearchRouter } from "./product/Search";
import { productInventoryRouter } from "./order/ProductInventory";
import { orderRouter } from "./order/Order";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("user.profile.", userProfileRouter)
  .merge("user.address.", userAddressRouter)
  .merge("user.contact.", userContactRouter)
  .merge("store.seller.", sellerRouter)
  .merge("store.", storeRouter)
  .merge("product.review.", productReviewRouter)
  .merge("store.review.", storeReviewRouter)
  .merge("product.", productRouter)
  .merge("product.search.", productSearchRouter)
  .merge("product.inventory.", productInventoryRouter)
  .merge("order.", orderRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
