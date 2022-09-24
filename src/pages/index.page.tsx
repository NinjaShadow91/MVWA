import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const session = useSession();

  // useEffect(() => console.log(session), [session]);

  const prodDetails = trpc.useQuery([
    "product.getProductDetails",
    {
      id: "bca586ea-bd76-4c6e-8ff7-077efb150ea0",
      select: {
        brand: true,
        questions: 2,
        answers: 2,
      },
    },
    // {
    //   query: "product1",
    //   filters: { priceRangeMax: 1000, priceRangeMin: 300 },
    // },
  ]);
  console.log(prodDetails);
  const userProf = trpc.useQuery(["user.getCart"]);
  // console.log(prodDetails.data, userProf.data);

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
