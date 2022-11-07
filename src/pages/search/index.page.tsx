import { Product } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { trpc } from "../../utils/trpc";
import { getProductLink, Media } from "../utils/utils";

export default function SearchPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[] | null>(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (router.isReady) {
      if (
        router.query.searchQuery &&
        typeof router.query.searchQuery === "string"
      ) {
        setSearchQuery(router.query.searchQuery);
      } else {
        setSearchQuery("");
      }
    }
  }, [router]);

  trpc.useQuery(["product.search.searchProduct", { query: searchQuery }], {
    // trpc.useQuery(["product.search.searchProductv1", searchQuery], {
    enabled: !!searchQuery,
    onSuccess: (data) => {
      setProducts(data);
      console.log(data);
      setStatus("success");
    },
    onError: () => {
      setStatus("error");
    },
  });

  if (status === "loading") {
    return <div className="">Loading...</div>;
  }

  return (
    <div className="bg-white">
      <Navbar searchQueryP={searchQuery}></Navbar>
      <div className="mx-auto max-w-7xl overflow-hidden py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {products && products.length > 0 ? (
            products.map((product) => (
              <a
                key={product.productId}
                href={getProductLink(product.productId)}
                className="group text-sm"
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                  <div className="h-full w-full object-cover object-center">
                    {product.Media && (
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
      <Footer></Footer>
    </div>
  );
}
