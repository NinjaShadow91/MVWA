import type { NextPage } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { trpc } from "../../utils/trpc";
import {
  getAddProductLink,
  getProductEditLink,
  getStoreEditLink,
  Media,
} from "../utils/utils";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const StorePage: NextPage = () => {
  const router = useRouter();
  const [storeId, setStoreId] = useState(
    (router.query.storeId as string) ?? ""
  );
  const [store, setStore] = useState<any | null>(null);
  const [products, setProducts] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );

  useEffect(() => {
    if (router.isReady) {
      if (router.query.storeId && typeof router.query.storeId === "string") {
        setStoreId(router.query.storeId);
      }
    }
  }, [router]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setStatus("error");
  //   }, 10000);
  // }, []);

  trpc.useQuery(["store.getDetails", storeId], {
    enabled: !!storeId,
    onSuccess: (data) => {
      console.log(data);
      setStore(data);
      setStatus("success");
    },
    onError: (error) => {
      console.log(error);
      setStatus("error");
    },
  });

  trpc.useQuery(["store.getProducts", storeId], {
    enabled: !!storeId,
    onSuccess: (data) => {
      console.log(data);
      setProducts(data);
      setStatus("success");
    },
    onError: (error) => {
      setStatus("error");
      console.log(error);
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  } else if (status === "error") {
    return <div>Error</div>;
  } else if (status === "success") {
    return (
      <div className="bg-white">
        <Navbar></Navbar>
        <main>
          {/* card about store details  */}
          <div className="group relative">
            <div className="w-full min-h-80 bg-gray-100 overflow-hidden group-hover:opacity-75 lg:h-80 lg:w-full">
              {store.Media && store.Media.length !== 0 ? (
                <Media media={store.Media[0].meidaId}></Media>
              ) : (
                <div className="h-full min-w-screen object-cover object-center">
                  {/*Please upload a photo for better custoemr interaction  */}
                  <div className="h-full w-full object-cover object-center">
                    <svg
                      className="text-gray-300 min-w-screen h-12 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm0 3a1 1 0 100 2 1 1 0 000-2zm0 4a2 2 0 100 4 2 2 0 000-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      Please upload a photo for better customer interaction
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xl">
              <p className="mt-2 font-medium text-gray-900">
                Store Name: {store.name}
              </p>
              <p className="mt-2 font-medium text-gray-900">
                Store Description: {store.description}
              </p>
              {/* Edit store button */}
              <button
                type="button"
                onClick={() => {
                  router.push(getStoreEditLink(storeId));
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Store
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(getAddProductLink(storeId));
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Product
              </button>
            </div>
          </div>
          <div className="mx-auto max-w-7xl overflow-hidden py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
                Products
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <a
                    key={product.productId}
                    href={getProductEditLink(product.productId)}
                    className="group text-sm"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                      <div className="h-full w-full object-cover object-center">
                        {product.Media && product.Media.length !== 0 && (
                          <Media
                            key={product.Media[0].mediaId}
                            media={product.Media[0].mediaId}
                          ></Media>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-4 font-medium text-gray-900">
                      {product.name}
                    </h3>
                    {/* <p className="italic text-gray-500">{product.availability}</p>
              <p className="mt-2 font-medium text-gray-900">{product.price}</p> */}
                  </a>
                ))
              ) : (
                <div className="text-center">
                  <h3 className="text-2xl font-medium text-gray-900">
                    No products found
                  </h3>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer></Footer>
      </div>
    );
  } else {
    return <div>Error</div>;
  }
};

export default StorePage;
