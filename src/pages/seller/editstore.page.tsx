import type { NextPage } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { trpc } from "../../utils/trpc";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const EditStore: NextPage = () => {
  const router = useRouter();
  const trpcEditStore = trpc.useMutation(["seller.updateStore"]);
  const storeName = useRef("");
  const storeDescription = useRef("");
  const storeAddress = useRef({
    country: "",
    city: "",
    state: "",
    addressLine1: "",
    zipcode: "",
  });
  const storeEmail = useRef("");
  const [storeId, setStoreId] = useState(router.query.storeId as string);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (router.isReady) {
      setStoreId(router.query.id as string);
    }
  }, [router]);

  trpc.useQuery(["seller.getStoreDetails", storeId], {
    enabled: !!storeId,
    onSuccess: (store) => {
      storeName.current = store.name;
      storeDescription.current = store.description;
      if (store.Addresses.length > 0 && store.Addresses[0]) {
        storeAddress.current.addressLine1 = store.Addresses[0].line1;
        storeAddress.current.city = store.Addresses[0].City.name;
        storeAddress.current.state = store.Addresses[0].City.State.identifier;

        const codeToCountryName = new Map<string, string>([
          ["US", "United States"],
          ["CA", "Canada"],
          ["MX", "Mexico"],
          ["AU", "Australia"],
          ["NZ", "New Zealand"],
          ["GB", "United Kingdom"],
          ["IN", "India"],
        ]);
        if (
          codeToCountryName.has(store.Addresses[0].City.State.Country.code) ===
          true
        ) {
          storeAddress.current.country =
            codeToCountryName.get(store.Addresses[0].City.State.Country.code) ??
            "";
        } else {
          storeAddress.current.country =
            store.Addresses[0].City.State.Country.code;
        }
        console.log(storeAddress.current.country);
        storeAddress.current.zipcode = store.Addresses[0].zipcode;
      }
      const emailTemp = store.Contacts.filter(
        (c) => c.ContactType?.name === "storeRegEmail"
      )[0]?.contact;
      storeEmail.current = emailTemp ?? "";
      setStatus("loaded");
    },
    onError: (err) => {
      console.log(err);
    },
  });

  function updateStore() {
    trpcEditStore.mutate(
      {
        id: storeId,
        store: {
          name: storeName.current,
          description: storeDescription.current,
          address: storeAddress.current,
          contactEmail: storeEmail.current,
          tags: [],
          media: [],
        },
      },
      {
        onSuccess() {
          alert("Store updated sucessfully.");
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
  } else {
    return (
      <>
        <Navbar></Navbar>
        <main className="mr-20 ml-20 mb-10 p-10">
          <h2 className="text-3xl font-bold  text-center">Edit Store</h2>
          <form
            className="space-y-8 divide-y divide-gray-200"
            autoComplete="off"
          >
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Store Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This information will be displayed publicly so be careful
                    what you share.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="storename"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Store Name
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="storename"
                        id="storename"
                        defaultValue={storeName.current}
                        onChange={(e) => (storeName.current = e.target.value)}
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="about"
                      className="block text-sm font-medium text-gray-700"
                    >
                      About
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="about"
                        name="about"
                        defaultValue={storeDescription.current}
                        onChange={(e) => {
                          storeDescription.current = e.target.value;
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
                      Cover photo
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

              <div className="pt-8">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Contact Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Use a permanent address where you can receive mail.
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={storeEmail.current}
                        autoComplete="email"
                        onChange={(e) => (storeEmail.current = e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <div className="mt-1">
                      <select
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        defaultValue={storeAddress.current.country}
                        onChange={(e) =>
                          (storeAddress.current.country = e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value=""></option>
                        <option>India</option>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="street-address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Street address
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="street-address"
                        id="street-address"
                        autoComplete="street-address"
                        defaultValue={storeAddress.current.addressLine1}
                        onChange={(e) => {
                          storeAddress.current.addressLine1 = e.target.value;
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="city"
                        id="city"
                        defaultValue={storeAddress.current.city}
                        onChange={(e) => {
                          storeAddress.current.city = e.target.value;
                        }}
                        autoComplete="address-level2"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State / Province
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="region"
                        id="region"
                        autoComplete="address-level1"
                        defaultValue={storeAddress.current.state}
                        onChange={(e) => {
                          storeAddress.current.state = e.target.value;
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="postal-code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ZIP / Postal code
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="postal-code"
                        id="postal-code"
                        defaultValue={storeAddress.current.zipcode}
                        autoComplete="postal-code"
                        onChange={(e) => {
                          storeAddress.current.zipcode = e.target.value;
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
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
                  onClick={() => updateStore()}
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

export default EditStore;
