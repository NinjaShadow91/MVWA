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
import { FavouriteProductsRouter } from "./editor/FavouriteProducts";
import { MediaRouter } from "./media/Media";
import { CategoryRouter } from "./product/Categories";
import { FeaturedPostsRouter } from "./editor/FeaturedPosts";
import { BannerRouter } from "./editor/Banner";
import { ProductRecommendationBasedOnPreviousOrders } from "./personalisation/BasedOnPreviousOrders";
import { CartRouter } from "./cart/Cart";
import { SaveForLatter } from "./cart/SaveForLatter";
import { WishlistRouter } from "./cart/WishList";
import { NewsletterRouter } from "./newspaper/Subsribe";
import { UserNotificationRouter } from "./user/UserNotification";
import { insertData } from "../db/test";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("user.profile.", userProfileRouter)
  .merge("user.address.", userAddressRouter)
  .merge("user.contact.", userContactRouter)
  .merge("user.notification.", UserNotificationRouter)
  .merge("seller.", sellerRouter)
  .merge("store.", storeRouter)
  .merge("product.review.", productReviewRouter)
  .merge("store.review.", storeReviewRouter)
  .merge("product.", productRouter)
  .merge("product.search.", productSearchRouter)
  .merge("product.inventory.", productInventoryRouter)
  .merge("order.", orderRouter)
  .merge("editor.favourite.", FavouriteProductsRouter)
  .merge("media.", MediaRouter)
  .merge("category.", CategoryRouter)
  .merge("editor.featured.", FeaturedPostsRouter)
  .merge("editor.banner.", BannerRouter)
  .merge("personalisation.", ProductRecommendationBasedOnPreviousOrders)
  .merge("cart.", CartRouter)
  .merge("product.savedForLatter.", SaveForLatter)
  .merge("product.wishlist.", WishlistRouter)
  .merge("newsletter.", NewsletterRouter);

// try {
//   insertData();
// } catch (err) {
//   console.log(err);
// }

// export type definition of API
export type AppRouter = typeof appRouter;
