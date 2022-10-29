import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getProductLink, Media } from "./utils/utils";
interface Product {
  productId: string;
  name: string;
  price: number;
  description: string;
  Media: {
    mediaId: string;
  }[];
}

interface Category {
  categoryId: string;
  name: string;
  description: string;
  media: {
    mediaId: string;
  }[];
}

interface Fetaured {
  postId: string;
  title: string;
  description: string;
  Media: {
    mediaId: string;
  }[];
}

interface HeroBanner {
  bannerId: string;
  title: string;
  description: string;
  Media: {
    mediaId: string;
  }[];
  query: string | null;
}

const Home: NextPage = () => {
  const session = useSession();

  const [heroBanner, setHeroBanner] = useState<HeroBanner | null>();
  const [favouriteProducts, setFavouriteProducts] = useState<Product[] | null>(
    []
  );
  const [categories, setCategories] = useState<Category[] | null>([]);
  const [featured, setFeatured] = useState<Fetaured | null>(null);
  const [productsBasedOnPreviousOrders, setProductsBasedOnPreviousOrders] =
    useState<Product[] | null>([]);

  trpc.useQuery(["editor.banner.get", 1], {
    onSuccess: (data) => {
      setHeroBanner(data ? data[0] : null);
    },
  });

  trpc.useQuery(["category.get"], {
    onSuccess: (data) => {
      setCategories(data);
    },
  });

  trpc.useQuery(["editor.favourite.get"], {
    onSuccess: (data) => {
      setFavouriteProducts(data ?? null);
    },
  });

  trpc.useQuery(["editor.featured.get"], {
    onSuccess: (data) => {
      setFeatured(data ?? null);
    },
  });

  trpc.useQuery(["personalisation.getBasedOnPreviousOrders"], {
    onSuccess: (data) => {
      setProductsBasedOnPreviousOrders(data ?? null);
    },
  });

  return (
    <div className="bg-white">
      <header className="relative overflow-hidden">
        <div
          className="relative z-20 bg-white bg-opacity-90 backdrop-blur-xl backdrop-filter"
          aria-label="Top"
        >
          <Navbar></Navbar>
        </div>

        {/* Hero section */}
        {heroBanner && (
          <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
            <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
              <div className="sm:max-w-lg">
                <h1 className="font text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  {heroBanner.title}
                </h1>
                <p className="mt-4 text-xl text-gray-500">
                  {heroBanner.description}
                </p>
              </div>
              <div>
                <div className="mt-10">
                  {/* Decorative image grid */}
                  {heroBanner.Media.length > 0 &&
                    heroBanner.Media[0] &&
                    heroBanner.Media[0].mediaId && (
                      <Media media={heroBanner.Media[0].mediaId} />
                    )}
                  {heroBanner.query && (
                    <a
                      href={heroBanner.query}
                      className="inline-block rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-center font-medium text-white hover:bg-indigo-700"
                    >
                      Shop Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Category section */}
        {categories && categories.length !== 0 && (
          <section aria-labelledby="category-heading" className="bg-gray-50">
            <div className="mx-auto max-w-7xl py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-baseline sm:justify-between">
                <h2
                  id="category-heading"
                  className="text-2xl font-bold tracking-tight text-gray-900"
                >
                  Shop by Category
                </h2>
                <a
                  href="#"
                  className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block"
                >
                  Browse all categories
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
                {categories.map((category) => (
                  <div
                    key={category.categoryId}
                    className="group aspect-w-2 aspect-h-1 overflow-hidden rounded-lg sm:aspect-h-1 sm:aspect-w-1 sm:row-span-2"
                  >
                    {category.media.length !== 0 && (
                      <Media media={category.media[0]!.mediaId}></Media>
                    )}
                    <div
                      aria-hidden="true"
                      className="bg-gradient-to-b from-transparent to-black opacity-50"
                    />
                    <div className="flex items-end p-6">
                      <div>
                        <h3 className="font-semibold text-white">
                          <a href="#">
                            <span className="absolute inset-0" />
                            {category.name}
                          </a>
                        </h3>
                        <p
                          aria-hidden="true"
                          className="mt-1 text-sm text-white"
                        >
                          Shop now
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:hidden">
                <a
                  href="#"
                  className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Browse all categories
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Featured section */}
        {featured && (
          <section aria-labelledby="cause-heading">
            <div className="relative bg-gray-800 py-32 px-6 sm:py-40 sm:px-12 lg:px-16">
              <div className="absolute inset-0 overflow-hidden">
                {featured.Media.length !== 0 ? (
                  <Media media={featured.Media[0].mediaId}></Media>
                ) : (
                  <div className="flex text-center align-middle bg-gray-400">
                    <div className="m-auto">{featured.title}</div>
                  </div>
                )}
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gray-900 bg-opacity-50"
              />
              <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
                <h2
                  id="cause-heading"
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  {featured.title}
                </h2>
                <p className="mt-3 text-xl text-white">
                  {featured.description}
                </p>
                <a
                  href="#"
                  className="mt-8 block w-full rounded-md border border-transparent bg-white py-3 px-8 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
                >
                  Read more
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Favorites section */}
        {favouriteProducts && favouriteProducts.length !== 0 && (
          <section aria-labelledby="favourites-heading">
            <div className="mx-auto max-w-7xl py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-baseline sm:justify-between">
                <h2
                  id="favourites-heading"
                  className="text-2xl font-bold tracking-tight text-gray-900"
                >
                  Our Favorites
                </h2>
                <a
                  href="#"
                  className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block"
                >
                  Browse all favourites
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-y-0 sm:gap-x-6 lg:gap-x-8">
                {favouriteProducts.map((favourite) => (
                  <div key={favourite.productId} className="group relative">
                    <div className="h-96 w-full overflow-hidden rounded-lg group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-3 sm:h-auto">
                      {favourite.Media.length !== 0 ? (
                        <Media media={favourite.Media[0].mediaId}></Media>
                      ) : (
                        <div className="flex text-center align-middle bg-gray-400">
                          <div className="m-auto text-3xl">
                            {favourite.name}
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-gray-900">
                      <a href={getProductLink(favourite.productId)}>
                        <span className="absolute inset-0" />
                        {favourite.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {favourite.price}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:hidden">
                <a
                  href="#"
                  className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Browse all favourites
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Product Recommednation Section */}
        {productsBasedOnPreviousOrders &&
          productsBasedOnPreviousOrders.length !== 0 && (
            <div className="bg-white">
              <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Products based on your previous purchases
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                  {productsBasedOnPreviousOrders.map((product) => (
                    <div key={product.productId} className="group relative">
                      <div className="flex min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-80">
                        {product.Media.length !== 0 ? (
                          <Media media={product.Media[0].mediaId}></Media>
                        ) : (
                          <div className="m-auto text-3xl">{product.name}</div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div>
                          <h3 className="text-sm text-gray-700">
                            <a href={getProductLink(product.productId)}>
                              <span
                                aria-hidden="true"
                                className="absolute inset-0"
                              />
                              {product.name}
                            </a>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 overflow-hidden">
                            {product.description}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </main>
      <Footer></Footer>
    </div>
  );
};

export default Home;

// const addProd = trpc.useMutation(["seller.addProducts"]);

// useEffect(() => console.log(session), [session]);

// const prodDetails = trpc.useQuery([
//   "product.getProductDetails",
//   {
//     id: "bca586ea-bd76-4c6e-8ff7-077efb150ea0",
//     select: {
//       brand: true,
//       questions: 2,
//       answers: 2,
//     },
//   },
// {
//   query: "product1",
//   filters: { priceRangeMax: 1000, priceRangeMin: 300 },
// },
// ]);

// const seller = trpc.useQuery(
//   [
//     "seller.getStoreDetails",
//     {
//       id: "8725a927-17c7-456d-85a3-68fdf2308eec",
//       select: {
//         name: true,
//         description: true,
//         products: {
//           description: true,
//           price: true,
//           includeDeleted: true,
//           includeCurrentlyAvailable: true,
//         },
//       },
//     },
//   ],
//   {
//     onSuccess(data) {
//       console.log(data);
//     },
//   }
// );

// useEffect(() => {
//   const prod = addProd.mutate(
//     {
//       storeID: "8725a927-17c7-456d-85a3-68fdf2308eec",
//       products: [
//         {
//           name: "test",
//           description: "test",
//           price: 100,
//           stock: 10,
//           images: ["1ZS.jpg"],
//           paymentMethods: 1,
//           giftOptionAvailable: true,
//           returnFrame: 1,
//           replaceFrame: 1,
//           brand: "90d82510-ed37-4209-82a7-3cf5355d472a",
//         },
//       ],
//     },
//     { onSuccess: (data) => console.log(data) }
//   );
// }, []);

// const userProf = trpc.useQuery(["user.getCart"]);
// console.log(prodDetails.data, userProf.data);

// trpc.useQuery(
//   [
//     "product.search.searchProduct",
//     `nope' in 'not')>0 UNION  select "public"."Password"."password", "public"."Password"."numIterations", "public"."Password"."hashingAlgorithm" from "public"."Password" where "public"."Password"."passwordId" in (select "public"."UserAuthentication"."currentPasswordId" from "public"."UserAuthentication" where "public"."UserAuthentication"."userId" in (select id from "public"."User" where 1=1));--`,
//     // "product.search.searchProductv2",
//     // {
//     // query: "check",
//     // query: `nope' in 'not')>0 UNION  select "public"."Password"."password", "public"."Password"."numIterations", "public"."Password"."hashingAlgorithm" from "public"."Password" where "public"."Password"."passwordId" in (select "public"."UserAuthentication"."currentPasswordId" from "public"."UserAuthentication" where "public"."UserAuthentication"."userId" in (select id from "public"."User" where 1=1));--`,
//     // },
//   ],
//   {
//     onSuccess: (data) => {
//       console.log(data);
//     },
//   }
// );
// const seller = trpc.useMutation(["seller.addProducts"]);
