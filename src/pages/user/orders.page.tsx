import {
  CheckIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { trpc } from "../../utils/trpc";
import { useState } from "react";
import { getOrderLink, getProductLink, Media } from "../utils/utils";
import { useRouter } from "next/router";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UserOrders() {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [reload, setReload] = useState(false);
  const [orderItems, setOrderItems] = useState<any | null>(null);
  const [orders, setOrders] = useState<any | null>();
  const [products, setProducts] = useState<any | null>();
  const [productsBasedOnPreviousOrders, setProductsBasedOnPreviousOrders] =
    useState<any | null>([]);
  trpc.useQuery(["order.getOrders", {}], {
    onSuccess: (data) => {
      // console.log(data);
      setOrderItems(data?.OrderItems.map((item) => item.productId));
      setOrders(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  trpc.useQuery(["product.getSKUsDetails", { productSKUIds: orderItems }], {
    enabled: !!orderItems,
    onSuccess: (data) => {
      console.log(data, "sku");
      setProducts(data);
      setStatus("success");
      setReload(!reload);
    },
    onError: (err) => {
      console.log(err);
    },
  });
  trpc.useQuery(["personalisation.getBasedOnPreviousOrders"], {
    onSuccess: (data) => {
      setProductsBasedOnPreviousOrders(data ?? null);
    },
  });

  function productMediaPresent(productId: string) {
    return (
      products?.filter((product) => product.productSKUId === productId)[0]
        ?.Media?.length != 0
    );
  }

  function getProductMediaId(productId: string, i: number) {
    return products?.filter((product) => product.productSKUId === productId)[0]
      ?.Media[i]?.mediaId;
  }

  function getProductName(productId: string) {
    return products?.filter((product) => product.productSKUId === productId)[0]
      ?.skuName;
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  return (
    <div className="bg-white">
      <Navbar></Navbar>

      <main className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Your Orders
        </h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="orders-heading" className="lg:col-span-7">
            <h2 id="orders-heading" className="sr-only">
              Ordered Items
            </h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 border-t border-b border-gray-200"
            >
              {orders &&
                orders.OrderItems &&
                orders.OrderItems.length !== 0 &&
                orders.OrderItems.map((product) => (
                  <li key={product.id} className="flex py-6 sm:py-10">
                    <div className="w-2/5">
                      {productMediaPresent(product.productId) && (
                        <Media
                          media={getProductMediaId(product.productId, 0)}
                        ></Media>
                      )}
                    </div>
                    {/* <a
                      href={getOrderLink(product.orderItemId)}
                      className="font-medium text-gray-700 hover:text-gray-800"
                    > */}
                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              Name:{getProductName(product.productId)}
                            </h3>
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            Price: {product.amount}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            Quantity: {product.quantity}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-900"></p>
                          Status: {product.OrderStatus.name}
                        </div>
                      </div>
                    </div>
                    {/* </a> */}
                  </li>
                ))}
            </ul>
          </section>
        </div>

        {/* Related products */}
        {productsBasedOnPreviousOrders &&
          productsBasedOnPreviousOrders.length != 0 && (
            <section aria-labelledby="related-heading" className="mt-24">
              <h2
                id="related-heading"
                className="text-lg font-medium text-gray-900"
              >
                You may also like&hellip;
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {productsBasedOnPreviousOrders.map((product) => (
                  <div key={product.id} className="group relative">
                    <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md group-hover:opacity-75 lg:aspect-none lg:h-80">
                      {product.Media && product.Media.length > 0 && (
                        <Media
                          key={product.productId}
                          media={product.Media[0].mediaId}
                        ></Media>
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
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
      </main>

      <Footer></Footer>
    </div>
  );
}
