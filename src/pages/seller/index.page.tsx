import type { NextPage } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { trpc } from "../../utils/trpc";
import { getOpenStoreLink, getStoreLink, Media } from "../utils/utils";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const SellerPage: NextPage = () => {
  const router = useRouter();
  const user = useSession();
  const [stores, setStores] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );

  trpc.useQuery(["seller.getAllStoresBySeller", {}], {
    onSuccess: (data) => {
      console.log(data);
      setStores(data);
      setStatus("success");
    },
    onError: (error) => {
      console.log(error);
      setStatus("error");
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
          <div className="mx-auto max-w-7xl overflow-hidden py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
                Stores
              </h2>
            </div>
            {/* Button to add store */}
            <div className="">
              <button
                type="button"
                className="inline-flex m-5 items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  router.push(getOpenStoreLink());
                }}
              >
                Open New Store
              </button>
            </div>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {stores && stores.length > 0 ? (
                stores.map((store) => (
                  <a
                    key={store.storeId}
                    href={getStoreLink(store.storeId)}
                    className="group text-sm"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                      <div className="h-full w-full object-cover object-center">
                        {store.Media && store.Media.length !== 0 && (
                          <Media
                            key={store.Media[0].mediaId}
                            media={store.Media[0].mediaId}
                          ></Media>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-4 font-medium text-gray-900">
                      {store.name}
                    </h3>
                    {/* <p className="italic text-gray-500">{store.availability}</p>
              <p className="mt-2 font-medium text-gray-900">{store.price}</p> */}
                  </a>
                ))
              ) : (
                <div className="text-center">
                  <h3 className="text-2xl font-medium text-gray-900">
                    No stores found
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

export default SellerPage;
