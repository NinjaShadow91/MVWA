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
import {
  getProductLink,
  getProductDescriptionSecure,
  Media,
} from "../utils/utils";
import { useRouter } from "next/router";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function UserCart() {
  const router = useRouter();
  const trpcRemoveProductFromCart = trpc.useMutation("cart.removeItem");
  const trpcCheckout = trpc.useMutation("cart.checkout");
  const [reload, setReload] = useState(false);
  const [cartItems, setCartItems] = useState<any | null>(null);
  const [cart, setCart] = useState<any | null>();
  const [products, setProducts] = useState<any | null>();
  const [deliveryEstimate, setDeliveryEstimate] = useState(0);
  const [taxEstimate, setTaxEstimate] = useState(0);
  const [productsBasedOnPreviousOrders, setProductsBasedOnPreviousOrders] =
    useState<any | null>([]);
  trpc.useQuery(["cart.getCart", {}], {
    onSuccess: (data) => {
      setCartItems(data.Items.map((item) => item.productId));
      setCart(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  trpc.useQuery(["product.getProductSKUsDetails", { productIds: cartItems }], {
    enabled: !!cartItems,
    onSuccess: (data) => {
      setProducts(data);
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

  trpc.useQuery(["cart.getDeliveryEstimate", {}], {
    enabled: !!cart,
    onSuccess: (data) => {
      setDeliveryEstimate(data);
    },
  });

  trpc.useQuery(["cart.getTaxEstimate", {}], {
    enabled: !!cart,
    onSuccess: (data) => {
      setTaxEstimate(data);
    },
  });

  function getCartItemQuantity(productId: string) {
    return cart?.Items.find((item) => item.productId === productId)?.quantity;
  }

  function getCartItemPrice(productId: string) {
    if (products)
      return products.find((item) => item.productId === productId).price;
  }

  function getCartTax() {
    return taxEstimate;
  }

  function getCartDelivery() {
    return deliveryEstimate;
  }

  function getCartItemsTotal() {
    let total = 0;
    if (cart) {
      cart.Items.forEach((item) => {
        total += getCartItemPrice(item.productId) * item.quantity;
      });
    }
    return total;
  }

  function getCartTotal() {
    return getCartItemsTotal() + taxEstimate + deliveryEstimate;
  }

  function removeItemFromCart(productId: string) {
    trpcRemoveProductFromCart.mutate(
      {
        productId: productId,
        quantity: getCartItemQuantity(productId),
      },
      {
        onSuccess: (data) => {
          console.log(data);
          setReload(!reload);
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );
  }

  function checkout() {
    trpcCheckout.mutate(
      {},
      {
        onSuccess: (data) => {
          console.log(data);
          router.push("http://localhost:3000/user/order/all");
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );
  }

  return (
    <div className="bg-white">
      <Navbar></Navbar>

      <main className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>

        <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 border-t border-b border-gray-200"
            >
              {products &&
                products.length !== 0 &&
                products.map((product) => (
                  <li key={product.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      {product.Media && product.Media.length !== 0 && (
                        <Media media={product.Media[0].mediaId}></Media>
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <a
                                href={getProductLink(product.productId)}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {product.name}
                              </a>
                            </h3>
                          </div>
                          <div className="mt-1 flex text-sm">
                            <p className="text-gray-500">
                              {getProductDescriptionSecure(product.description)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {product.price}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            Quantity: {getCartItemQuantity(product.productId)}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <div className="absolute top-0 right-0">
                            <button
                              onClick={() =>
                                removeItemFromCart(product.productId)
                              }
                              type="button"
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Remove</span>
                              <XMarkIconMini
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                        {product.stock >=
                        getCartItemQuantity(product.productId) ? (
                          <CheckIcon
                            className="h-5 w-5 flex-shrink-0 text-green-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <ClockIcon
                            className="h-5 w-5 flex-shrink-0 text-gray-300"
                            aria-hidden="true"
                          />
                        )}

                        <span>
                          {product.stock >=
                          getCartItemQuantity(product.productId)
                            ? "In stock"
                            : `Not available currently`}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </section>

          {/* Order summary */}
          {cartItems && cartItems.length !== 0 ? (
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2
                id="summary-heading"
                className="text-lg font-medium text-gray-900"
              >
                Order summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {getCartItemsTotal()}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>
                    <a
                      href="#"
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Learn more about how shipping is calculated
                      </span>
                      <QuestionMarkCircleIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {getCartDelivery()}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex text-sm text-gray-600">
                    <span>Tax estimate</span>
                    <a
                      href="#"
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Learn more about how tax is calculated
                      </span>
                      <QuestionMarkCircleIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {getCartTax()}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Order total
                  </dt>
                  <dd className="text-base font-medium text-gray-900">
                    {getCartTotal()}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => checkout()}
                  className="w-full rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                >
                  Checkout
                </button>
              </div>
            </section>
          ) : (
            <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
              <h2
                id="summary-heading"
                className="text-lg font-medium text-gray-900"
              >
                Your cart is empty
              </h2>
            </div>
          )}
        </form>

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
