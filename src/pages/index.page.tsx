import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const session = useSession();

  useEffect(() => console.log(session), [session]);

  const prodDetails = trpc.useQuery([
    "product.searchProduct",
    // { id: "df940573-070a-4196-8d79-5a307e01c0e4" },
    {
      query: "product1",
      filters: { priceRangeMax: 1000, priceRangeMin: 300 },
    },
  ]);
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
