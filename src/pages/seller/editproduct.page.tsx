import type { NextPage } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { trpc } from "../../utils/trpc";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const AddProduct: NextPage = () => {
  const router = useRouter();
  const trpcUpdateProduct = trpc.useMutation(["seller.updateProduct"]);
  const trpcUpdateProductInventory = trpc.useMutation([
    "product.inventory.seller.updateProductInventory",
  ]);
  const [status, setStatus] = useState("loading");
  const [productId, setProductId] = useState(router.query.id as string);
  const [productInventoryId, setProductInventoryId] = useState("");
  const productName = useRef("");
  const productDescription = useRef("");
  const productPrice = useRef(1);
  const productStock = useRef(1);
  //   const productPaymentMethod = useRef([]);
  const productGiftOftionAvailable = useRef(false);
  const productReplaceFrame = useRef(0);
  const productReturnFrame = useRef(0);

  useEffect(() => {
    if (router.isReady) {
      setProductId(router.query.id as string);
    }
  }, [router]);

  trpc.useQuery(["product.getProductDetails", { productId }], {
    enabled: !!productId,
    onSuccess: (data) => {
      productName.current = data.name;
      productDescription.current = data.description;
      productGiftOftionAvailable.current = data.giftOptionAvailable;
      productReplaceFrame.current = data.replaceFrame;
      productReturnFrame.current = data.returnFrame;
      setProductInventoryId(data.productInventoryId as string);
    },
    onError: (err) => {
      setStatus("error");
      console.log(err);
    },
  });

  trpc.useQuery(
    ["product.inventory.getProductInventory", { productInventoryId }],
    {
      enabled: !!productInventoryId,
      onSuccess: (data) => {
        productPrice.current = data.price;
        productStock.current = data.stock;
        setStatus("ready");
      },
      onError: (err) => {
        setStatus("error");
        console.log(err);
      },
    }
  );

  function editProduct() {
    console.log("edit product", productId);
    trpcUpdateProductInventory.mutate(
      {
        productInventoryId: productInventoryId,
        price: productPrice.current,
        stock: productStock.current,
        comingSoon: 0,
      },
      {
        onSuccess: (data) => {
          console.log("updated product inventory", data);
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );

    trpcUpdateProduct.mutate(
      {
        id: productId,
        product: {
          name: productName.current,
          description: productDescription.current,
          giftOptionAvailable: productGiftOftionAvailable.current,
          replaceFrame: productReplaceFrame.current,
          returnFrame: productReturnFrame.current,
          tags: [],
          images: [],
          details: [],
          technicalDetails: [],
        },
      },
      {
        onSuccess() {
          alert("Product added sucessfully.");
          console.log("success");
        },
        onError(err) {
          alert("Something went wrong.");
          console.log(err);
        },
      }
    );
  }

  if (status === "loading" || status === "loadedId") {
    return <div>Loading...</div>;
  } else if (status === "error") {
    return <div>Error</div>;
  } else {
    return (
      <>
        <Navbar></Navbar>
        <main className="mr-20 ml-20 mb-10 p-10">
          <h2 className="text-3xl font-bold  text-center">Edit Product</h2>
          <form
            className="space-y-8 divide-y divide-gray-200"
            autoComplete="off"
          >
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Product Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This information will be displayed publicly so be careful
                    what you share.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="productname"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product Name
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="productname"
                        id="productname"
                        defaultValue={productName.current}
                        onChange={(e) => (productName.current = e.target.value)}
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="productprice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product Price
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="productprice"
                        id="productprice"
                        defaultValue={productPrice.current}
                        onChange={(e) =>
                          (productPrice.current = parseFloat(e.target.value))
                        }
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="productstock"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product Stock
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="productstock"
                        id="productstock"
                        defaultValue={productStock.current}
                        onChange={(e) =>
                          (productStock.current = parseInt(e.target.value))
                        }
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="productReplaceFrame"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product Replace Frame(in days)
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="productReplaceFrame"
                        id="productReplaceFrame"
                        defaultValue={productReplaceFrame.current}
                        onChange={(e) =>
                          (productReplaceFrame.current = parseInt(
                            e.target.value
                          ))
                        }
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="productReturnFrame"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product Return Timeframe(in days)
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="productReturnFrame"
                        id="productReturnFrame"
                        defaultValue={productReturnFrame.current}
                        onChange={(e) =>
                          (productReturnFrame.current = parseInt(
                            e.target.value
                          ))
                        }
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="productGiftOftionAvailable"
                      className=" text-sm font-medium text-gray-700"
                    >
                      Gift Option Available
                    </label>
                    <input
                      type="checkbox"
                      name="productGiftOptionAvailable"
                      id="productGiftOptionAvailable"
                      defaultValue={
                        productGiftOftionAvailable.current ? "true" : "false"
                      }
                      onChange={(e) =>
                        (productGiftOftionAvailable.current =
                          e.target.value === "true" ? true : false)
                      }
                      className="ml-5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="about"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="about"
                        name="about"
                        defaultValue={productDescription.current}
                        onChange={(e) => {
                          productDescription.current = e.target.value;
                        }}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Write a few sentences about store.
                    </p>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="cover-photo"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Photo
                    </label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    router.push("http://localhost:3000/");
                  }}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => editProduct()}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </main>
        <Footer></Footer>
      </>
    );
  }
};

export default AddProduct;
